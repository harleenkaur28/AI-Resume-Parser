import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional


class InterviewRequestDB(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    role: str
    questions: List[str]
    company_name: str
    user_knowledge: Optional[str] = ""
    company_url: Optional[str] = None
    word_limit: int
    created_at: datetime

    class Config:
        orm_mode = True


class InterviewAnswerDB(BaseModel):
    id: uuid.UUID
    request_id: uuid.UUID
    question: str
    answer: str
    created_at: datetime

    class Config:
        orm_mode = True
