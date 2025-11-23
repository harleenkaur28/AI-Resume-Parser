"""Hiring assistant request and response models."""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class HiringAssistantRequest(BaseModel):
    role: str = Field(
        ...,
        min_length=1,
        description="The role the candidate is applying for.",
    )
    questions: List[str] = Field(
        default_factory=list,
        description="List of interview questions.",
    )
    company_name: str = Field(
        ...,
        min_length=1,
        description="Name of the company.",
    )
    user_knowledge: Optional[str] = Field(
        default="",
        description="What the user already knows about the company/role.",
    )
    company_url: Optional[str] = Field(
        None,
        description="URL of the company for research.",
    )
    word_limit: Optional[int] = Field(
        150,
        ge=50,
        le=500,
        description="Word limit for each answer.",
    )


class HiringAssistantResponse(BaseModel):
    success: bool = True
    message: str = "Answers generated successfully."
    data: Dict[str, str]
