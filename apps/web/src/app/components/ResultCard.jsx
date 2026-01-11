"use client";

import { CheckCircle, AlertTriangle } from "lucide-react";

export default function ResultCard({ prediction, confidence, imageUrl }) {
  const isHealthy = prediction?.toLowerCase().includes("healthy");
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`p-6 ${isHealthy ? "bg-green-50" : "bg-orange-50"}`}>
        <div className="flex items-center gap-3">
          {isHealthy ? (
            <CheckCircle className="text-green-600" size={32} />
          ) : (
            <AlertTriangle className="text-orange-600" size={32} />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Analysis Complete
            </h3>
            <p className="text-sm text-gray-600">
              AI-powered disease detection
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Image Preview */}
        {imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={imageUrl}
              alt="Analyzed leaf"
              className="w-full h-auto max-h-[300px] object-contain bg-gray-50"
            />
          </div>
        )}

        {/* Prediction Result */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-600 mb-2 block">
            Detected Condition
          </label>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">
              {prediction}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isHealthy
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {isHealthy ? "Healthy" : "Disease Detected"}
            </span>
          </div>
        </div>

        {/* Confidence Score */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-600">
              Confidence Score
            </label>
            <span className="text-lg font-bold text-gray-900">
              {confidencePercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isHealthy ? "bg-green-500" : "bg-orange-500"
              }`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {confidencePercent >= 90
              ? "Very high confidence"
              : confidencePercent >= 70
                ? "High confidence"
                : confidencePercent >= 50
                  ? "Moderate confidence"
                  : "Low confidence - consider retaking image"}
          </p>
        </div>

        {/* Disease Info (placeholder) */}
        {!isHealthy && (
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
              About {prediction}
            </h4>
            <p className="text-sm text-gray-700">
              This disease can affect maize crop yield. Early detection and
              proper management are essential for maintaining healthy crops.
              Consult with agricultural experts for treatment recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
