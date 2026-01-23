"""
Maize Disease Detection API
FastAPI backend for serving CNN model and weather data
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import io
import numpy as np
from PIL import Image
import logging

from app.config import settings
from app.routers import disease, weather, health
from app.utils.model_loader import load_model

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Maize Disease Detection API",
    description="API for detecting maize leaf diseases using deep learning and weather data",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
@app.on_event("startup")
async def startup_event():
    """Load model when server starts"""
    logger.info("Starting FastAPI server...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info("Loading disease detection model...")

    # Allow skipping model load (useful for testing)
    skip = os.getenv("SKIP_MODEL_LOAD", "0")  # Changed default to 0 (try to load)
    if skip == "1":
        logger.info("SKIP_MODEL_LOAD=1 set; skipping model load (mock mode)")
        app.model = None
        return

    try:
        # Try to load model (will prefer ONNX over TensorFlow)
        app.model = load_model(settings.MODEL_PATH)
        if app.model is not None:
            logger.info("✅ Model loaded successfully!")
        else:
            logger.warning("⚠️ Model loading returned None, using mock predictions")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        logger.warning("⚠️ Falling back to mock predictions...")
        app.model = None

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup when server shuts down"""
    logger.info("Shutting down FastAPI server...")

# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint"""
    return {
        "status": "ok",
        "service": "Maize Disease Detection API",
        "version": "1.0.0"
    }

# Include routers
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(disease.router, prefix="/api/disease", tags=["Disease Detection"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather Data"])

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status": "error"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
