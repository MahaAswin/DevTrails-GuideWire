from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard", summary="Get platform dashboard data")
async def get_dashboard_data():
    platforms = [
        { "name": "Zomato", "color": "red", "data": { "policies": 4500, "risk": "Medium", "payouts": "12.4L" } },
        { "name": "Swiggy", "color": "orange", "data": { "policies": 3800, "risk": "Low", "payouts": "8.2L" } },
        { "name": "Zepto", "color": "purple", "data": { "policies": 2100, "risk": "High", "payouts": "15.1L" } },
        { "name": "Amazon", "color": "blue", "data": { "policies": 5200, "risk": "Low", "payouts": "5.6L" } },
        { "name": "Dunzo", "color": "green", "data": { "policies": 1200, "risk": "Medium", "payouts": "4.3L" } },
        { "name": "Flipkart", "color": "indigo", "data": { "policies": 3100, "risk": "Low", "payouts": "6.8L" } },
    ]
    return {
        "summary": {
            "total_covered": "19,900",
            "system_risk": "Elevated"
        },
        "platforms": platforms
    }

@router.get("/", summary="Get admin analytics dashboard data")
async def get_analytics():
    return {
        "message": "Analytics dashboard data",
        "total_workers": 1500,
        "active_policies": 1200,
        "pending_claims": 45,
        "total_payouts": 250000.0
    }
