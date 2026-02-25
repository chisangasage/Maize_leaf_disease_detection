import requests
import logging
from typing import Optional, Dict
from app.config import settings

logger = logging.getLogger(__name__)

class NASASatelliteClient:
    """Wrapper for NASA Earth Observation and Imagery APIs."""
    
    BASE_URL = "https://api.nasa.gov/planetary/earth/assets"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    def get_asset_info(self, lat: float, lon: float, date: Optional[str] = None) -> Optional[Dict]:
        """
        Get the date and location of the most recent Landsat satellite image 
        captured for the given coordinates.
        """
        params = {
            "lat": lat,
            "lon": lon,
            "dim": 0.1,  # zoom level approx
            "api_key": self.api_key
        }
        if date:
            params["date"] = date
            
        try:
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"NASA assets API returned {response.status_code}: {response.text}")
                return None
        except Exception as e:
            logger.error(f"Error fetching NASA asset info: {e}")
            return None

    def get_imagery_url(self, lat: float, lon: float, date: Optional[str] = None) -> Optional[str]:
        """
        Returns a URL to a satellite image for the given location using NASA's 
        Earth Observatory (Landsat) repository.
        """
        # Note: The 'earth/imagery' endpoint is similar but requires 'dim' and 'date'
        return f"https://api.nasa.gov/planetary/earth/imagery?lat={lat}&lon={lon}&dim=0.15&api_key={self.api_key}"

# Singleton instance
nasa_client = NASASatelliteClient(api_key=settings.NASA_API_KEY)
