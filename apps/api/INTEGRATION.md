# Frontend Integration Guide

This guide shows how to integrate the FastAPI backend with your React/Next.js frontend.

## Backend Setup

Make sure the FastAPI server is running before testing the frontend:

```bash
cd apps/api
python main.py
# or
./run.sh  # Linux/Mac
# or
run.bat   # Windows
```

The API will be available at `http://localhost:8000`

## React Integration Examples

### 1. Disease Detection Hook

Create `hooks/useDiseasePrediction.js`:

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Prediction failed');
      }

      const data = await response.json();
      setPrediction(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { predictDisease, loading, prediction, error };
};
```

### 2. Use in Detect Page

Update `apps/web/src/app/detect/page.jsx`:

```javascript
'use client';

import { useState } from 'react';
import { useDiseasePrediction } from '@/hooks/useDiseasePrediction';

export default function DetectPage() {
  const [image, setImage] = useState(null);
  const { predictDisease, loading, prediction, error } = useDiseasePrediction();

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    await predictDisease(file);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Detect Maize Disease</h1>

      {/* Upload Section */}
      <div className="mb-8">
        <label className="block mb-2 text-lg font-semibold">
          Upload Leaf Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={loading}
          className="block w-full mb-4"
        />
      </div>

      {/* Image Preview */}
      {image && (
        <div className="mb-8">
          <img 
            src={image} 
            alt="Uploaded leaf" 
            className="max-w-md rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">⏳</div>
          <p className="text-gray-600 mt-2">Analyzing leaf...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Results */}
      {prediction && (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          
          <div className="mb-4">
            <p className="text-gray-600">Prediction:</p>
            <p className="text-3xl font-bold text-green-600">
              {prediction.prediction}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-gray-600">Confidence:</p>
            <p className="text-2xl font-semibold">
              {(prediction.confidence * 100).toFixed(1)}%
            </p>
          </div>

          {/* All Predictions */}
          <div>
            <p className="text-gray-600 mb-2">All Predictions:</p>
            <div className="space-y-2">
              {Object.entries(prediction.all_predictions).map(([disease, score]) => (
                <div key={disease} className="flex justify-between">
                  <span>{disease}</span>
                  <span className="font-semibold">
                    {(score * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3. Weather Integration Hook

Create `hooks/useWeather.js`:

```javascript
import { useState, useEffect } from 'react';

export const useWeather = (latitude, longitude) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get current weather
        const currentResponse = await fetch(
          `http://localhost:8000/api/weather/current?latitude=${latitude}&longitude=${longitude}`
        );
        if (!currentResponse.ok) throw new Error('Failed to fetch weather');
        const currentData = await currentResponse.json();
        setWeather(currentData.data);

        // Get forecast
        const forecastResponse = await fetch(
          `http://localhost:8000/api/weather/forecast?latitude=${latitude}&longitude=${longitude}&days=7`
        );
        if (!forecastResponse.ok) throw new Error('Failed to fetch forecast');
        const forecastData = await forecastResponse.json();
        setForecast(forecastData.forecast);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  return { weather, forecast, loading, error };
};
```

### 4. Weather Component

Create `components/WeatherInfo.jsx`:

```javascript
'use client';

import { useWeather } from '@/hooks/useWeather';

export function WeatherInfo({ latitude, longitude }) {
  const { weather, forecast, loading, error } = useWeather(latitude, longitude);

  if (loading) return <div>Loading weather...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      {weather && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3">Current Conditions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Temperature</p>
              <p className="text-2xl font-bold">{weather.temperature}°C</p>
            </div>
            <div>
              <p className="text-gray-600">Humidity</p>
              <p className="text-2xl font-bold">{weather.humidity}%</p>
            </div>
            <div>
              <p className="text-gray-600">Disease Risk</p>
              <p className="text-lg font-bold text-red-600">
                {weather.disease_risk}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Precipitation</p>
              <p className="text-2xl font-bold">{weather.precipitation}mm</p>
            </div>
          </div>
        </div>
      )}

      {/* Forecast */}
      {forecast && (
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-bold text-lg mb-3">7-Day Forecast</h3>
          <div className="space-y-2">
            {forecast.map((day) => (
              <div key={day.date} className="flex justify-between items-center">
                <span className="font-semibold">{day.date}</span>
                <span>{day.temp_max}°C</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  day.disease_risk === 'High' ? 'bg-red-100 text-red-700' :
                  day.disease_risk === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {day.disease_risk}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Environment Setup

Create `.env.local` in `apps/web`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

Or in React (vite):

Create `.env.local`:

```env
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000/api
```

Then use:

```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL;
```

## CORS Configuration

The FastAPI backend is already configured for CORS. If you get CORS errors:

1. Edit `app/config.py`
2. Add your frontend URL to `CORS_ORIGINS`:

```python
CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://yourdomain.com",  # Add your production domain
]
```

3. Restart the FastAPI server

## Testing the Integration

### 1. Start the Backend

```bash
cd apps/api
./run.sh  # or python main.py
```

### 2. Start the Frontend

```bash
cd apps/web
npm run dev
```

### 3. Test the Detect Page

1. Navigate to http://localhost:5173/detect (or your frontend URL)
2. Upload a leaf image
3. Wait for the prediction
4. View the results

## Troubleshooting

### CORS Error

**Error**: `Access to XMLHttpRequest at 'http://localhost:8000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution**: 
- Add your frontend URL to `CORS_ORIGINS` in `app/config.py`
- Restart the FastAPI server

### Connection Refused

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:8000`

**Solution**:
- Make sure FastAPI is running: `python main.py` in `apps/api`
- Check the port is 8000 in `app/config.py`

### Model Not Found

**Error**: `Model loading error`

**Solution**:
- Place your trained model in `apps/api/models/maize_disease_model.h5`
- Update `MODEL_PATH` in `.env` if using a different path

### Image Upload Fails

**Error**: `File too large` or `Invalid image file`

**Solution**:
- Check file size (max 5MB by default)
- Ensure image format is supported (.jpg, .png, etc.)
- Update `MAX_FILE_SIZE` in `app/config.py` if needed

## Production Deployment

For production, update `apps/web/src/client.d.ts` or environment variables to use your deployed API:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

And deploy both services:
- Frontend to Vercel, Netlify, or similar
- Backend to Heroku, Google Cloud Run, AWS, or self-hosted

See `apps/api/README.md` for backend deployment options.
