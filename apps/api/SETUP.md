# FastAPI Setup Checklist

Complete this checklist to get your API running:

## ✅ Initial Setup

- [ ] Navigate to `apps/api` directory
- [ ] Create Python virtual environment: `python3 -m venv venv`
- [ ] Activate venv:
  - Linux/Mac: `source venv/bin/activate`
  - Windows: `venv\Scripts\activate.bat`
- [ ] Install dependencies: `pip install -r requirements.txt`

## ✅ Configuration

- [ ] Copy environment template: `cp .env.example .env`
- [ ] Edit `.env` with your settings (optional, defaults work fine)
- [ ] Create `models/` directory: `mkdir -p models`
- [ ] Place trained model in `models/maize_disease_model.h5`

## ✅ Run the Server

**Option 1: Using startup script**
- Linux/Mac: `./run.sh`
- Windows: `run.bat`

**Option 2: Direct command**
```bash
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## ✅ Verify Setup

After starting the server:

- [ ] Visit `http://localhost:8000/` - Should see status
- [ ] Visit `http://localhost:8000/docs` - Swagger UI
- [ ] Visit `http://localhost:8000/api/health` - Health check
- [ ] Try a test prediction in Swagger UI

## ✅ Connect Frontend

Update `apps/web/` to use the API:

- [ ] Create `hooks/useDiseasePrediction.js` (see INTEGRATION.md)
- [ ] Update detect page to use the hook
- [ ] Add `.env.local` with API URL
- [ ] Test image upload and prediction

## ✅ Docker Setup (Optional)

- [ ] Install Docker
- [ ] Build image: `docker build -t maize-api .`
- [ ] Run container: `docker run -p 8000:8000 -v $(pwd)/models:/app/models maize-api`

Or use Docker Compose:
- [ ] Install Docker Compose
- [ ] Run: `docker-compose up`

## 📋 Project Structure

```
apps/api/
├── main.py                    ← Main entry point
├── requirements.txt           ← Dependencies
├── .env                       ← Configuration (created)
├── .env.example              ← Template
├── run.sh                    ← Linux/Mac startup
├── run.bat                   ← Windows startup
├── Dockerfile                ← Docker image
├── docker-compose.yml        ← Docker Compose
├── test_api.py              ← Test script
├── README.md                ← Full documentation
├── INTEGRATION.md           ← Frontend integration guide
├── models/                  ← Place your trained model here
│   └── (maize_disease_model.h5)
├── uploads/                 ← User uploads (auto-created)
└── app/
    ├── config.py            ← Settings
    ├── routers/
    │   ├── disease.py       ← Disease endpoints
    │   ├── weather.py       ← Weather endpoints
    │   └── health.py        ← Health endpoints
    └── utils/
        └── model_loader.py  ← Model utilities
```

## 🧪 Testing

### Using Swagger UI
1. Go to `http://localhost:8000/docs`
2. Expand endpoints
3. Click "Try it out"
4. Click "Execute"

### Using Python Script
```bash
source venv/bin/activate
python test_api.py
```

### Using cURL
```bash
# Health check
curl http://localhost:8000/api/health

# Predict disease
curl -X POST "http://localhost:8000/api/disease/predict" \
  -F "file=@leaf_image.jpg"

# Get weather
curl "http://localhost:8000/api/weather/current?latitude=-1.2921&longitude=36.8219"
```

## 🔧 Common Issues

### Issue: Model not found
**Solution**: Place your model in `models/maize_disease_model.h5`

### Issue: CORS errors in frontend
**Solution**: Add frontend URL to `CORS_ORIGINS` in `app/config.py`

### Issue: Port already in use
**Solution**: Change PORT in `.env` or run: `uvicorn main:app --port 8001`

### Issue: Import errors
**Solution**: Make sure venv is activated and dependencies installed

### Issue: TensorFlow errors
**Solution**: Install from requirements: `pip install -r requirements.txt`

## 📚 API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Status check |
| GET | `/api/health` | Health status |
| POST | `/api/disease/predict` | Single prediction |
| POST | `/api/disease/batch-predict` | Multiple predictions |
| GET | `/api/disease/classes` | Available classes |
| GET | `/api/weather/current` | Current weather |
| GET | `/api/weather/forecast` | Weather forecast |
| GET | `/api/weather/disease-risk-conditions` | Risk info |

## 🚀 Next Steps

1. **Customize Model**
   - Update `NUM_CLASSES` in `app/config.py` if needed
   - Update `CLASS_NAMES` with your disease names

2. **Add Authentication**
   - Add JWT tokens to `app/routers/`
   - Restrict endpoints with auth middleware

3. **Add Database**
   - Store predictions in database
   - Track user history

4. **Deploy**
   - See README.md for deployment options
   - Docker, Heroku, Google Cloud Run, etc.

5. **Monitor**
   - Add logging and error tracking
   - Set up health check alerts

## 📖 Documentation

- Full API docs: `README.md`
- Integration guide: `INTEGRATION.md`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## ✨ You're All Set!

Your FastAPI backend is ready to serve predictions! 🎉

Start with: `./run.sh` or `python main.py`

Then integrate with your frontend using the examples in `INTEGRATION.md`
