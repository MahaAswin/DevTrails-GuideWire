from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="ShieldGig Backend",
    description="AI-powered insurance platform for gig workers",
    version="1.0.0"
)

from app.database.mongodb import users_collection, policies_collection

@app.on_event("startup")
async def startup_db_client():
    # Seed default admin
    admin_email = "admin@shieldgig.com"
    if not users_collection.find_one({"email": admin_email}):
        admin_user = {
            "name": "System Admin",
            "email": admin_email,
            "password": "admin123_hashed", # Simple mock hash matching auth route logic
            "platform": "ShieldGig",
            "city": "Global",
            "role": "admin"
        }
        users_collection.insert_one(admin_user)
        print("Default admin created: admin@shieldgig.com / admin123")

    # Seed default micro-policies (LIC style)
    if policies_collection.count_documents({}) == 0:
        default_policies = [
            {
                "name": "Daily Life Micro-Cover",
                "platform": "All",
                "weekly_premium": 7, # 1 rupee a day equivalent
                "max_coverage": 50000,
                "trigger_condition": "Accidental Death or Disability"
            },
            {
                "name": "Weekly Accident Shield",
                "platform": "Zomato",
                "weekly_premium": 25,
                "max_coverage": 15000,
                "trigger_condition": "Hospitalization > 24 hours"
            },
            {
                "name": "Swiggy Monsoon Health",
                "platform": "Swiggy",
                "weekly_premium": 15,
                "max_coverage": 5000,
                "trigger_condition": "Verified illness during Red Alert"
            }
        ]
        policies_collection.insert_many(default_policies)
        print("Default micro-policies seeded.")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend origings
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers here
from app.routes import workers, policies, claims, risk, analytics, auth, admin, reports, wallet, claim_reports, weather
from fastapi.staticfiles import StaticFiles
import os
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/admin", tags=["Admin Dashboard"])
app.include_router(reports.router, prefix="/report", tags=["Reports"])
app.include_router(workers.router, prefix="/workers", tags=["Workers"])
app.include_router(policies.router, prefix="/policies", tags=["Policies"])
app.include_router(claims.router, prefix="/claims", tags=["Claims"])
app.include_router(risk.router, prefix="/risk", tags=["Risk"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(wallet.router, prefix="/wallet", tags=["Wallet"])
app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(claim_reports.router, prefix="/claims-evidence", tags=["Claim Evidence"])

# Serve uploads directory
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "ShieldGig API is running"}

# Placeholder endpoints as requested are now handled by external routers.
# Using /ai/chat at the main level as a placeholder payload route.

@app.post("/ai/chat", tags=["AI"], description="Placeholder for future LLM chatbot integration")
async def ai_chat():
    return {"message": "Chatbot not implemented yet"}
