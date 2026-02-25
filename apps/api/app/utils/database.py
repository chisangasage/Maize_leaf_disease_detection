import sqlite3
import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Optional, Any

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages SQLite database for scan history and farm layouts."""
    
    def __init__(self, db_path: str = "maize_health.db"):
        self.db_path = db_path
        self._init_db()
        
    def _get_connection(self):
        return sqlite3.connect(self.db_path)
        
    def _init_db(self):
        """Initialize the database tables if they don't exist."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Table for disease detection scans
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS scans (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        farmer_id TEXT,
                        latitude REAL,
                        longitude REAL,
                        prediction TEXT,
                        confidence REAL,
                        all_predictions TEXT,  -- JSON string
                        weather_data TEXT,     -- JSON string
                        image_url TEXT         -- Optional, local path or URL
                    )
                ''')
                
                # Table for farm boundaries (polygons)
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS farms (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        farmer_id TEXT,
                        farm_name TEXT,
                        boundary_geojson TEXT, -- GeoJSON string
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(farmer_id, farm_name)
                    )
                ''')
                
                conn.commit()
                logger.info(f"Database initialized at {self.db_path}")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            
    def save_scan(self, farmer_id: str, latitude: float, longitude: float, 
                  prediction: str, confidence: float, all_predictions: Dict,
                  weather_data: Optional[Dict] = None) -> int:
        """Save a new disease scan to history."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO scans (farmer_id, latitude, longitude, prediction, confidence, all_predictions, weather_data)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    farmer_id, 
                    latitude, 
                    longitude, 
                    prediction, 
                    confidence, 
                    json.dumps(all_predictions),
                    json.dumps(weather_data) if weather_data else None
                ))
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            logger.error(f"Error saving scan: {e}")
            return -1
            
    def get_history(self, farmer_id: Optional[str] = None, limit: int = 50) -> List[Dict]:
        """Retrieve scan history, optionally filtered by farmer_id."""
        try:
            with self._get_connection() as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                if farmer_id:
                    cursor.execute('SELECT * FROM scans WHERE farmer_id = ? ORDER BY timestamp DESC LIMIT ?', (farmer_id, limit))
                else:
                    cursor.execute('SELECT * FROM scans ORDER BY timestamp DESC LIMIT ?', (limit,))
                
                rows = cursor.fetchall()
                results = []
                for row in rows:
                    d = dict(row)
                    d['all_predictions'] = json.loads(d['all_predictions']) if d['all_predictions'] else {}
                    d['weather_data'] = json.loads(d['weather_data']) if d['weather_data'] else None
                    results.append(d)
                return results
        except Exception as e:
            logger.error(f"Error fetching history: {e}")
            return []

    def save_farm(self, farmer_id: str, farm_name: str, boundary_geojson: Dict) -> bool:
        """Save or update a farm boundary layout."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO farms (farmer_id, farm_name, boundary_geojson)
                    VALUES (?, ?, ?)
                ''', (farmer_id, farm_name, json.dumps(boundary_geojson)))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Error saving farm: {e}")
            return False

    def get_farms(self, farmer_id: str) -> List[Dict]:
        """Get all farms for a specific farmer."""
        try:
            with self._get_connection() as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM farms WHERE farmer_id = ?', (farmer_id,))
                rows = cursor.fetchall()
                results = []
                for row in rows:
                    d = dict(row)
                    d['boundary_geojson'] = json.loads(d['boundary_geojson']) if d['boundary_geojson'] else {}
                    results.append(d)
                return results
        except Exception as e:
            logger.error(f"Error fetching farms: {e}")
            return []

# Singleton instance
db = DatabaseManager()
