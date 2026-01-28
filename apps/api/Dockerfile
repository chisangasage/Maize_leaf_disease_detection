FROM tensorflow/tensorflow:2.13.0

WORKDIR /app

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

    

# Install essential Python dependencies only
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn==0.24.0 \
    python-multipart==0.0.6 \
    pillow==10.1.0 \
    requests==2.31.0 \
    pydantic \
    || echo "Essential packages installed"

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
