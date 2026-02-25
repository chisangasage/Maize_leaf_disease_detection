"use client";

import { useState, useCallback } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import FloatingWeatherWidget from "../../components/FloatingWeatherWidget";
import ImageUpload from "../../components/ImageUpload";
import ResultModal from "../../components/ResultModal";
import { Loader2, AlertCircle } from "lucide-react";

export default function DetectPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageSelect = useCallback((file) => {
    setSelectedFile(file);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setImagePreview(null);
    setError(null);
    setResult(null);
    setIsModalOpen(false);
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
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      const formData = new FormData();
      formData.append("file", selectedFile);

      // Optionally include location for weather context
      try {
        const position = await new Promise((resolve, reject) => {
          if (!navigator?.geolocation)
            return reject(new Error("No geolocation"));
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          });
        });
        formData.append("latitude", String(position.coords.latitude));
        formData.append("longitude", String(position.coords.longitude));
      } catch {
        // proceed without location
      }

      const response = await fetch(`${apiBaseUrl}/api/disease/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg =
          errData.error ||
          errData.detail ||
          `Prediction failed (HTTP ${response.status})`;

        // If the service is unavailable, be explicit
        if (response.status === 503) {
          throw new Error(
            "Cannot reach the Azure prediction model. Please try again later."
          );
        }
        throw new Error(msg);
      }

      const data = await response.json();

      setResult({
        prediction: data.prediction || data.class || "Unknown",
        confidence: data.confidence ?? 0,
        all_predictions: data.all_predictions || {},
        weather: data.weather || null,
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(
        err.message ||
        "Failed to analyze image. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedFile]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Disease Detection
            </h1>
            <p className="text-gray-600">
              Upload a clear photo of a maize leaf to detect potential diseases
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
            <ImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={imagePreview}
              onClear={handleClear}
            />

            {/* Analyze Button */}
            {selectedFile && (
              <div className="mt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={22} />
                      Analyzing with Azure AI...
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

          {/* Tips */}
          {!result && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                Tips for Best Results
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                {[
                  "Use clear, well-lit images of maize leaves",
                  "Ensure the leaf fills most of the frame",
                  "Avoid blurry or dark images",
                  "Capture both sides of the leaf if symptoms are visible",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWeatherWidget />

      {/* Result Popup */}
      {isModalOpen && result && (
        <ResultModal
          result={result}
          imageUrl={imagePreview}
          onClose={() => setIsModalOpen(false)}
          onReset={handleClear}
        />
      )}
    </div>
  );
}
