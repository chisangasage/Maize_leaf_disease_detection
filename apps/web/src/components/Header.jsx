"use client";

import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

export default function Header() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

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
          
          const url = `${apiBaseUrl}/api/weather/current?latitude=${latitude}&longitude=${longitude}`;
          console.log("🌐 Fetching weather from:", url);
          
          const res = await fetch(url);
          console.log("📊 Weather API Response Status:", res.status);
          
          if (!res.ok) {
            console.error("❌ Weather API Error:", res.status, res.statusText);
            setWeather(null);
            setLoading(false);
            return;
          }
          
          const data = await res.json();
          console.log("✅ Weather data received:", data);
          
          setWeather(data.data || null);
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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <a
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-green-500 p-2 rounded-lg">
              <Leaf className="text-white" size={24} />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">
              Maize Disease Detection
            </span>
          </a>

          {/* Navigation and Weather Widget */}
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 sm:gap-2">
              <a
                href="/"
                className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors font-medium text-sm sm:text-base"
              >
                Home
              </a>
              <a
                href="/detect"
                className="px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors font-medium text-sm sm:text-base"
              >
                Detect Disease
              </a>
              <a
                href="/about"
                className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors font-medium text-sm sm:text-base"
              >
                About
              </a>
            </nav>

            {/* Small weather widget in top-right */}
            <div className="ml-2">
              <div className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg px-3 py-1 flex items-center gap-3 shadow-sm">
                {loading ? (
                  <span>Loading…</span>
                ) : weather ? (
                  <>
                    <div className="text-right">
                      <div className="font-semibold">{Math.round(weather.temperature)}°C</div>
                      <div className="text-xs text-gray-500">{weather.disease_risk || "Risk: —"}</div>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-500">Weather unavailable</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
