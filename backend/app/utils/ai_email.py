import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Set insecure transport for local OAuth development to fix 'mismatching_state'
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None
    print("Warning: GEMINI_API_KEY not found in environment for AI emails")

async def generate_email_content(event_type: str, user_name: str, amount: float = None) -> str:
    """
    Generates intelligent, personalized html email content using Gemini AI.
    """
    if not client:
        return f"<p>Hello {user_name}, ShieldGig welcomes you! (AI key missing)</p>"
             
    try:
        if event_type == "register":
            prompt = (
                f"Write a professional and friendly welcome email for a user named {user_name} "
                "who just registered on ShieldGig, a platform that protects gig workers. "
                "Make sure the response is entirely formatted in HTML (do not use markdown blocks like ```html). "
                "Use clean, professional inline CSS styling. Make it sound human-like and highly personalized."
            )
        elif event_type == "payment":
            amount_str = f"₹{amount}" if amount else "an amount"
            prompt = (
                f"Write a professional payment confirmation email for {user_name} who paid {amount_str}. "
                "Include gratitude and confirmation of the transaction. "
                "Make sure the response is entirely formatted in HTML (do not use markdown blocks like ```html). "
                "Use clean, professional inline CSS styling. Make it sound human-like and welcoming."
            )
        else:
            prompt = (
                f"Write a polite notification email to {user_name} regarding their account on ShieldGig. "
                "Format entirely in HTML without markdown codeblocks."
            )

        response = await client.aio.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        
        content = response.text.replace("```html", "").replace("```", "").strip() if response.text else ""
        if not content:
             return f"<p>Hello {user_name}, your recent action on ShieldGig was successful!</p>"
        return content
        
    except Exception as e:
        print(f"Error generating AI email content: {e}")
        return f"<p>Hello {user_name}, your recent action on ShieldGig was successful!</p>"
