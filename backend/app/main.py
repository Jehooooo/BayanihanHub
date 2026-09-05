from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.routers import verification
from app.db import get_db
import app.config as config

app = FastAPI(
    title="Bayanihan Hub Identity Verification API",
    description="Python FastAPI backend powering identity verification, Philippine ID validation, and biometric facial checks for Bayanihan Hub.",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(verification.router)


@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "BayanihanHub-Python-Backend",
        "version": "1.0.0",
    }


@app.get("/db-health")
@app.get("/api/db-health")
def db_health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "engine": "MySQL 8.4 (Laragon)",
            "database": "bayanihan_hub",
        }
    except Exception as exc:
        return {
            "status": "disconnected",
            "error": str(exc),
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
    )
