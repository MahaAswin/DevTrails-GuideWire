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
                # OpenWeatherMap returns rain in 'rain.1h' or 'rain.3h'
                rain_level = data.get("rain", {}).get("1h", 0)
                temp = data["main"]["temp"]
                
                return self._process_weather(city, condition, rain_level, temp)
        except Exception as e:
            print(f"Error fetching weather: {e}")
            # Fallback to mock on error for stability in demo
            return self._process_weather(city, "Clear", 0, 25)

    def _process_weather(self, city: str, condition: str, rain_level: float, temp: float) -> Dict[str, Any]:
        eligible = rain_level > 3
        payout = 0
        if eligible:
            payout = 200 if rain_level <= 10 else 500
            
        return {
            "city": city,
            "weather": condition,
            "rain_level": round(rain_level, 2),
            "temperature": round(temp, 1),
            "eligible_for_claim": eligible,
            "payout": payout
        }

weather_service = WeatherService()
