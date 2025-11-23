"""Tailored resume generation models."""

from typing import Optional
from pydantic import BaseModel


class TailoredResumeRequest(BaseModel):
    resume_text: str
    job: str
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    job_description: Optional[str] = None


class TailoredResumeResponse(BaseModel):
    success: bool = True
    message: str = "Tailored resume generated successfully"
    tailored_resume: str
