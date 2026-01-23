# 🚀 Deploy to Render - Complete Guide

## Why Render?

Render provides **modern cloud servers** with AVX support, eliminating the TensorFlow CPU compatibility issues you experienced locally. Their servers can handle TensorFlow inference without problems.

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Your maize disease model file (`maize_disease_cnn.h5`)

## 🚀 Quick Deployment (5 minutes)

### Step 1: Prepare Your Code

```bash
# Run the deployment helper
./deploy-to-render.sh

# Push to GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Deploy on Render

1. **Go to [Render.com](https://render.com)** and sign in
2. **Click "New" → "Web Service"**
3. **Connect your GitHub repository** (`Maize_leaf_disease_detection`)
4. **Configure the service:**

#### Basic Settings:
- **Name**: `maize-disease-api` (or your choice)
- **Runtime**: `Docker`
- **Build Command**: `docker build -t maize-api ./apps/api`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`

#### Environment Variables:
```
ENVIRONMENT=production
DEBUG=false
MODEL_PATH=./models/maize_disease_cnn.h5
SKIP_MODEL_LOAD=0
```

#### Advanced Settings:
- **Health Check Path**: `/api/health/live`
- **Region**: `Singapore` (or closest to your users)

### Step 3: Add Persistent Disk

1. **In your Render service dashboard**, go to "Disks"
2. **Create a new disk:**
   - **Name**: `maize-models`
   - **Mount Path**: `/app/models`
   - **Size**: `1 GB` (should be enough for your model)

### Step 4: Upload Model File

After deployment, you need to upload your model file to Render's persistent disk:

1. **Go to your Render service** → "Shell" tab
2. **Upload your model file:**
   ```bash
   # In Render shell, create the models directory if needed
   mkdir -p models

   # Then upload your maize_disease_cnn.h5 file via the web interface
   # Go to "Disks" → "maize-models" → "Upload Files"
   ```
3. **Or use SCP/rsync** if you prefer command line

### Step 5: Test Your Deployment

Once deployed, your API will be available at:
- **API Base**: `https://your-service-name.onrender.com`
- **Health Check**: `https://your-service-name.onrender.com/api/health`
- **API Docs**: `https://your-service-name.onrender.com/docs`
- **Disease Prediction**: `https://your-service-name.onrender.com/api/disease/predict`

## 🔧 Manual Deployment (Alternative)

If you prefer not to use the `render.yaml` file:

1. **Follow Steps 1-2 above**
2. **Instead of render.yaml, manually configure** the Docker settings in Render's web interface
3. **Set environment variables** as shown above
4. **Add persistent disk** as described

## 📊 Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `ENVIRONMENT` | `production` | Sets production mode |
| `DEBUG` | `false` | Disables debug mode |
| `MODEL_PATH` | `./models/maize_disease_cnn.h5` | Path to your model file |
| `SKIP_MODEL_LOAD` | `0` | Set to 1 to skip model loading (for testing) |

## 🐛 Troubleshooting

### Model Not Loading
```bash
# Check if model exists in Render shell
ls -la models/
# Should show: maize_disease_cnn.h5
```

### TensorFlow Still Failing
- Render's servers have AVX support, so this shouldn't happen
- Check the deployment logs in Render dashboard
- Try setting `SKIP_MODEL_LOAD=1` temporarily to test API structure

### CORS Issues
Add your frontend URL to environment variables:
```
CORS_ORIGINS=["https://your-frontend.onrender.com"]
```

### Build Failures
- Check the build logs in Render dashboard
- Ensure all dependencies are in `requirements.txt`
- Verify Dockerfile is correct

## 💰 Cost Estimation

- **Free Tier**: 750 hours/month, 1GB disk
- **Paid Tier**: Starts at $7/month for more resources
- **Persistent Disk**: $0.25/GB/month

## 🔄 Updates

To update your deployed service:

```bash
# Make changes locally
git add .
git commit -m "Update API"
git push origin main

# Render will automatically rebuild and deploy
```

## 🌐 Connect Your Frontend

Update your frontend to use the Render API URL:

```javascript
// Instead of localhost:8000
const API_BASE = 'https://your-service-name.onrender.com';
```

## 📞 Support

- **Render Docs**: https://docs.render.com/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **TensorFlow on Render**: Generally works well on their infrastructure

## 🎉 Success!

Once deployed, you'll have:
- ✅ **No more CPU compatibility issues**
- ✅ **24/7 uptime**
- ✅ **Automatic scaling**
- ✅ **SSL certificate included**
- ✅ **Real TensorFlow inference**

Your maize disease detection API is now running on professional cloud infrastructure! 🌾☁️