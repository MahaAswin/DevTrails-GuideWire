import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv

load_dotenv()

# Configure fastapi-mail ConnectionConfig
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "example@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "secret-app-password"),
    MAIL_FROM=os.getenv("MAIL_FROM", "noreply@shieldgig.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "ShieldGig Notifications"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_email(subject: str, email_to: str, body: str):
    """
    Asynchronously sends an HTML-formatted email.
    """
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
    except Exception as e:
        print(f"Failed to send email to {email_to}. Error: {e}")
