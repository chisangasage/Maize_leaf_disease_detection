FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and TensorFlow
RUN apt-get update && apt-get install -y \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libglib2.0-0 \
    libgomp1 \
    libgthread-2.0-0 \
    libatlas-base-dev \
    gfortran \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip setuptools wheel

# Install basic dependencies first
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn==0.24.0 \
    python-multipart==0.0.6 \
    pillow==10.1.0 \
    numpy==1.26.3 \
    requests==2.31.0 \
    httpx==0.25.2 \
    pydantic==2.5.0 \
    pydantic-settings==2.1.0 \
    python-dotenv==1.0.0 \
    aiofiles==23.2.1

# Install heavier packages separately
RUN pip install --no-cache-dir \
    opencv-python==4.8.1.78 \
    pandas==2.3.3 \
    openmeteo-requests==1.7.4 \
    requests-cache==1.2.1 \
    retry-requests==2.0.0

# Install TensorFlow last (most likely to fail)
RUN pip install --no-cache-dir tensorflow-cpu==2.13.1 || echo "TensorFlow install failed, continuing..."

# Copy application code
COPY apps/api/ .

# Create necessary directories
RUN mkdir -p models uploads

# Make sure the app directory is in Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/health/live')"

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
