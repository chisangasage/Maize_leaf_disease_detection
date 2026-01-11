"""Disease detection router endpoints"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form
from pydantic import BaseModel
from typing import Optional, Dict, List
import logging

from app.config import settings
from app.utils.model_loader import validate_image, predict_disease
from app.utils.weather_helper import fetch_current_weather

logger = logging.getLogger(__name__)
router = APIRouter()

class PredictionResponse(BaseModel):
    """Response model for disease prediction"""
    prediction: str
    confidence: float
    all_predictions: Dict[str, float]
    message: str = "Prediction successful"
    weather: Optional[Dict] = None

class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    disease_model_available: bool

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if disease detection model is loaded"""
    return {
        "status": "ok",
        "disease_model_available": True  # Will be updated based on app.model
    }

@router.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...), latitude: float | None = Form(None), longitude: float | None = Form(None)):
    """
    Predict maize leaf disease from uploaded image
    
    Args:
        file: Image file to analyze (JPEG, PNG, GIF, BMP)
    
    Returns:
        Prediction results with confidence scores
    
    Raises:
        HTTPException: If file is invalid or prediction fails
    """
    try:
        # Validate file type
        if not any(file.filename.lower().endswith(ext) for ext in settings.ALLOWED_EXTENSIONS):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )
        
        # Read file bytes
        file_bytes = await file.read()
        
        # Validate file size
        if len(file_bytes) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Validate image
        if not validate_image(file_bytes):
            raise HTTPException(
                status_code=400,
                detail="Invalid image file"
            )
        
        logger.info(f"Processing image: {file.filename}")
        
        # Optionally fetch weather for the provided coordinates
        weather_info = None
        if latitude is not None and longitude is not None:
            try:
                weather_info = fetch_current_weather(latitude, longitude)
            except Exception as e:
                logger.error(f"Weather fetch error: {e}")
                weather_info = None

        # Make prediction (pass actual model if available)
        result = predict_disease(
            None,  # In production, pass app.model
            file_bytes,
            settings.CLASS_NAMES,
            settings.INPUT_SIZE
        )

        # Combine model result with weather info (if available)
        response = {
            **result,
            "message": "Prediction successful",
        }

        if weather_info:
            response["weather"] = weather_info

        return response
    
    except HTTPException as e:
        raise e
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error processing prediction"
        )

@router.post("/batch-predict")
async def batch_predict(files: list[UploadFile] = File(...)):
    """
    Predict multiple leaf images at once
    
    Args:
        files: List of image files to analyze
    
    Returns:
        List of prediction results
    """
    results = []
    
    try:
        for file in files:
            try:
                file_bytes = await file.read()
                
                if not validate_image(file_bytes):
                    results.append({
                        "filename": file.filename,
                        "error": "Invalid image"
                    })
                    continue
                
                result = predict_disease(
                    None,
                    file_bytes,
                    settings.CLASS_NAMES,
                    settings.INPUT_SIZE
                )
                
                results.append({
                    "filename": file.filename,
                    **result
                })
            
            except Exception as e:
                logger.error(f"Error processing {file.filename}: {e}")
                results.append({
                    "filename": file.filename,
                    "error": str(e)
                })
        
        return {"results": results}
    
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error processing batch prediction"
        )

@router.get("/classes")
async def get_classes():
    """Get available disease classes"""
    return {
        "classes": settings.CLASS_NAMES,
        "num_classes": settings.NUM_CLASSES
    }
