"""Weather data router endpoints"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
import logging
import httpx
from datetime import datetime

from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

class WeatherData(BaseModel):
    """Weather data model"""
    latitude: float
    longitude: float
    temperature: float
    humidity: Optional[float] = None
    precipitation: Optional[float] = None
    wind_speed: Optional[float] = None
    disease_risk: Optional[str] = None

class WeatherResponse(BaseModel):
    """Response model for weather data"""
    status: str
    data: WeatherData

@router.get("/current")
async def get_current_weather(
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude")
):
    """
    Get current weather data for a location
    
    Args:
        latitude: Location latitude
        longitude: Location longitude
    
    Returns:
        Current weather conditions
    """
    try:
        logger.info(f"Fetching weather for lat={latitude}, lon={longitude}")
        
        # Using Open-Meteo API (free, no API key required)
        async with httpx.AsyncClient() as client:
            response = await client.get(
                settings.WEATHER_API_URL,
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
                    "timezone": "auto"
                }
            )
            response.raise_for_status()
            
            data = response.json()
            current = data.get("current", {})
            
            # Assess disease risk based on conditions
            disease_risk = assess_disease_risk(
                temp=current.get("temperature_2m"),
                humidity=current.get("relative_humidity_2m"),
                precipitation=current.get("precipitation")
            )
            
            return {
                "status": "success",
                "data": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "temperature": current.get("temperature_2m"),
                    "humidity": current.get("relative_humidity_2m"),
                    "precipitation": current.get("precipitation"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "disease_risk": disease_risk
                }
            }
    
    except httpx.HTTPError as e:
        logger.error(f"Weather API error: {e}")
        raise HTTPException(
            status_code=503,
            detail="Error fetching weather data"
        )
    
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error processing weather request"
        )

@router.get("/forecast")
async def get_weather_forecast(
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude"),
    days: int = Query(7, ge=1, le=16, description="Number of forecast days")
):
    """
    Get weather forecast for a location
    
    Args:
        latitude: Location latitude
        longitude: Location longitude
        days: Number of days to forecast (1-16)
    
    Returns:
        Weather forecast data
    """
    try:
        logger.info(f"Fetching forecast for lat={latitude}, lon={longitude}, days={days}")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                settings.WEATHER_API_URL,
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,wind_speed_10m_max",
                    "forecast_days": days,
                    "timezone": "auto"
                }
            )
            response.raise_for_status()
            
            data = response.json()
            daily = data.get("daily", {})
            
            # Build forecast with disease risk
            forecast_days = []
            for i in range(len(daily.get("time", []))):
                temp_max = daily["temperature_2m_max"][i]
                humidity = daily["relative_humidity_2m_max"][i]
                precipitation = daily["precipitation_sum"][i]
                
                forecast_days.append({
                    "date": daily["time"][i],
                    "temp_max": temp_max,
                    "temp_min": daily["temperature_2m_min"][i],
                    "precipitation": precipitation,
                    "humidity": humidity,
                    "wind_speed": daily["wind_speed_10m_max"][i],
                    "disease_risk": assess_disease_risk(temp_max, humidity, precipitation)
                })
            
            return {
                "status": "success",
                "location": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "forecast": forecast_days
            }
    
    except httpx.HTTPError as e:
        logger.error(f"Weather API error: {e}, status: {e.response.status_code if hasattr(e, 'response') else 'unknown'}, response: {e.response.text if hasattr(e, 'response') else 'no response'}")
        raise HTTPException(status_code=503, detail="Error fetching forecast data")
    
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error processing forecast request")

def assess_disease_risk(
    temp: Optional[float],
    humidity: Optional[float],
    precipitation: Optional[float]
) -> str:
    """
    Assess disease risk based on weather conditions
    
    Factors:
    - Gray Leaf Spot: Thrives in warm (20-30°C) and humid (>85%) conditions
    - Northern Corn Leaf Blight: Prefers cool (15-25°C) and wet conditions
    
    Args:
        temp: Temperature in Celsius
        humidity: Humidity percentage
        precipitation: Precipitation in mm
    
    Returns:
        Risk level: "Low", "Moderate", "High"
    """
    if temp is None or humidity is None:
        return "Unknown"
    
    risk_score = 0
    
    # Gray Leaf Spot conditions
    if 20 <= temp <= 30 and humidity > 85:
        risk_score += 3
    elif 18 <= temp <= 32 and humidity > 75:
        risk_score += 2
    
    # Northern Corn Leaf Blight conditions
    if 15 <= temp <= 25 and humidity > 90:
        risk_score += 2
    
    # Precipitation increases risk
    if precipitation and precipitation > 5:
        risk_score += 1
    
    # Determine risk level
    if risk_score >= 4:
        return "High"
    elif risk_score >= 2:
        return "Moderate"
    else:
        return "Low"

@router.get("/disease-risk-conditions")
async def get_disease_risk_info():
    """Get information about disease risk conditions"""
    return {
        "diseases": [
            {
                "name": "Gray Leaf Spot",
                "optimal_conditions": {
                    "temperature": "20-30°C",
                    "humidity": ">85%",
                    "notes": "Warm and humid"
                }
            },
            {
                "name": "Northern Corn Leaf Blight",
                "optimal_conditions": {
                    "temperature": "15-25°C",
                    "humidity": ">90%",
                    "notes": "Cool and wet"
                }
            }
        ]
    }
