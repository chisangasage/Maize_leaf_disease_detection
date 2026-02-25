"use client";

import { Leaf } from "lucide-react";

export default function Header() {

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

          {/* Navigation */}
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
                href="/map"
                className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors font-medium text-sm sm:text-base"
              >
                Farm Map
              </a>
              <a
                href="/history"
                className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors font-medium text-sm sm:text-base"
              >
                Scan History
              </a>
              <a
                href="/about"
                className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors font-medium text-sm sm:text-base"
              >
                About
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
