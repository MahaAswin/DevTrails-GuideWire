from fastapi import APIRouter, HTTPException, Query
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

@router.get("/")
async def get_weather(city: str = Query(..., example="Bangalore")):
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenWeather API key not configured")

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch weather data")
            
            data = response.json()
            main = data.get("main", {})
            weather = data.get("weather", [{}])[0]
            
            temp = main.get("temp")
            condition = weather.get("main", "Clear")
            description = weather.get("description", "")
            
            # Parametric eligibility logic: Heavy rain trigger
            eligible_for_rain_claim = condition.lower() in ["rain", "drizzle", "thunderstorm"]
            
            return {
                "city": city,
                "temperature": temp,
                "condition": condition,
                "description": description,
                "eligible_for_rain_claim": eligible_for_rain_claim,
                "alerts": "IMD Red Alert" if eligible_for_rain_claim else "None"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
