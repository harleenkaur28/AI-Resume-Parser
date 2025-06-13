from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from core.config import settings
from core.ml_setup import load_ml_models
from db.session import (
    get_db_pool,
    close_db_pool,
)  # Removed engine import as it's not used
from db.init_db import initialize_database

# Import your API routers
from api.endpoints import auth as api_auth
from api.endpoints import resume_analysis as api_resume_analysis
from api.endpoints import hiring_assistant as api_hiring_assistant  # ADDED
from api.endpoints import cold_mail_generator as api_cold_mail_generator  # ADDED

# Import your Pydantic models if they need to be created in the database (e.g., using SQLModel or similar)
# from schemas import user as user_schema # Example, adjust as needed
# from schemas import resume as resume_schema # Example, adjust as needed

# If you are using SQLAlchemy and need to create tables based on models:
# from db.base_class import Base # Assuming you have a Base for SQLAlchemy models
# from models import user_model, resume_model # Import your SQLAlchemy models


app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.on_event("startup")
async def startup_event():
    print("Starting up application...")
    await get_db_pool()  # Initialize database connection pool
    await initialize_database()  # Create tables if they don't exist
    load_ml_models()  # Load ML models and resources
    print("Application startup complete.")
    # If using SQLAlchemy and have Base metadata (and an engine):
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)
    # print("Database tables checked/created.")


@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down application...")
    await close_db_pool()  # Close database connection pool
    print("Application shutdown complete.")


# Include API routers
app.include_router(
    api_auth.router,
    prefix=settings.API_V1_STR,
    tags=["auth"],
)
app.include_router(
    api_resume_analysis.router,
    prefix=settings.API_V1_STR + "/analysis",
    tags=["resume_analysis"],
)
app.include_router(  # ADDED
    api_hiring_assistant.router,  # ADDED
    prefix=settings.API_V1_STR + "/hiring",  # ADDED
    tags=["hiring_assistant"],  # ADDED
)  # ADDED
app.include_router(  # ADDED
    api_cold_mail_generator.router,  # ADDED
    prefix=settings.API_V1_STR + "/cold-mail",  # ADDED
    tags=["cold_mail_generator"],  # ADDED
)  # ADDED


@app.get("/")
async def root():
    return {"message": "Welcome to the Resume Analysis API"}


if __name__ == "__main__":
    print(
        f"Starting Uvicorn server on host {settings.SERVER_HOST} and port {settings.SERVER_PORT}"
    )
    uvicorn.run(app, host=settings.SERVER_HOST, port=settings.SERVER_PORT)
