"""Weather router endpoints"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
import logging

from app.utils.weather_helper import fetch_current_weather

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/current")
async def get_current_weather(latitude: float, longitude: float):
    """Get current weather and disease risk for a location"""
    try:
        weather_data = fetch_current_weather(latitude, longitude)
        if weather_data:
            return {
                "status": "success",
                "data": weather_data
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch weather data")
    except Exception as e:
        logger.error(f"Weather endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forecast")
async def get_weather_forecast(
    latitude: float, 
    longitude: float, 
    days: int = Query(7, ge=1, le=14)
):
    """Get weather forecast (Placeholder)"""
    # For now, we'll return a message as the helper doesn't fully implement forecast yet
    return {
        "status": "success",
        "message": f"Forecast for {days} days at {latitude}, {longitude} is currently in development",
        "data": {
            "latitude": latitude,
            "longitude": longitude,
            "days": days
        }
    }

@router.get("/disease-risk-conditions")
async def get_disease_risk_conditions():
    """Get information about conditions that increase disease risk"""
    return {
        "status": "success",
        "data": {
            "high_risk": {
                "temperature_range": "20°C - 30°C",
                "humidity_threshold": "> 85%",
                "description": "Ideal conditions for rapid fungal growth and spore germination."
            },
            "moderate_risk": {
                "temperature_range": "18°C - 32°C",
                "humidity_threshold": "> 75%",
                "description": "Favorable conditions for disease development."
            },
            "additional_factors": [
                "Frequent rainfall (> 5mm)",
                "High leaf wetness duration",
                "Low wind speeds"
            ]
        }
    }
