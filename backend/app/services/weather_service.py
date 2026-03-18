import os
import httpx
from typing import Dict, Any

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY", "MOCK_KEY")
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"

    async def get_weather(self, city: str) -> Dict[str, Any]:
        if self.api_key == "MOCK_KEY":
            # Return mock data for demonstration if no API key is set
            import random
            condition = random.choice(["Rain", "Clear", "Clouds"])
            rain_level = random.uniform(0, 15) if condition == "Rain" else 0
            temp = random.uniform(20, 35)
            return self._process_weather(city, condition, rain_level, temp)

        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "q": city,
                    "appid": self.api_key,
                    "units": "metric"
                }
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                condition = data["weather"][0]["main"]
                rain_level = data.get("rain", {}).get("1h", 0)
                temp = data["main"]["temp"]
                wind_speed = data["wind"]["speed"]
                humidity = data["main"]["humidity"]
                
                return self._process_weather(city, condition, rain_level, temp, wind_speed, humidity)
        except Exception as e:
            print(f"Error fetching weather: {e}")
            return self._process_weather(city, "Clear", 0, 25, 5, 50)

    def _process_weather(self, city: str, condition: str, rain_level: float, temp: float, wind_speed: float = 5.0, humidity: int = 50) -> Dict[str, Any]:
        # Enhanced Parametric Logic
        eligible = rain_level > 3
        payout = 0
        if eligible:
            payout = 200 if rain_level <= 10 else 500
            
        # Feature: Safety Risk Score (0-100)
        # Components: Rain (up to 40), Wind (up to 30), Extreme Temp (up to 30)
        rain_risk = min(rain_level * 4, 40)
        wind_risk = min(wind_speed * 2, 30)
        temp_risk = 0
        if temp > 38 or temp < 5:
            temp_risk = 30
        elif temp > 32 or temp < 12:
            temp_risk = 15
            
        risk_score = round(rain_risk + wind_risk + temp_risk)
        
        return {
            "city": city,
            "weather": condition,
            "rain_level": round(rain_level, 2),
            "temperature": round(temp, 1),
            "wind_speed": round(wind_speed, 1),
            "humidity": humidity,
            "risk_score": risk_score,
            "safety_status": "CRITICAL" if risk_score > 70 else "UNSAFE" if risk_score > 40 else "SAFE",
            "eligible_for_claim": eligible,
            "payout": payout
        }

weather_service = WeatherService()
