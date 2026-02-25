"""
Maize Disease Detection API
FastAPI backend for serving Azure Custom Vision predictions and weather data
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.routers import disease, weather, history
from app.utils.model_loader import create_azure_predictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Maize Disease Detection API",
    description="API for detecting maize leaf diseases using Azure Custom Vision and weather data",
    version="2.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialise Azure predictor on startup
@app.on_event("startup")
async def startup_event():
    """Initialise Azure Custom Vision predictor when server starts"""
    logger.info("Starting FastAPI server...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info("Initialising Azure Custom Vision predictor...")

    app.predictor = create_azure_predictor(
        prediction_key=settings.AZURE_PREDICTION_KEY,
        endpoint=settings.AZURE_PREDICTION_ENDPOINT,
        project_id=settings.AZURE_PROJECT_ID,
        iteration_name=settings.AZURE_ITERATION_NAME,
    )

    if app.predictor is not None:
        logger.info("✅ Azure Custom Vision predictor ready!")
    else:
        logger.error("❌ Failed to create Azure Custom Vision predictor. Check credentials in .env")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup when server shuts down"""
    logger.info("Shutting down FastAPI server...")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "status": "ok",
        "service": "Maize Disease Detection API",
        "version": "2.0.0"
    }

# Include routers
app.include_router(disease.router, prefix="/api/disease", tags=["Disease Detection"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather Data"])
app.include_router(history.router, prefix="/api/history", tags=["History & Satellite"])

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
