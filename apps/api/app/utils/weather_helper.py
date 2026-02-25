"""
Helpers for fetching weather from Open-Meteo and assessing disease risk
Uses the official openmeteo_requests Python client
"""
from typing import Optional, Dict
import logging
import requests_cache
from retry_requests import retry
import openmeteo_requests

logger = logging.getLogger(__name__)

# Setup the Open-Meteo API client with cache and retry on error
_cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
_retry_session = retry(_cache_session, retries=5, backoff_factor=0.2)
_openmeteo = openmeteo_requests.Client(session=_retry_session)


def get_location_name(latitude: float, longitude: float) -> Optional[str]:
    """Get location name from coordinates using Nominatim reverse geocoding"""
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=10"
        headers = {"User-Agent": "MaizeDiseaseApp/1.0"}
        response = _retry_session.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            address = data.get("address", {})
            return address.get("city") or address.get("town") or address.get("village") or address.get("county") or address.get("state")
        return None
    except Exception as e:
        logger.error(f"Reverse geocoding error: {e}")
        return None


def fetch_current_weather(latitude: float, longitude: float) -> Optional[Dict]:
    """Fetch current weather from Open-Meteo and return simplified dict

    Returns keys: temperature, humidity, precipitation, wind_speed, disease_risk, location_name
    """
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "rain", "wind_speed_10m"],
            "timezone": "auto",
        }

        responses = _openmeteo.weather_api(url, params=params)
        response = responses[0]

        current = response.Current()
        temp = current.Variables(0).Value()  # temperature_2m
        humidity = current.Variables(1).Value()  # relative_humidity_2m
        precipitation = current.Variables(2).Value()  # precipitation
        wind_speed = current.Variables(4).Value()  # wind_speed_10m

        disease_risk = assess_disease_risk(temp, humidity, precipitation)
        location_name = get_location_name(latitude, longitude)

        logger.info(f"Fetched weather for {location_name} (lat={latitude}, lon={longitude}): temp={temp}°C, humidity={humidity}%, risk={disease_risk}")

        return {
            "temperature": temp,
            "humidity": humidity,
            "precipitation": precipitation,
            "wind_speed": wind_speed,
            "disease_risk": disease_risk,
            "location_name": location_name,
            "latitude": latitude,
            "longitude": longitude
        }

    except Exception as e:
        logger.error(f"Error fetching current weather: {e}")
        return None


def assess_disease_risk(temp: Optional[float], humidity: Optional[float], precipitation: Optional[float]) -> str:
    if temp is None or humidity is None:
        return "Unknown"

    risk_score = 0

    if 20 <= temp <= 30 and humidity > 85:
        risk_score += 3
    elif 18 <= temp <= 32 and humidity > 75:
        risk_score += 2

    if 15 <= temp <= 25 and humidity > 90:
        risk_score += 2

    if precipitation and precipitation > 5:
        risk_score += 1

    if risk_score >= 4:
        return "High"
    elif risk_score >= 2:
        return "Moderate"
    else:
        return "Low"
