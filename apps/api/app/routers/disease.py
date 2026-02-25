"""Disease detection router endpoints – powered by Azure Custom Vision"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Request
from pydantic import BaseModel
from typing import Optional, Dict
import logging

from app.config import settings
from app.utils.model_loader import validate_image
from app.utils.weather_helper import fetch_current_weather
from app.utils.database import db

logger = logging.getLogger(__name__)
router = APIRouter()


class PredictionResponse(BaseModel):
    """Response model for disease prediction"""
    prediction: str
    confidence: float
    all_predictions: Dict[str, float]
    message: str = "Prediction successful"
    weather: Optional[Dict] = None


@router.post("/predict", response_model=PredictionResponse)
async def predict(
    request: Request,
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    farmer_id: Optional[str] = Form("demo_farmer")
):
    """
    Predict maize leaf disease from an uploaded image using Azure Custom Vision.

    Args:
        file: Image file to analyse (JPEG, PNG, GIF, BMP)
        latitude: Optional – used to fetch weather context
        longitude: Optional – used to fetch weather context

    Returns:
        Prediction results with confidence scores and optional weather info

    Raises:
        HTTPException: If the file is invalid or the Azure call fails
    """
    # --- Validate file type ---
    if not any(file.filename.lower().endswith(ext) for ext in settings.ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    file_bytes = await file.read()

    # --- Validate file size ---
    if len(file_bytes) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE / 1024 / 1024:.0f}MB"
        )

    # --- Validate image integrity ---
    try:
        if not validate_image(file_bytes):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid or supported image (JPEG, PNG, etc.)."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image validation error: {e}")
        raise HTTPException(
            status_code=400,
            detail="Could not process the uploaded file. Please ensure it is a valid image."
        )

    # --- Check predictor ---
    predictor = getattr(request.app, "predictor", None)
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Azure Custom Vision predictor is not available. Check server configuration."
        )

    logger.info(f"Processing image via Azure Custom Vision: {file.filename}")

    # --- Optional weather fetch ---
    weather_info = None
    if latitude is not None and longitude is not None:
        try:
            weather_info = fetch_current_weather(latitude, longitude)
        except Exception as e:
            logger.error(f"Weather fetch error: {e}")

    # --- Azure prediction ---
    try:
        result = predictor.classify_image_bytes(file_bytes)
    except Exception as e:
        logger.error(f"Azure prediction error: {e}")
        raise HTTPException(status_code=502, detail=f"Azure prediction failed: {e}")

    # --- Success - Persist and Respond ---
    # Save to scan history (if coordinates provided)
    if latitude is not None and longitude is not None:
        try:
            db.save_scan(
                farmer_id=farmer_id,
                latitude=latitude,
                longitude=longitude,
                prediction=result["prediction"],
                confidence=result["confidence"],
                all_predictions=result["all_predictions"],
                weather_data=weather_info
            )
            logger.info(f"Scan persisted for farmer: {farmer_id}")
        except Exception as e:
            logger.error(f"Failed to persist scan history: {e}")

    return {
        **result,
        "message": "Prediction successful",
        "weather": weather_info
    }


@router.post("/batch-predict")
async def batch_predict(request: Request, files: list[UploadFile] = File(...)):
    """
    Predict multiple leaf images at once using Azure Custom Vision.

    Args:
        files: List of image files to analyse

    Returns:
        List of prediction results
    """
    predictor = getattr(request.app, "predictor", None)
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Azure Custom Vision predictor is not available."
        )

    results = []
    for file in files:
        try:
            file_bytes = await file.read()

            if not validate_image(file_bytes):
                results.append({"filename": file.filename, "error": "Invalid image"})
                continue

            result = predictor.classify_image_bytes(file_bytes)
            results.append({"filename": file.filename, **result})

        except Exception as e:
            logger.error(f"Error processing {file.filename}: {e}")
            results.append({"filename": file.filename, "error": str(e)})

    return {"results": results}


@router.get("/classes")
async def get_classes():
    """Get the known disease class names"""
    return {
        "classes": settings.CLASS_NAMES,
        "num_classes": len(settings.CLASS_NAMES)
    }
