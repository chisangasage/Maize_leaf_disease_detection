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


def fetch_current_weather(latitude: float, longitude: float) -> Optional[Dict]:
    """Fetch current weather from Open-Meteo and return simplified dict

    Returns keys: temperature, humidity, precipitation, wind_speed, disease_risk
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

        logger.info(f"Fetched weather for lat={latitude}, lon={longitude}: temp={temp}°C, humidity={humidity}%, risk={disease_risk}")

        return {
            "temperature": temp,
            "humidity": humidity,
            "precipitation": precipitation,
            "wind_speed": wind_speed,
            "disease_risk": disease_risk,
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
