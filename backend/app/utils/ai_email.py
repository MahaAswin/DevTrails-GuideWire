import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Using gemini-flash-latest for production efficiency
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None
    print("Warning: GEMINI_API_KEY not found in environment for AI emails")

async def generate_email_content(event_type: str, user_name: str, amount: float = None) -> str:
    """
    Generates intelligent, personalized html email content using Gemini AI.
    """
    if not model:
        return f"<p>Hello {user_name}, welcome to ShieldGig! We're glad to have you on board.</p>"
             
    try:
        if event_type == "register":
            prompt = (
                f"Write a warm welcome email for {user_name} who joined ShieldGig. "
                "Mention that ShieldGig protects gig workers during emergencies and extreme weather. "
                "Output ONLY the HTML body content. No backticks, no markdown blocks."
            )
        elif event_type == "payment":
            amount_str = f"₹{amount}" if amount else "your payment"
            prompt = (
                f"Write a confirmation email for {user_name} acknowledging their payment of {amount_str}. "
                "Output ONLY the HTML body content. No backticks, no markdown blocks."
            )
        else:
            prompt = f"Write a notification email for {user_name} regarding their ShieldGig account."

        # Synchronous-like calling for simplicity, or use thread pool if needed
        # google-generativeai generate_content is blocking, but SDK 0.4.0 supports async with some versions
        # Here we prioritize robustness
        response = model.generate_content(prompt)
        
        content = response.text.replace("```html", "").replace("```", "").strip() if response.text else ""
        if not content:
             return f"<p>Hello {user_name}, welcome to ShieldGig! Your action was successful.</p>"
        return content
        
    except Exception as e:
        print(f"Error generating AI email content: {e}")
        return f"<p>Hello {user_name}, welcome to ShieldGig! Your account is active.</p>"
