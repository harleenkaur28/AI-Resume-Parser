# /Users/taf/Projects/Resume Portal/backend/schemas/prep.py
import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional


class InterviewRequestDB(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    role: str
    questions: List[str]  # Stored as JSONB in DB, parsed to List[str]
    company_name: str
    user_knowledge: Optional[str] = ""
    company_url: Optional[str] = None
    word_limit: int
    created_at: datetime

    class Config:
        orm_mode = True


class InterviewAnswerDB(BaseModel):
    id: uuid.UUID
    request_id: uuid.UUID  # Foreign key to InterviewRequestDB
    question: str
    answer: str  # Generated answer
    created_at: datetime

    class Config:
        orm_mode = True
