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
    
    # Model settings
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./Maize_Disease_Model-20260107T060943Z-1-001/Maize_Disease_Model/maize_disease_cnn.h5")
    MODEL_NAME: str = "maize_disease_cnn"
    INPUT_SIZE: int = 224
    NUM_CLASSES: int = 3  # Adjust based on your model
    CLASS_NAMES: List[str] = [
        "Healthy",
        "Gray Leaf Spot",
        "Northern Corn Leaf Blight"
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
