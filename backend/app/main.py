from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

from app.routes import auth, policies, wallet, weather, claims, admin, user, claim_reports, analytics

load_dotenv()

# Enable insecure transport for local OAuth (fixes 'mismatching_state' on http)
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

app = FastAPI(
    title="ShieldGig Backend (MongoDB)",
    description="AI-powered insurance platform for gig workers",
    version="1.0.0"
)

# Session middleware for Google OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY", "shieldgig-secret-key-change-in-production"),
    same_site="lax",
    https_only=False
)

frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(policies.router, prefix="/policies", tags=["Policies"])
app.include_router(wallet.router, prefix="/wallet", tags=["Wallet"])
app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(claims.router, prefix="/claims", tags=["Claims"])
app.include_router(claim_reports.router, prefix="/claims-evidence", tags=["Claim Evidence"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "ShieldGig API is running (MongoDB) "}
