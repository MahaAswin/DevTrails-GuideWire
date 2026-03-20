from fastapi import APIRouter


router = APIRouter()


@router.get("/current")
async def get_current_weather(city: str):
    # Weather data logic can be reimplemented against external APIs as needed.
    return {"city": city, "eligible_for_claim": False}
