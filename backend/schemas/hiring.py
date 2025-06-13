import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr


class RecruiterDB(BaseModel):
    id: uuid.UUID
    admin_id: uuid.UUID  # This should link to auth.user id
    email: EmailStr
    company_name: str
    created_at: datetime

    class Config:
        orm_mode = True
