from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router
from .config import (
    GOOGLE_API_KEY,
    DEFAULT_MODEL_PROVIDER,
    DEFAULT_MODEL_NAME,
)

app = FastAPI(
    title="Resume Portal API",
    description="API for resume analysis, hiring assistance, and cold email generation",
    version="2.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)


@app.get("/")
async def root():
    """Root endpoint returning API information."""
    return {
        "name": "Resume Portal API",
        "version": "2.0.0",
        "description": "API for resume analysis, hiring assistance, and cold email generation",
        "documentation": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "llm_provider": DEFAULT_MODEL_PROVIDER,
        "llm_model": DEFAULT_MODEL_NAME,
        "llm_available": bool(GOOGLE_API_KEY),
    }
