#!/bin/bash
# Render Deployment Helper Script
# This script helps with deploying the Maize Disease Detection API to Render

echo "🚀 Maize Disease Detection API - Render Deployment Helper"
echo "========================================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Deployment Checklist:"
echo "1. ✅ render.yaml created"
echo "2. ✅ Dockerfile updated for production"
echo "3. ✅ Environment variables configured"
echo "4. 🔄 Model file needs to be uploaded to Render disk"

echo ""
echo "📁 Model File Setup:"
echo "Your model should be placed in: apps/api/models/maize_disease_cnn.h5"
echo ""

if [ -f "apps/api/models/maize_disease_cnn.h5" ]; then
    echo "✅ Model file found locally"
    MODEL_SIZE=$(du -h "apps/api/models/maize_disease_cnn.h5" | cut -f1)
    echo "📊 Model size: $MODEL_SIZE"
else
    echo "⚠️  Model file not found locally"
    echo "   Please ensure your model is at: apps/api/models/maize_disease_cnn.h5"
    echo "   Or update MODEL_PATH in render.yaml if using a different location"
fi

echo ""
echo "🌐 Next Steps:"
echo "1. Push this code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to https://render.com and connect your GitHub repository"
echo ""
echo "3. Create a new Web Service with these settings:"
echo "   - Runtime: Docker"
echo "   - Dockerfile Path: ./apps/api/Dockerfile"
echo "   - Build Command: docker build -t maize-api ./apps/api"
echo "   - Start Command: uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
echo "4. Set Environment Variables:"
echo "   - ENVIRONMENT=production"
echo "   - DEBUG=false"
echo "   - MODEL_PATH=./models/maize_disease_cnn.h5"
echo "   - SKIP_MODEL_LOAD=0"
echo ""
echo "5. Add Persistent Disk:"
echo "   - Name: maize-models"
echo "   - Mount Path: /app/models"
echo "   - Size: 1 GB"
echo ""
echo "6. Upload your model file to the persistent disk after deployment"
echo ""
echo "7. Your API will be available at: https://your-service-name.onrender.com"
echo ""
echo "📚 API Endpoints:"
echo "- Health: https://your-service-name.onrender.com/api/health"
echo "- Docs: https://your-service-name.onrender.com/docs"
echo "- Disease Prediction: https://your-service-name.onrender.com/api/disease/predict"
echo ""
echo "🎉 Happy deploying!"