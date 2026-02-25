"""
Configuration settings for FastAPI application
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Maize Disease Detection API"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:4000",
        "http://localhost:4001",
        "http://localhost:4002",
        "http://localhost:4003",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:4000",
        "http://127.0.0.1:4001",
        "http://127.0.0.1:4002",
        "http://127.0.0.1:4003",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]
    
    # Azure Custom Vision Prediction API settings
    AZURE_PREDICTION_KEY: str = os.getenv(
        "AZURE_PREDICTION_KEY",
        "2ZMZ5aM0jLhCqXwCROYFqEwhJub4rUvtsiuVNtuJVyOkypTGGUw8JQQJ99CBACYeBjFXJ3w3AAAIACOGj7D5"
    )
    AZURE_PREDICTION_ENDPOINT: str = os.getenv(
        "AZURE_PREDICTION_ENDPOINT",
        "https://maizediseases-prediction.cognitiveservices.azure.com/"
    )
    AZURE_PROJECT_ID: str = os.getenv(
        "AZURE_PROJECT_ID",
        "1fd7bed8-bf75-4d56-bfcf-af56222748f8"
    )
    AZURE_ITERATION_NAME: str = os.getenv("AZURE_ITERATION_NAME", "Iteration2")
    
    # NASA Satellite API settings
    NASA_API_KEY: str = os.getenv("NASA_API_KEY", "")

    # Known class names (for reference / fallback display)
    CLASS_NAMES: List[str] = [
        "Healthy",
        "Gray Leaf Spot",
        "Common Rust",
        "Northern Corn Leaf Blight",
        "Southern Rust",
        "Leaf Spot",
        "Streak Virus",
        "Blight"
    ]
    
    # File upload settings
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".gif", ".bmp"]
    UPLOAD_DIR: str = "./uploads"
    
    # Weather API settings
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    WEATHER_API_URL: str = "https://api.open-meteo.com/v1/forecast"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
