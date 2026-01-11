#!/bin/bash

# Maize Disease Detection API - Windows Startup Script (.bat)
@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Maize Disease Detection API
echo ==========================================
echo.

REM Check if venv exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🐍 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📦 Installing dependencies...
pip install -q --upgrade pip
pip install -q -r requirements.txt

REM Create necessary directories
if not exist "models" mkdir models
if not exist "uploads" mkdir uploads

REM Copy .env if not exists
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
)

REM Check if model exists
if not exist "models\maize_disease_model.h5" (
    echo.
    echo ⚠️  WARNING: Model file not found!
    echo    Expected: models\maize_disease_model.h5
    echo    Please place your trained model in the models\ directory.
    echo.
)

echo.
echo ==========================================
echo ✅ Setup complete!
echo ==========================================
echo.
echo Starting FastAPI server on http://localhost:8000
echo.
echo Available endpoints:
echo   📚 Swagger UI: http://localhost:8000/docs
echo   📖 ReDoc: http://localhost:8000/redoc
echo.
echo Press Ctrl+C to stop the server
echo ==========================================
echo.

REM Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

endlocal
pause
