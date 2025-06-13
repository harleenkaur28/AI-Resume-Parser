import os
from typing import List, Optional

from dotenv import (
    load_dotenv,
)

from pydantic import (
    model_validator,
    field_validator,
)

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)

load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "Resume Analysis API"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = "your-secret-key-please-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DB_SCHEMA: str = "public"

    DATABASE_URL: Optional[str] = None

    @field_validator("POSTGRES_SERVER")
    @classmethod
    def validate_postgres_server(cls, value: str) -> str:
        if not value or value.isspace():

            raise ValueError(
                "POSTGRES_SERVER cannot be empty or whitespace if explicitly set. "
                "If you intend to use the default 'localhost', remove POSTGRES_SERVER from your .env file or set it correctly."
            )
        return value

    @model_validator(mode="after")
    def assemble_db_connection(self) -> "Settings":
        if self.DATABASE_URL:
            if self.DATABASE_URL.startswith("postgresql+asyncpg://"):

                self.DATABASE_URL = self.DATABASE_URL.replace(
                    "postgresql+asyncpg://", "postgresql://", 1
                )

            print(f"DEBUG: Using explicitly set DATABASE_URL: {self.DATABASE_URL}")

            return self

        from urllib.parse import quote_plus

        user = quote_plus(self.POSTGRES_USER)
        password = quote_plus(self.POSTGRES_PASSWORD)

        self.DATABASE_URL = (
            f"postgresql://{user}:{password}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

        print(
            f"DEBUG: Constructed DATABASE_URL: {self.DATABASE_URL}",
        )

        return self

    GOOGLE_API_KEY: Optional[str] = None

    NLTK_DATA_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "model",
        "nltk_data",
    )

    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()
