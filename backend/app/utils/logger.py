import logging
import os

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

logging.basicConfig(
    level=LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("backend.log")
    ]
)

logger = logging.getLogger("ShieldGig")

def log_api_request(method, url, status_code):
    logger.info(f"API Request: {method} {url} - Status: {status_code}")

def log_error(message, error=None):
    if error:
        logger.error(f"{message}: {str(error)}")
    else:
        logger.error(message)

def log_event(message):
    logger.info(message)
