"""Health check router endpoints"""

from fastapi import APIRouter
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class HealthStatus(BaseModel):
    """Health check response model"""
    status: str
    service: str
    version: str

@router.get("", response_model=HealthStatus)
async def health_check():
    """Check if API is running"""
    return {
        "status": "ok",
        "service": "Maize Disease Detection API",
        "version": "1.0.0"
    }

@router.get("/ready")
async def readiness_check():
    """Readiness probe for Kubernetes/Docker"""
    return {
        "status": "ready",
        "timestamp": None
    }

@router.get("/live")
async def liveness_check():
    """Liveness probe for Kubernetes/Docker"""
    return {
        "status": "alive",
        "timestamp": None
    }
