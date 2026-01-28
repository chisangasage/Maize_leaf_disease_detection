# Maize Disease Detection API

FastAPI backend for serving a CNN-based disease detection model and weather data integration.

## 📋 Features

- **Disease Detection**: Upload leaf images for instant disease prediction using deep learning
- **Batch Prediction**: Process multiple images at once
- **Weather Integration**: Get current weather and forecasts with disease risk assessment
- **CORS Support**: Ready for frontend integration (React, mobile apps)
- **Interactive API Docs**: Swagger UI and ReDoc documentation

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip or conda

### 1. Setup Virtual Environment

```bash
cd apps/api
python -m venv venv

# On Linux/Mac
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings (model path, API keys, etc.)

### 4. Prepare Your Model

Place your trained model in the `models/` directory:

```bash
mkdir -p models
# Copy your model file: maize_disease_model.h5
```

The model should expect:
- Input: RGB images (224×224 pixels)
- Output: Class predictions for [Healthy, Gray Leaf Spot, Northern Corn Leaf Blight]

### 5. Run the Server

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:
```bash
python main.py
```

The API will be available at: `http://localhost:8000`

## 📚 API Endpoints

### Health Checks
- `GET /` - Root status
- `GET /api/health` - Health check
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

### Disease Detection
- `POST /api/disease/predict` - Predict disease from single image
- `POST /api/disease/batch-predict` - Batch process multiple images
- `GET /api/disease/classes` - Get available disease classes

### Weather Data
- `GET /api/weather/current` - Current weather and disease risk
- `GET /api/weather/forecast` - Weather forecast with disease risk
- `GET /api/weather/disease-risk-conditions` - Disease risk info

## 🧪 Testing

### 1. Using Swagger UI
Open browser: `http://localhost:8000/docs`


## 📁 Project Structure

```
apps/api/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment
├── README.md              # This file
├── models/                # Trained model files (create this)
│   └── maize_disease_model.h5
├── uploads/               # Uploaded images (auto-created)
└── app/
    ├── __init__.py
    ├── config.py          # Settings & configuration
    ├── asgi.py           # ASGI entry point
    ├── routers/          # API route handlers
    │   ├── __init__.py
    │   ├── disease.py    # Disease detection endpoints
    │   ├── weather.py    # Weather data endpoints
    │   └── health.py     # Health check endpoints
    └── utils/            # Utility functions
        ├── __init__.py
        └── model_loader.py  # Model loading & inference
```

## 🔧 Configuration

Edit `app/config.py` to customize:

| Setting | Default | Purpose |
|---------|---------|---------|
| `HOST` | 0.0.0.0 | Server host |
| `PORT` | 8000 | Server port |
| `MODEL_PATH` | ./models/maize_disease_model.h5 | Path to trained model |
| `INPUT_SIZE` | 224 | Model input image size |
| `NUM_CLASSES` | 3 | Number of disease classes |
| `CLASS_NAMES` | [Healthy, Gray Leaf Spot, ...] | Disease class names |
| `MAX_FILE_SIZE` | 5MB | Max upload size |
| `ALLOWED_EXTENSIONS` | .jpg, .jpeg, .png, .gif, .bmp | Accepted image formats |


## 🚀 Deployment

### Docker (Recommended)

Create `Dockerfile`:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t maize-api .
docker run -p 8000:8000 -v $(pwd)/models:/app/models maize-api
```

### Heroku

```bash
# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > Procfile

# Deploy
git push heroku main
```

### Google Cloud Run

```bash
gcloud run deploy maize-api \
  --source . \
  --platform managed \
  --region us-central1
```

## 🤝 API Response Format

### Success Response
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

### Error Response
```json
{
  "error": "Invalid image file",
  "status": "error"
}
```

## 📝 Environment Setup

Create `.env` file in `apps/api/` directory:

```env
DEBUG=True
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
MODEL_PATH=./models/maize_disease_model.h5
```

## 🐛 Troubleshooting

### Model Not Found
- Ensure model file exists at the path specified in `.env`
- Place your `.h5` file in `models/` directory
- Update `MODEL_PATH` in `.env`

### CORS Errors
- Add your frontend URL to `CORS_ORIGINS` in `app/config.py`
- Restart the server

### Image Upload Errors
- Check file size (max 5MB by default)
- Ensure image format is supported (.jpg, .png, etc.)
- Verify upload directory has write permissions

### Weather API Fails
- Check internet connection
- Open-Meteo API is free and shouldn't require authentication
- Verify latitude/longitude values

## 📖 API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## 📦 Dependencies

- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **TensorFlow/Keras**: Deep learning model loading
- **Pillow**: Image processing
- **NumPy**: Numerical operations
- **OpenCV**: Computer vision utilities
- **Pydantic**: Data validation
- **HTTPX**: Async HTTP client for weather API

## 🔐 Security Considerations

- Set `DEBUG=False` in production
- Use environment variables for secrets
- Implement rate limiting
- Add authentication/authorization
- Validate all input data
- Use HTTPS in production

## 🤝 Support

For issues or questions:
1. Check the API docs at `/docs`
2. Review error messages in server logs
3. Verify model and image formats
4. Check frontend CORS configuration
5. or contact developer @ chisangasagee@gmail.com

