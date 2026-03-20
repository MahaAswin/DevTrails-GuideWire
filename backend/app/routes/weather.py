from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
import httpx
import os
from dotenv import load_dotenv
from datetime import datetime

from app.db.mongodb import users_collection, claims_collection, transactions_collection

load_dotenv()

router = APIRouter()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")


def _extract_rain_level(openweather_payload: dict) -> float:
    rain = openweather_payload.get("rain") or {}
    for key in ("1h", "3h"):
        if key in rain and rain[key] is not None:
            try:
                return float(rain[key])
            except Exception:
                continue
    return 0.0


def _is_rain_condition(condition_main: str, rain_level: float) -> bool:
    if rain_level > 0:
        return True
    c = (condition_main or "").lower()
    return c in {"rain", "drizzle", "thunderstorm", "heavy rain"}


def _compute_risk_score(rain_level: float, wind_speed: float, humidity: float) -> int:
    # Heuristic scoring (0-100): rain dominates, wind/humidity add small increments.
    score = (rain_level * 10.0) + (humidity * 0.1) + (wind_speed * 0.5)
    score = max(0.0, min(100.0, score))
    return int(round(score))


def _compute_payout(risk_score: int, eligible: bool) -> float:
    if not eligible:
        return 0.0
    # Parametric payout increases with risk score, capped.
    payout = 50.0 + (risk_score * 2.0)
    return float(round(min(1000.0, payout), 2))


async def _fetch_openweather_current(city: str) -> dict:
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenWeather API key not configured")

    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch weather data")
        return response.json()


class WeatherClaimRequest(BaseModel):
    email: EmailStr
    city: str


@router.get("/current")
async def get_weather_current(city: str = Query(..., example="Bangalore")):
    if not city or not city.strip():
        raise HTTPException(status_code=400, detail="city is required")

    data = await _fetch_openweather_current(city.strip())

    main = data.get("main", {}) or {}
    wind = data.get("wind", {}) or {}
    weather_list = data.get("weather") or []
    weather0 = weather_list[0] if weather_list else {}

    temp = main.get("temp")
    condition_main = weather0.get("main", "Clear")
    description = weather0.get("description", "")
    wind_speed = float(wind.get("speed", 0) or 0)
    humidity = float(main.get("humidity", 0) or 0)
    rain_level = _extract_rain_level(data)

    eligible = rain_level >= 3 or _is_rain_condition(condition_main, rain_level)
    risk_score = _compute_risk_score(rain_level=rain_level, wind_speed=wind_speed, humidity=humidity)
    payout = _compute_payout(risk_score=risk_score, eligible=eligible)
    safety_status = "SAFE" if risk_score < 60 else "RISK"
    weather_label = "Rain" if eligible else (condition_main or "Clear")
    alerts = "IMD Red Alert" if risk_score >= 80 else "None"

    return {
        "city": city,
        "temperature": temp,
        "weather": weather_label,
        "condition": condition_main,
        "description": description,
        "rain_level": rain_level,
        "wind_speed": wind_speed,
        "humidity": humidity,
        "eligible_for_claim": eligible,
        "eligible_for_rain_claim": eligible,
        "risk_score": risk_score,
        "safety_risk_score": risk_score,
        "safety_status": safety_status,
        "payout": payout,
        "alerts": alerts,
    }


# Backwards-compatible alias (some clients may still call `/weather/`)
@router.get("/")
async def get_weather_root(city: str = Query(..., example="Bangalore")):
    return await get_weather_current(city=city)


@router.post("/weather-claim")
async def weather_claim(payload: WeatherClaimRequest):
    if not payload.city or not payload.city.strip():
        raise HTTPException(status_code=400, detail="city is required")

    email_norm = payload.email.strip().lower()
    user = users_collection.find_one({"email": email_norm}) or users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = await _fetch_openweather_current(payload.city.strip())
    main = data.get("main", {}) or {}
    wind = data.get("wind", {}) or {}
    weather_list = data.get("weather") or []
    weather0 = weather_list[0] if weather_list else {}

    condition_main = weather0.get("main", "Clear")
    rain_level = _extract_rain_level(data)
    wind_speed = float(wind.get("speed", 0) or 0)
    humidity = float(main.get("humidity", 0) or 0)

    eligible = rain_level >= 3 or _is_rain_condition(condition_main, rain_level)
    risk_score = _compute_risk_score(rain_level=rain_level, wind_speed=wind_speed, humidity=humidity)
    payout = _compute_payout(risk_score=risk_score, eligible=eligible)

    if not eligible or payout <= 0:
        raise HTTPException(status_code=400, detail="Not eligible for a weather claim right now")

    # Prevent duplicate payouts for the same day.
    today_key = datetime.utcnow().strftime("%Y-%m-%d")
    existing = claims_collection.find_one(
        {"worker_id": str(user["_id"]), "type": "Weather Claim", "date_key": today_key, "status": "approved"}
    )
    if existing:
        return {"message": "Claim already approved for today", "payout": float(existing.get("amount", 0) or 0)}

    users_collection.update_one({"_id": user["_id"]}, {"$inc": {"wallet_balance": payout}})

    claim_doc = {
        "user_id": str(user["_id"]),
        "worker_id": str(user["_id"]),
        "worker": user.get("name", "Worker"),
        "platform": user.get("platform", "Unknown"),
        "type": "Weather Claim",
        "event": "Rain",
        "trigger_condition": condition_main,
        "date_key": today_key,
        "date": datetime.utcnow().isoformat(),
        "amount": payout,
        "payout": payout,
        "status": "approved",
        "created_at": datetime.utcnow(),
    }

    result = claims_collection.insert_one(claim_doc)

    transactions_collection.insert_one(
        {
            "user_id": str(user["_id"]),
            "type": "credit",
            "category": "weather_claim",
            "amount": payout,
            "description": f"Weather claim approved: {condition_main} (rain={rain_level}mm)",
            "status": "approved",
            "reference_id": str(result.inserted_id),
            "created_at": datetime.utcnow(),
        }
    )

    return {"message": "Weather claim approved. Payout credited.", "payout": payout}
