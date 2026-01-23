"""
Utility functions for model loading and inference
"""

import os
import logging
import numpy as np
from PIL import Image
from io import BytesIO

logger = logging.getLogger(__name__)

def load_model(model_path: str):
    """
    Load TensorFlow model for disease prediction

    Args:
        model_path: Path to the saved model (.h5 or directory)

    Returns:
        Loaded TensorFlow model or None for mock mode
    """
    try:
        import tensorflow as tf

        if not os.path.exists(model_path):
            logger.warning(f"Model not found at {model_path}. Using mock model for testing.")
            return None

        model = tf.keras.models.load_model(model_path)
        logger.info(f"TensorFlow model loaded successfully from {model_path}")
        return model

    except ImportError as e:
        logger.warning(f"TensorFlow not available: {e}")
        logger.warning("Falling back to mock predictions")
        return None
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        logger.warning("Falling back to mock predictions")
        return None

def preprocess_image(image_bytes: bytes, input_size: int = 224) -> np.ndarray:
    """
    Preprocess image for model inference
    
    Args:
        image_bytes: Raw image bytes
        input_size: Target image size (default 224x224)
    
    Returns:
        Preprocessed image as numpy array
    """
    try:
        # Open image from bytes
        image = Image.open(BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size
        image = image.resize((input_size, input_size))
        
        # Convert to numpy array and normalize
        image_array = np.array(image, dtype=np.float32) / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
    
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        raise

def predict_disease(model, image_bytes: bytes, class_names: list, input_size: int = 224):
    """
    Make disease prediction on image using TensorFlow
    
    Args:
        model: Loaded TensorFlow model
        image_bytes: Raw image bytes
        class_names: List of class names
        input_size: Model input size
    
    Returns:
        Dictionary with prediction results
    """
    try:
        if model is None:
            # Return mock prediction for testing
            return {
                "prediction": "Healthy",
                "confidence": 0.92,
                "all_predictions": {
                    "Healthy": 0.92,
                    "Gray Leaf Spot": 0.05,
                    "Northern Corn Leaf Blight": 0.03
                }
            }
        
        # Preprocess image
        processed_image = preprocess_image(image_bytes, input_size)
        
        # Run TensorFlow inference
        logger.info("Running inference with TensorFlow")
        predictions = model.predict(processed_image, verbose=0)
        
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        
        # Get all predictions with confidence scores
        all_predictions = {
            class_names[i]: float(predictions[0][i])
            for i in range(len(class_names))
        }
        
        return {
            "prediction": class_names[predicted_class_idx],
            "confidence": confidence,
            "all_predictions": all_predictions
        }
    
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        raise

def validate_image(file_bytes: bytes) -> bool:
    """
    Validate if file is a valid image
    
    Args:
        file_bytes: Raw file bytes
    
    Returns:
        True if valid image, False otherwise
    """
    try:
        image = Image.open(BytesIO(file_bytes))
        image.verify()
        return True
    except Exception:
        return False
