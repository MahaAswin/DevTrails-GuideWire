import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Using API Key: {api_key[:10]}...")

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)

try:
    model_name = 'gemini-flash-latest'
    print(f"Testing model: {model_name}")
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Say hello match.")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error with {model_name}: {str(e)}")
