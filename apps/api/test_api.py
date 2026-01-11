"""
Test script for FastAPI endpoints
"""

import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoints"""
    print("\n✓ Testing health endpoints...")
    
    # Root
    response = requests.get(f"{BASE_URL}/")
    print(f"  GET / : {response.status_code}")
    
    # Health check
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"  GET /api/health : {response.status_code}")
    
    # Readiness
    response = requests.get(f"{BASE_URL}/api/health/ready")
    print(f"  GET /api/health/ready : {response.status_code}")

def test_disease_endpoints():
    """Test disease detection endpoints"""
    print("\n✓ Testing disease endpoints...")
    
    # Get classes
    response = requests.get(f"{BASE_URL}/api/disease/classes")
    print(f"  GET /api/disease/classes : {response.status_code}")
    if response.status_code == 200:
        print(f"  Classes: {response.json()}")

def test_weather_endpoints():
    """Test weather endpoints"""
    print("\n✓ Testing weather endpoints...")
    
    # Current weather (Nairobi, Kenya)
    response = requests.get(
        f"{BASE_URL}/api/weather/current",
        params={"latitude": -1.2921, "longitude": 36.8219}
    )
    print(f"  GET /api/weather/current : {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"  Temperature: {data['data'].get('temperature')}°C")
        print(f"  Disease Risk: {data['data'].get('disease_risk')}")
    
    # Forecast
    response = requests.get(
        f"{BASE_URL}/api/weather/forecast",
        params={"latitude": -1.2921, "longitude": 36.8219, "days": 7}
    )
    print(f"  GET /api/weather/forecast : {response.status_code}")
    
    # Risk info
    response = requests.get(f"{BASE_URL}/api/weather/disease-risk-conditions")
    print(f"  GET /api/weather/disease-risk-conditions : {response.status_code}")

def test_prediction_with_sample_image():
    """Test prediction with a sample image"""
    print("\n✓ Testing prediction endpoint...")
    
    # Create a simple test image
    try:
        from PIL import Image
        import io
        
        # Create a simple test image
        img = Image.new('RGB', (224, 224), color='green')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {"file": ("test.jpg", img_bytes, "image/jpeg")}
        response = requests.post(f"{BASE_URL}/api/disease/predict", files=files)
        
        print(f"  POST /api/disease/predict : {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"  Prediction: {result['prediction']}")
            print(f"  Confidence: {result['confidence']:.2%}")
    
    except Exception as e:
        print(f"  Error testing prediction: {e}")

def run_all_tests():
    """Run all tests"""
    print("=" * 50)
    print("FastAPI Endpoint Tests")
    print("=" * 50)
    
    try:
        test_health()
        test_disease_endpoints()
        test_weather_endpoints()
        test_prediction_with_sample_image()
        
        print("\n" + "=" * 50)
        print("✅ All tests completed!")
        print("=" * 50)
        print("\nAccess API docs at: http://localhost:8000/docs")
        print("Access ReDoc at: http://localhost:8000/redoc")
    
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to server")
        print("Make sure FastAPI is running: python main.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    run_all_tests()
