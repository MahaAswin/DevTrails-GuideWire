from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
import traceback

from app.routes import auth, policies, wallet, weather, claims, admin, user, claim_reports, analytics, ai, workers
from app.utils.logger import logger, log_api_request

load_dotenv()

# Enable insecure transport for local OAuth (only for local testing)
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

app = FastAPI(
    title="ShieldGig Backend (Production-Ready)",
    description="AI-powered insurance platform for gig workers",
    version="1.0.0"
)

# ✅ Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Error: {str(exc)}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Our team has been notified."}
    )

# ✅ Middleware for logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    response = await call_next(request)
    log_api_request(request.method, str(request.url), response.status_code)
    return response

# ✅ Session middleware for Google OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY", "shieldgig-secret-key-change-in-production"),
    same_site="lax",
    https_only=False
)

# ✅ CORS (Vercel -> Render)
# NOTE: Browsers require `Access-Control-Allow-Origin` to match the exact `Origin`
# when `allow_credentials=True`. Use an explicit allowlist (no '*').
cors_origins_raw = os.getenv("CORS_ORIGINS", "https://shieldgig.vercel.app,http://localhost:5173")
cors_origins = []
for o in cors_origins_raw.split(","):
    o = (o or "").strip()
    if not o:
        continue
    # Normalize possible trailing slash to avoid mismatches.
    cors_origins.append(o.rstrip("/"))
cors_origins = list(dict.fromkeys(cors_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(policies.router, prefix="/policies", tags=["Policies"])
app.include_router(wallet.router, prefix="/wallet", tags=["Wallet"])
app.include_router(weather.router, prefix="/weather", tags=["Weather"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather (API Alias)"])
app.include_router(claims.router, prefix="/claims", tags=["Claims"])
app.include_router(claim_reports.router, prefix="/claims-evidence", tags=["Claim Evidence"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(workers.router, prefix="/workers", tags=["Workers"])

# ✅ Static files
if not os.path.exists("uploads"):
    os.makedirs("uploads", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ✅ Health check
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "ShieldGig Production API is running"}