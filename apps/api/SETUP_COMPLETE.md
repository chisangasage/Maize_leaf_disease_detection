# 🎉 FastAPI Setup Complete!

Your complete **FastAPI backend** for the Maize Disease Detection system is ready to use!

## 📂 What Was Created

I've created a production-ready FastAPI backend in `apps/api/` with the following structure:

### Core Files
```
apps/api/
├── main.py                          # FastAPI application entry point
├── requirements.txt                 # Python dependencies
├── .env.example                    # Environment configuration template
├── .gitignore                      # Git ignore rules
├── test_api.py                     # API endpoint test script
```

### Documentation
```
├── QUICKSTART.md                   # ⭐ Start here! Quick 5-minute setup
├── README.md                       # Complete API documentation
├── SETUP.md                        # Detailed setup checklist
├── INTEGRATION.md                  # React/Next.js frontend integration
```

### Configuration & Deployment
```
├── Dockerfile                      # Docker image configuration
├── docker-compose.yml             # Docker Compose setup
├── run.sh                         # Linux/Mac startup script
├── run.bat                        # Windows startup script
```

### Application Code
```
└── app/
    ├── __init__.py
    ├── config.py                  # Settings & configuration
    ├── asgi.py                   # ASGI entry point
    ├── routers/
    │   ├── __init__.py
    │   ├── disease.py           # Disease detection endpoints
    │   ├── weather.py           # Weather data endpoints
    │   └── health.py            # Health check endpoints
    └── utils/
        ├── __init__.py
        └── model_loader.py       # Model loading & inference
```

### Directories (to be created)
```
├── models/                        # Place your trained model here
├── uploads/                       # User uploaded images
└── venv/                         # Python virtual environment
```

## 🚀 Quick Start (5 Minutes)

### 1. Enter the API directory
```bash
cd apps/api
```

### 2. Create and activate virtual environment
```bash
# Create venv
python3 -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate.bat
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup configuration
```bash
cp .env.example .env
```

### 5. Add your model
```bash
mkdir -p models
# Copy your trained model to: models/maize_disease_model.h5
```

### 6. Start the server
```bash
# Option A: Using startup script
./run.sh          # Linux/Mac
run.bat           # Windows

# Option B: Direct command
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 7. Verify it works
Open browser and visit:
- **Status**: http://localhost:8000/
- **Interactive Docs**: http://localhost:8000/docs ← Try endpoints here!
- **Alternative Docs**: http://localhost:8000/redoc

## 🎯 API Endpoints Overview

### Disease Detection
- `POST /api/disease/predict` - Predict disease from single image
- `POST /api/disease/batch-predict` - Predict multiple images
- `GET /api/disease/classes` - Get available disease classes

### Weather Integration
- `GET /api/weather/current` - Current weather with disease risk
- `GET /api/weather/forecast` - 7-day forecast with risk levels
- `GET /api/weather/disease-risk-conditions` - Risk factor information

### Health Checks
- `GET /api/health` - API status
- `GET /api/health/ready` - Kubernetes readiness probe
- `GET /api/health/live` - Kubernetes liveness probe

## 📊 Example Usage

### Python
```python
import requests

# Single prediction
with open("leaf.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:8000/api/disease/predict",
        files={"file": f}
    )
    result = response.json()
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence']:.2%}")
```

### cURL
```bash
# Predict disease
curl -X POST "http://localhost:8000/api/disease/predict" \
  -F "file=@leaf.jpg"

# Get weather forecast
curl "http://localhost:8000/api/weather/forecast?latitude=-1.2921&longitude=36.8219&days=7"
```

### JavaScript/React
```javascript
// Upload and predict
const formData = new FormData();
formData.append("file", imageFile);

const response = await fetch("http://localhost:8000/api/disease/predict", {
  method: "POST",
  body: formData
});

const result = await response.json();
console.log(`${result.prediction}: ${(result.confidence * 100).toFixed(1)}%`);
```

## 🔌 Frontend Integration

See `INTEGRATION.md` for complete React/Next.js examples including:
- Disease prediction hook
- Weather data hook
- Component examples
- CORS configuration
- Testing instructions

### Quick Example
```javascript
// apps/web/hooks/useDiseasePrediction.js
import { useState } from 'react';

export const useDiseasePrediction = () => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const predictDisease = async (imageFile) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await fetch('http://localhost:8000/api/disease/predict', {
      method: 'POST',
      body: formData,
    });
    
    setPrediction(await response.json());
    setLoading(false);
  };

  return { predictDisease, loading, prediction };
};
```

## 🐳 Docker Deployment

### Quick Docker Run
```bash
docker build -t maize-api .
docker run -p 8000:8000 \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/uploads:/app/uploads \
  maize-api
```

### Using Docker Compose
```bash
docker-compose up
```

## ⚙️ Configuration

Edit `app/config.py` to customize:

