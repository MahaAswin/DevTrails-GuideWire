from fastapi import APIRouter, HTTPException, Body
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')

@router.post("/chat")
async def ai_chat(payload: dict = Body(...)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    prompt = payload.get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    try:
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
