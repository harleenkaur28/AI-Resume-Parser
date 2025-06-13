import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class ColdMailRequestDB(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    recipient_name: str
    recipient_designation: str
    company_name: str
    sender_name: str
    sender_role_or_goal: str
    key_points: str
    additional_info: Optional[str] = None
    company_url: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True


class ColdMailResponseDB(BaseModel):
    id: uuid.UUID
    request_id: uuid.UUID
    subject: str
    body: str
    created_at: datetime

    class Config:
        orm_mode = True