```python
# Model configuration
INPUT_SIZE = 224
NUM_CLASSES = 3
CLASS_NAMES = [
    "Healthy",
    "Gray Leaf Spot",
    "Northern Corn Leaf Blight"
]

# Upload settings
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# CORS for frontend
CORS_ORIGINS = [
    "http://localhost:5173",   # Vite
    "http://localhost:3000",   # Next.js
]
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **QUICKSTART.md** | 5-minute quick start (this is best for first-time setup) |
| **README.md** | Complete API documentation with deployment options |
| **SETUP.md** | Detailed setup checklist and troubleshooting |
| **INTEGRATION.md** | Frontend integration examples for React/Next.js |

## 🧪 Testing the API

### Using Swagger UI (Easiest)
1. Go to http://localhost:8000/docs
2. Expand an endpoint
3. Click "Try it out"
4. Enter parameters or upload file
5. Click "Execute"

### Using Test Script
```bash
source venv/bin/activate
python test_api.py
```

### Running Tests
```python
# Test health
import requests
r = requests.get("http://localhost:8000/api/health")
print(r.json())  # {"status": "ok", "disease_model_available": true}

# Test weather
r = requests.get(
    "http://localhost:8000/api/weather/current",
    params={"latitude": -1.2921, "longitude": 36.8219}
)
print(r.json())  # Weather data with disease risk
```

## 🔧 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **venv not activated** | Run `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate.bat` (Windows) |
| **Module not found** | Install requirements: `pip install -r requirements.txt` |
| **Port 8000 in use** | Change port in `.env` or run: `uvicorn main:app --port 8001` |
| **Model not found** | Place model in `models/maize_disease_model.h5` |
| **CORS errors** | Add frontend URL to `CORS_ORIGINS` in `app/config.py` |
| **TensorFlow issues** | Install from requirements: `pip install tensorflow` |

## 📦 Installed Dependencies

- **fastapi** (0.104.1) - Modern web framework
- **uvicorn** (0.24.0) - ASGI server
- **tensorflow** (2.14.0) - Deep learning (for model loading)
- **pillow** (10.1.0) - Image processing
- **numpy** (1.24.3) - Numerical operations
- **opencv-python** (4.8.1.78) - Computer vision
- **httpx** (for async requests) - Weather API client
- **pydantic** (2.5.0) - Data validation
- **python-multipart** (0.0.6) - File upload handling

## 🚀 Deployment Options

The API is ready to deploy to:
- **Heroku** - See README.md for Procfile
- **Google Cloud Run** - Containerized deployment
- **AWS Lambda** - Serverless option
- **Self-hosted** - Linux/Windows server
- **Docker** - Included Dockerfile and docker-compose.yml

## 🎯 Next Steps

1. **Customize Model**
   - Update `NUM_CLASSES` and `CLASS_NAMES` if needed
   - Place your trained model in `models/`

2. **Connect Frontend**
   - Create hooks in `apps/web/hooks/`
   - See INTEGRATION.md for examples

3. **Add Features**
   - Authentication/authorization
   - Database storage for predictions
   - Real-time WebSocket updates
   - Batch processing improvements

4. **Deploy**
   - Choose deployment platform
   - See README.md for detailed instructions

## 📊 API Response Examples

### Disease Prediction
```json
{
  "prediction": "Gray Leaf Spot",
  "confidence": 0.92,
  "all_predictions": {
    "Healthy": 0.05,
    "Gray Leaf Spot": 0.92,
    "Northern Corn Leaf Blight": 0.03
  },
  "message": "Prediction successful"
}
```

### Weather with Disease Risk
```json
{
  "status": "success",
  "data": {
    "latitude": -1.2921,
    "longitude": 36.8219,
    "temperature": 22.5,
    "humidity": 85,
    "precipitation": 5.2,
    "wind_speed": 8.5,
    "disease_risk": "High"
  }
}
```

## ✅ Verification Checklist

- [x] FastAPI application created
- [x] All endpoints implemented (disease, weather, health)
- [x] Configuration system setup
- [x] Model loading utilities
- [x] Docker setup included
- [x] Documentation complete
- [x] Startup scripts provided
- [x] Frontend integration examples
- [x] Test script included
- [x] Virtual environment configured

## 📖 Learn More

**For Quick Setup:**
→ Read `QUICKSTART.md`

**For Complete Documentation:**
→ Read `README.md`

**For Frontend Integration:**
→ Read `INTEGRATION.md`

**For Step-by-Step Setup:**
→ Read `SETUP.md`

## 🎉 You're All Set!

Your FastAPI backend is production-ready. Start the server and visit http://localhost:8000/docs to explore all endpoints!

```bash
cd apps/api
./run.sh    # or python main.py
```

Then open: **http://localhost:8000/docs** 🚀

---

**Questions?** Check the docs or review the Swagger UI at `/docs` for interactive endpoint documentation!
