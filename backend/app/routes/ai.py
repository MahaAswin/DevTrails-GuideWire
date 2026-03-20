from fastapi import APIRouter, HTTPException, Body
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
model = None
if GEMINI_API_KEY:
    try:
        # Import lazily so the app can still boot if the Gemini/protobuf stack
        # is broken on the hosting environment.
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-flash-latest")
    except Exception as e:
        print(f"Warning: Gemini SDK init failed; AI route disabled: {e}")

@router.post("/chat")
async def ai_chat(payload: dict = Body(...)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    prompt = payload.get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    try:
        if model is None:
            raise RuntimeError("Gemini model not initialized")
        # Contextual prompt for ShieldGig
        full_prompt = f"""
        You are ShieldGig AI, a helpful assistant for gig workers (Zomato, Swiggy, Amazon, etc.) in India.
        Answer their queries about insurance, policies, claims, and wallet balance.
        Keep responses professional, empathetic, and concise.
        
        User context/query: {prompt}
        """
        response = model.generate_content(full_prompt)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")
