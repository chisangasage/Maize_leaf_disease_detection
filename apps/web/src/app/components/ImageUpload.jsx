"use client";

import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export default function ImageUpload({ onImageSelect, selectedImage, onClear }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          onImageSelect(file);
        }
      }
    },
    [onImageSelect],
  );

  const handleFileInput = useCallback(
    (e) => {
      const files = e.target.files;
      if (files && files[0]) {
        onImageSelect(files[0]);
      }
    },
    [onImageSelect],
  );

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all ${
            isDragging
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={`p-4 rounded-full ${isDragging ? "bg-green-100" : "bg-gray-100"}`}
            >
              <Upload
                className={isDragging ? "text-green-600" : "text-gray-400"}
                size={32}
              />
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-700 mb-1">
                Drop your maize leaf image here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse from your device
              </p>
            </div>

            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                Choose Image
              </span>
            </label>

            <p className="text-xs text-gray-400 mt-2">
              Supported formats: JPG, PNG, JPEG
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="border-2 border-green-500 rounded-xl overflow-hidden bg-gray-50">
            <img
              src={selectedImage}
              alt="Selected maize leaf"
              className="w-full h-auto max-h-[400px] object-contain"
            />
          </div>

          <button
            onClick={onClear}
            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            aria-label="Remove image"
          >
            <X size={20} />
          </button>

          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <ImageIcon size={16} className="text-green-600" />
            <span>Image ready for analysis</span>
          </div>
        </div>
      )}
    </div>
  );
}
