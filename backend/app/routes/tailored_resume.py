from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field

from app.models.schemas import ComprehensiveAnalysisResponse
from app.services.tailored_resume import tailor_resume
from app.services.utils import process_document


file_based_router = APIRouter()
text_based_router = APIRouter()


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


@text_based_router.post(
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


@file_based_router.post(
    "/resume/tailor",
    response_model=ComprehensiveAnalysisResponse,
    summary="Generate a tailored resume analysis (file-based).",
    description="Upload a resume file and optional JD/company context to tailor it to a role.",
)
async def generate_tailored_resume_file_based(
    resume_file: UploadFile = File(...),
    job_role: str = Form(...),
    company_name: Optional[str] = Form(None),
    company_website: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
) -> ComprehensiveAnalysisResponse:
    resume_bytes = await resume_file.read()
    resume_text = process_document(resume_bytes, resume_file.filename)
    if not resume_text:
        raise HTTPException(status_code=400, detail="Failed to process resume file.")

    return await tailor_resume(
        resume_text=resume_text,
        job_role=job_role,
        company_name=company_name,
        company_website=company_website,
        job_description=job_description,
    )
