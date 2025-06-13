# /Users/taf/Projects/Resume Portal/backend/core/config.py
import os
from typing import List, Optional
from dotenv import (
    load_dotenv,
)  # Kept for explicit loading, though Pydantic can also handle .env
from pydantic import model_validator, field_validator  # MODIFIED
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "Resume Analysis API"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = "your-secret-key-please-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # PostgreSQL connection components
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DB_SCHEMA: str = "public"

    # DATABASE_URL will be constructed if not explicitly provided
    DATABASE_URL: Optional[str] = None

    @field_validator("POSTGRES_SERVER")  # ADDED
    @classmethod  # ADDED
    def validate_postgres_server(cls, value: str) -> str:  # ADDED
        if not value or value.isspace():  # ADDED
            # If POSTGRES_SERVER is explicitly set to empty/whitespace in .env, this will catch it.
            # If not set in .env, the default "localhost" is used, which passes this.
            raise ValueError(  # ADDED
                "POSTGRES_SERVER cannot be empty or whitespace if explicitly set. "  # ADDED
                "If you intend to use the default 'localhost', remove POSTGRES_SERVER from your .env file or set it correctly."  # ADDED
            )  # ADDED
        return value  # ADDED

    @model_validator(mode="after")
    def assemble_db_connection(self) -> "Settings":
        if (
            self.DATABASE_URL
        ):  # If DATABASE_URL is explicitly set (e.g., in .env), use it
            # Validate if the explicitly set URL is in the old format and adjust
            if self.DATABASE_URL.startswith("postgresql+asyncpg://"):
                self.DATABASE_URL = self.DATABASE_URL.replace(
                    "postgresql+asyncpg://", "postgresql://", 1
                )
            print(
                f"DEBUG: Using explicitly set DATABASE_URL: {self.DATABASE_URL}"
            )  # ADDED
            return self

        # Construct DATABASE_URL from components for asyncpg
        # Pydantic already validates that POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB are set (as they are required string fields)
        # and POSTGRES_SERVER has a default or is validated by validate_postgres_server.
        # POSTGRES_PORT has a default.

        # Ensure POSTGRES_USER and POSTGRES_PASSWORD are properly encoded if they contain special characters
        from urllib.parse import quote_plus

        user = quote_plus(self.POSTGRES_USER)
        password = quote_plus(self.POSTGRES_PASSWORD)

        self.DATABASE_URL = (
            f"postgresql://{user}:{password}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
        print(f"DEBUG: Constructed DATABASE_URL: {self.DATABASE_URL}")
        # If you had specific schema needs beyond the default search_path:
        # self.DATABASE_URL += f"?options=-csearch_path%3D{self.DB_SCHEMA},public" # Example for setting search_path
        return self

    GOOGLE_API_KEY: Optional[str] = None

    NLTK_DATA_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "model",
        "nltk_data",
    )

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # Server settings for Uvicorn
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()

# Old direct variables (can be removed or kept for other modules if they haven't been updated)
# SECRET_KEY = settings.SECRET_KEY
# ALGORITHM = settings.ALGORITHM
# ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
# DATABASE_URL = settings.DATABASE_URL
# GOOGLE_API_KEY = settings.GOOGLE_API_KEY
# NLTK_DATA_PATH = settings.NLTK_DATA_PATH
