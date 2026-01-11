# 🌾 Maize Disease Detection API - Setup Summary

## 📦 What Was Created

A complete **FastAPI backend** for serving your trained CNN model and weather data integration.

### Folder Structure

```
apps/api/
├── 📄 main.py                    Main FastAPI application
├── 📄 requirements.txt           Python dependencies
├── 📄 .env.example              Environment template
├── 📄 .gitignore               Git ignore rules
├── 
├── 🐳 Dockerfile               Docker container
├── 🐳 docker-compose.yml       Docker Compose config
├── 
├── 📚 README.md                Complete documentation
├── 📚 SETUP.md                 Quick setup guide
├── 📚 INTEGRATION.md           Frontend integration examples
├── 
├── 🚀 run.sh                   Linux/Mac startup script
├── 🚀 run.bat                  Windows startup script
├── 🧪 test_api.py             API test script
├── 
├── 📁 models/                  Place your trained model here
├── 📁 uploads/                 User uploaded images
├── 📁 app/
│   ├── config.py              Configuration & settings
│   ├── asgi.py               ASGI entry point
│   ├── routers/
│   │   ├── disease.py        Disease detection endpoints
│   │   ├── weather.py        Weather API endpoints
│   │   └── health.py         Health check endpoints
│   └── utils/
│       └── model_loader.py   Model loading & inference
└── venv/                      Virtual environment (auto-created)
```

## 🎯 Key Features

### 1. **Disease Detection API**
- `POST /api/disease/predict` - Single image prediction
- `POST /api/disease/batch-predict` - Multiple image prediction
- `GET /api/disease/classes` - Get disease classes

### 2. **Weather Integration**
- `GET /api/weather/current` - Current conditions + disease risk
- `GET /api/weather/forecast` - 7-day forecast with disease risk
- `GET /api/weather/disease-risk-conditions` - Risk factor info

### 3. **Health Checks**
- `GET /api/health` - API status
- `GET /api/health/ready` - Kubernetes readiness probe
- `GET /api/health/live` - Kubernetes liveness probe

## 🚀 Quick Start

### Step 1: Install & Setup (5 minutes)

```bash
cd apps/api

# Create virtual environment
python3 -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate
# Or Windows
venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### Step 2: Add Your Model

```bash
mkdir -p models
# Copy your trained model to models/maize_disease_model.h5
cp /path/to/your/model.h5 models/maize_disease_model.h5
```

### Step 3: Start Server

**Option A - Using startup script (Recommended)**
```bash
./run.sh        # Linux/Mac
# or
run.bat         # Windows
```

**Option B - Direct command**
```bash
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Verify Installation

Open your browser and visit:
- **API Status**: `http://localhost:8000/`
- **Interactive Docs**: `http://localhost:8000/docs` ← Try endpoints here!
- **Alternative Docs**: `http://localhost:8000/redoc`

## 🧪 Test the API

### Using Swagger UI (Easiest)
1. Go to `http://localhost:8000/docs`
2. Expand a test endpoint
3. Click "Try it out"
4. Upload a test image or enter parameters
5. Click "Execute"

### Using Python
```python
import requests

# Test prediction
with open("leaf.jpg", "rb") as f:
    files = {"file": f}
    r = requests.post("http://localhost:8000/api/disease/predict", files=files)
    print(r.json())
    # Output: {"prediction": "Gray Leaf Spot", "confidence": 0.92, ...}
```

### Using cURL
```bash
# Single prediction
curl -X POST "http://localhost:8000/api/disease/predict" \
  -F "file=@leaf.jpg"

# Weather forecast
curl "http://localhost:8000/api/weather/forecast?latitude=-1.2921&longitude=36.8219&days=7"
```

## 🔌 Connect Frontend (React/Next.js)

### Step 1: Create Hook

Create `apps/web/hooks/useDiseasePrediction.js`:

```javascript
import { useState } from 'react';

export const useDiseasePrediction = () => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const predictDisease = async (imageFile) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('http://localhost:8000/api/disease/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setPrediction(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { predictDisease, loading, prediction, error };
};
```

### Step 2: Use in Detect Page

Update `apps/web/src/app/detect/page.jsx`:

```javascript
'use client';

import { useState } from 'react';
import { useDiseasePrediction } from '@/hooks/useDiseasePrediction';

export default function DetectPage() {
  const [image, setImage] = useState(null);
  const { predictDisease, loading, prediction } = useDiseasePrediction();

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      await predictDisease(file);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Detect Maize Disease</h1>
      
      <input type="file" accept="image/*" onChange={handleUpload} />
      
      {image && <img src={image} alt="leaf" className="max-w-md mt-4" />}
      
      {loading && <p>Analyzing...</p>}
      
      {prediction && (
        <div className="mt-8 p-4 bg-green-50 rounded">
          <p className="text-xl">
            Prediction: <strong>{prediction.prediction}</strong>
          </p>
          <p className="text-lg">
            Confidence: {(prediction.confidence * 100).toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}
```

See `INTEGRATION.md` for more detailed examples!

## 🐳 Docker Deployment

### Quick Docker Run

```bash
# Build image
docker build -t maize-api .

# Run container
docker run -p 8000:8000 \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/uploads:/app/uploads \
  maize-api
```

### Using Docker Compose

```bash
docker-compose up
```

## 📊 API Response Examples

### Disease Prediction Response
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

### Weather Response with Disease Risk
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

## ⚙️ Configuration

Edit `app/config.py` to customize:

```python
# Model settings
INPUT_SIZE = 224          # Input image size
NUM_CLASSES = 3           # Number of disease classes
CLASS_NAMES = [           # Class names
    "Healthy",
    "Gray Leaf Spot",
    "Northern Corn Leaf Blight"
]

# Upload settings
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".bmp"]

# CORS origins (for frontend)
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Module not found** | Ensure venv is activated: `source venv/bin/activate` |
| **Port 8000 in use** | Change port: `uvicorn main:app --port 8001` |
| **Model not found** | Place model in `models/maize_disease_model.h5` |
| **CORS error in frontend** | Add frontend URL to `CORS_ORIGINS` in `config.py` |
| **Image too large** | Check `MAX_FILE_SIZE` in `config.py` (default 5MB) |

## 📚 Documentation Files

- **README.md** - Complete API documentation
- **SETUP.md** - Step-by-step setup checklist
- **INTEGRATION.md** - Frontend integration examples
- **Swagger UI** - Interactive API explorer at `/docs`

## 🎯 Next Steps

1. ✅ **Setup** - Run `./run.sh` or `python main.py`
2. ✅ **Test** - Visit `http://localhost:8000/docs`
3. ✅ **Connect** - Add hooks to your React app
4. ✅ **Deploy** - See deployment options in README.md

## 📦 Installed Dependencies

- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **tensorflow** - Deep learning (model loading)
- **pillow** - Image processing
- **numpy** - Numerical operations
- **httpx** - Async HTTP (weather API)
- **pydantic** - Data validation

## 🎉 You're Ready!

Your FastAPI backend is fully set up and ready to serve predictions!

### Start the server:
```bash
cd apps/api
./run.sh      # or python main.py
```

### Access the API:
- 🌐 **API**: http://localhost:8000
- 📚 **Docs**: http://localhost:8000/docs
- 🧪 **Test**: http://localhost:8000/docs (Try it out!)

### Questions?
- See detailed docs: `apps/api/README.md`
- See integration guide: `apps/api/INTEGRATION.md`
- Try Swagger UI: http://localhost:8000/docs

Happy detecting! 🌾🚀
