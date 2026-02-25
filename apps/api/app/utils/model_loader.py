"""
Utility functions for Azure Custom Vision disease prediction
"""

import logging
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)


class AzurePredictor:
    """
    Wraps the Azure Custom Vision Prediction SDK client.
    Provides a single classify_image_bytes() interface used by routers.
    """

    def __init__(self, prediction_key: str, endpoint: str, project_id: str, iteration_name: str):
        try:
            from azure.cognitiveservices.vision.customvision.prediction import CustomVisionPredictionClient
            from msrest.authentication import ApiKeyCredentials
        except ImportError as e:
            raise RuntimeError(
                "Azure Custom Vision SDK not installed. "
                "Run: pip install azure-cognitiveservices-vision-customvision msrest"
            ) from e

        credentials = ApiKeyCredentials(in_headers={"Prediction-key": prediction_key})
        self.client = CustomVisionPredictionClient(endpoint=endpoint, credentials=credentials)
        self.project_id = project_id
        self.iteration_name = iteration_name
        logger.info("Azure Custom Vision predictor initialised successfully.")

    def classify_image_bytes(self, image_bytes: bytes) -> dict:
        """
        Send raw image bytes to Azure Custom Vision and return a normalised result.

        Returns:
            {
                "prediction": "<top class name>",
                "confidence": <float 0-1>,
                "all_predictions": {"<class>": <float>, ...}
            }
        """
        results = self.client.classify_image_with_no_store(
            project_id=self.project_id,
            published_name=self.iteration_name,
            image_data=image_bytes
        )

        if not results.predictions:
            raise ValueError("Azure Custom Vision returned no predictions.")

        # Sort predictions by probability descending
        sorted_preds = sorted(results.predictions, key=lambda p: p.probability, reverse=True)
        top = sorted_preds[0]

        return {
            "prediction": top.tag_name,
            "confidence": round(top.probability, 4),
            "all_predictions": {p.tag_name: round(p.probability, 4) for p in sorted_preds}
        }


def create_azure_predictor(prediction_key: str, endpoint: str, project_id: str, iteration_name: str):
    """
    Factory function – creates and returns an AzurePredictor instance.
    Returns None on failure so the API can start without crashing.
    """
    try:
        predictor = AzurePredictor(
            prediction_key=prediction_key,
            endpoint=endpoint,
            project_id=project_id,
            iteration_name=iteration_name
        )
        return predictor
    except Exception as e:
        logger.error(f"Failed to create Azure predictor: {e}")
        return None


def validate_image(file_bytes: bytes) -> bool:
    """
    Validate if file bytes represent a valid image.

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
