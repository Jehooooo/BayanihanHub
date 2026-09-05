from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import verification
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
async def health_check():
    return {
        "status": "online",
        "service": "BayanihanHub-Python-Backend",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
    )
