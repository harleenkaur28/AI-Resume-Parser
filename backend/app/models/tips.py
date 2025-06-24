from typing import List, Optional
from pydantic import BaseModel, Field


class Tip(BaseModel):
    category: str
    advice: str


class TipsData(BaseModel):
    resume_tips: List[Tip] = Field(default_factory=list)
    interview_tips: List[Tip] = Field(default_factory=list)


class TipsResponse(BaseModel):
    success: bool = True
    message: str = "Tips retrieved successfully"
    data: TipsData


class TipsRequest(BaseModel):
    job_category: Optional[str] = None
    skills: Optional[str] = None
