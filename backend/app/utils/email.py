import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv

load_dotenv()

from app.utils.logger import logger, log_error

# Configure fastapi-mail ConnectionConfig
try:
    conf = ConnectionConfig(
        MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
        MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
        MAIL_FROM=os.getenv("MAIL_FROM"),
        MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
        MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
        MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "ShieldGig Notifications"),
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True
    )
except Exception as e:
    logger.error(f"Failed to initialize Email Configuration: {e}")
    conf = None

async def send_email(subject: str, email_to: str, body: str):
    """
    Asynchronously sends an HTML-formatted email.
    """
    if not conf:
        logger.warning(f"Skipping email to {email_to} (Connection not configured)")
        return

    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logger.info(f"Email successfully sent to {email_to}: {subject}")
    except Exception as e:
        log_error(f"Failed to send email to {email_to}", str(e))
