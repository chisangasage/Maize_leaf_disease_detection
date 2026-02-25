"use client";

import { useEffect, useState } from "react";
import { MapPin, Thermometer, Droplets, Wind, Cloud, Sun, CloudRain, Eye, EyeOff } from "lucide-react";

export default function FloatingWeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(() => {
    // Initialize from localStorage, default to true if not set
    try {
      const saved = localStorage.getItem('weatherWidgetVisible');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (error) {
      // Fallback if localStorage is not available
      console.warn('localStorage not available for weather widget state');
      return true;
    }
  });
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    // Attempt to get user location and fetch weather
    if (!navigator || !navigator.geolocation) return;

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          console.log("📍 Location obtained:", { latitude, longitude });

          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
          console.log("🔗 API Base URL:", apiBaseUrl);

          // Fetch current weather
          const currentUrl = `${apiBaseUrl}/api/weather/current?latitude=${latitude}&longitude=${longitude}`;
          console.log("🌐 Fetching current weather from:", currentUrl);

          const currentRes = await fetch(currentUrl);
          console.log("📊 Current weather API Response Status:", currentRes.status);

          if (!currentRes.ok) {
            console.error("❌ Weather API Error:", currentRes.status, currentRes.statusText);
            setWeather(null);
            setLoading(false);
            return;
          }

          const currentData = await currentRes.json();
          console.log("✅ Current weather data received:", currentData);

          setWeather(currentData.data); // Access the nested data object

          // Try to fetch forecast (if endpoint exists)
          try {
            const forecastUrl = `${apiBaseUrl}/api/weather/forecast?latitude=${latitude}&longitude=${longitude}&days=3`;
            const forecastRes = await fetch(forecastUrl);
            if (forecastRes.ok) {
              const forecastData = await forecastRes.json();
              setForecast(forecastData);
            }
          } catch (forecastError) {
            console.log("⚠️ Forecast not available:", forecastError);
          }

        } catch (e) {
          console.error("⚠️ Error fetching weather:", e);
          setWeather(null);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("❌ Geolocation error:", err);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // Save visibility state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('weatherWidgetVisible', JSON.stringify(isVisible));
    } catch (error) {
      console.warn('Failed to save weather widget state to localStorage:', error);
    }
  }, [isVisible]);

  const getWeatherIcon = (condition) => {
    if (!condition) return <Cloud className="text-gray-400" size={20} />;

    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('precipitation')) {
      return <CloudRain className="text-blue-500" size={20} />;
    } else if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
      return <Sun className="text-yellow-500" size={20} />;
    } else {
      return <Cloud className="text-gray-400" size={20} />;
    }
  };

  const getRiskColor = (risk) => {
    if (!risk) return 'text-gray-500';
    const lowerRisk = risk.toLowerCase();
    if (lowerRisk.includes('high')) return 'text-red-600';
    if (lowerRisk.includes('moderate')) return 'text-yellow-600';
    if (lowerRisk.includes('low')) return 'text-green-600';
    return 'text-gray-500';
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          title="Show Weather"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span className="font-semibold text-sm">Weather & Disease Risk</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
              title="Hide Weather"
            >
              <EyeOff size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading weather...</span>
            </div>
          ) : weather ? (
            <div className="space-y-4">
              {/* Current Weather */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cloud className="text-blue-500" size={20} />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(weather.temperature)}°C
                    </div>
                    <div className="text-sm text-gray-600">
                      Current conditions
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="text-blue-500" size={16} />
                  <span className="text-gray-600">Humidity:</span>
                  <span className="font-medium">{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Wind className="text-gray-500" size={16} />
                  <span className="text-gray-600">Wind:</span>
                  <span className="font-medium">{Number(weather.wind_speed).toFixed(2)} km/h</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CloudRain className="text-blue-400" size={16} />
                  <span className="text-gray-600">Precip:</span>
                  <span className="font-medium">{weather.precipitation} mm</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="text-red-500" size={16} />
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-xs">
                    {weather.location_name || `${weather.latitude?.toFixed(2)}, ${weather.longitude?.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Disease Risk */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Disease Risk:</span>
                  <span className={`font-bold text-sm ${getRiskColor(weather.disease_risk)}`}>
                    {weather.disease_risk || 'Unknown'}
                  </span>
                </div>
                {weather.risk_factors && weather.risk_factors.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    {weather.risk_factors[0]}
                  </div>
                )}
              </div>

              {/* Last Updated */}
              <div className="text-xs text-gray-500 text-center pt-2 border-t">
                Updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Cloud className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-gray-600 text-sm">Weather unavailable</p>
              <p className="text-gray-400 text-xs mt-1">
                Allow location access to see weather data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}