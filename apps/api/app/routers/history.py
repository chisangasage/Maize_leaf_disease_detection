from fastapi import APIRouter, Request, HTTPException, Query
from typing import List, Optional, Dict
from app.utils.database import db
from app.utils.satellite import nasa_client
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/scans")
async def get_scan_history(farmer_id: Optional[str] = None, limit: int = 50):
    """Fetch scan history for a specific farmer or global results."""
    try:
        history = db.get_history(farmer_id=farmer_id, limit=limit)
        return {"status": "ok", "count": len(history), "data": history}
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch scan history")

@router.get("/satellite/assets")
async def get_satellite_info(lat: float, lon: float, date: Optional[str] = None):
    """Get metadata about NASA satellite imagery available for a location."""
    info = nasa_client.get_asset_info(lat, lon, date)
    if not info:
        raise HTTPException(status_code=404, detail="No satellite assets found for this location/date")
    return {"status": "ok", "data": info}

@router.get("/satellite/image-url")
async def get_satellite_image_url(lat: float, lon: float, date: Optional[str] = None):
    """Retrieve the URL for a NASA Earth Observatory satellite image."""
    url = nasa_client.get_imagery_url(lat, lon, date)
    return {"status": "ok", "url": url}

@router.post("/farms")
async def save_farm_boundary(request: Request):
    """Save a farm boundary GeoJSON for a farmer."""
    try:
        data = await request.json()
        farmer_id = data.get("farmer_id")
        farm_name = data.get("farm_name", "Main Farm")
        boundary = data.get("boundary")
        
        if not farmer_id or not boundary:
            raise HTTPException(status_code=400, detail="farmer_id and boundary are required")
            
        success = db.save_farm(farmer_id, farm_name, boundary)
        if success:
            return {"status": "ok", "message": "Farm boundary saved"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save farm boundary")
    except Exception as e:
        logger.error(f"Error saving farm: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/farms/{farmer_id}")
async def get_farms(farmer_id: str):
    """Retrieve all farm boundaries for a farmer."""
    farms = db.get_farms(farmer_id)
    return {"status": "ok", "data": farms}
