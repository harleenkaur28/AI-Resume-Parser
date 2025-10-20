from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.models.schemas import ComprehensiveAnalysisResponse
from app.services.tailored_resume import tailor_resume


router = APIRouter()


class TailoredResumePayload(BaseModel):
    resume_text: str = Field(..., min_length=1, description="Resume content to tailor")
    job_role: str = Field(..., min_length=1, description="Target job role")
    company_name: Optional[str] = Field(
        default=None,
        description="Optional company name for personalization.",
    )
    company_website: Optional[str] = Field(
        default=None,
        description="Optional company website content or URL for context.",
    )
    job_description: Optional[str] = Field(
        default=None,
        description="Optional job description text for deeper alignment.",
    )


@router.post(
    "/resume/tailor",
    response_model=ComprehensiveAnalysisResponse,
    summary="Generate a tailored resume analysis.",
)
async def generate_tailored_resume(
    payload: TailoredResumePayload,
) -> ComprehensiveAnalysisResponse:
    return await tailor_resume(
        resume_text=payload.resume_text,
        job_role=payload.job_role,
        company_name=payload.company_name,
        company_website=payload.company_website,
        job_description=payload.job_description,
    )
