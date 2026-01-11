"use client";

import { useState, useCallback } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ImageUpload from "../../components/ImageUpload";
import ResultCard from "../../components/ResultCard";
import { Loader2, AlertCircle } from "lucide-react";

export default function DetectPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleImageSelect = useCallback((file) => {
    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setImagePreview(null);
    setError(null);
    setResult(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get API base URL from environment variable
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      // Create form data
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Attempt to get user's location to include weather data
      try {
        const position = await new Promise((resolve, reject) => {
          if (!navigator?.geolocation) return reject(new Error("No geolocation"));
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        const { latitude, longitude } = position.coords;
        formData.append("latitude", String(latitude));
        formData.append("longitude", String(longitude));
      } catch (e) {
        // ignore location errors — request will proceed without weather
      }

      // Make API request (note backend is mounted under /api/disease)
      const response = await fetch(`${apiBaseUrl}/api/disease/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Set result
      setResult({
        prediction: data.class || data.prediction || "Unknown",
        confidence: data.confidence || 0,
        weather: data.weather || null,
      });
    } catch (err) {
      console.error("Prediction error:", err);
      setError(
        err.message ||
          "Failed to analyze image. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedFile]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Disease Detection
            </h1>
            <p className="text-gray-600">
              Upload a clear image of a maize leaf to detect potential diseases
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
            {/* Image Upload Section */}
            <ImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={imagePreview}
              onClear={handleClear}
            />

            {/* Analyze Button */}
            {selectedFile && !result && (
              <div className="mt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Analyzing Image...
                    </>
                  ) : (
                    "Analyze Image"
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle
                  className="text-red-600 flex-shrink-0 mt-0.5"
                  size={20}
                />
                <div>
                  <h4 className="font-semibold text-red-900 text-sm mb-1">
                    Error
                  </h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="mt-8">
              <ResultCard
                prediction={result.prediction}
                confidence={result.confidence}
                imageUrl={imagePreview}
              />

              {/* New Analysis Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleClear}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Analyze Another Image
                </button>
              </div>
            </div>
          )}

          {/* Tips Section */}
          {!result && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                Tips for Best Results
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Use clear, well-lit images of maize leaves</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Ensure the leaf fills most of the frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Avoid blurry or dark images</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Capture both sides of the leaf if symptoms are visible
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
