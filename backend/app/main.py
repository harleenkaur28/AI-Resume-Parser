from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints import router as v1_router
from app.api.v2.endpoints import router as v2_router

app = FastAPI(
    title="Resume Analysis API",
    description="API for analyzing resumes, extracting structured data, and providing tips for improvement.",
    version="1.4.3",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix="/api")
app.include_router(v2_router, prefix="/api")
