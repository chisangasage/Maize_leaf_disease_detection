#!/bin/bash

# Maize Disease Detection API Startup Script

set -e

API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$API_DIR"

echo "=========================================="
echo "Maize Disease Detection API"
echo "=========================================="
echo ""

# Check if venv exists
if [ ! -d "myenv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🐍 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📦 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Create necessary directories
mkdir -p models uploads

# Copy .env if not exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
fi

# Check if model exists
if [ ! -f "models/maize_disease_cnn.h5" ]; then
    echo ""
    echo "⚠️  WARNING: Model file not found!"
    echo "   Expected: models/maize_disease_cnn.h5"
    echo "   Please place your trained model in the models/ directory."
    echo ""
fi

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="
echo ""
echo "Starting FastAPI server on http://localhost:8000"
echo ""
echo "Available endpoints:"
echo "  📚 Swagger UI: http://localhost:8000/docs"
echo "  📖 ReDoc: http://localhost:8000/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
