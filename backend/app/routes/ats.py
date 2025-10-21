from typing import Optional
import logging

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field, model_validator

from app.models.schemas import JDEvaluatorResponse
from app.services.ats import ats_evaluate_service
from app.services.utils import process_document

file_based_router = APIRouter()
text_based_router = APIRouter()
logger = logging.getLogger(__name__)


class ATSEvaluationPayload(BaseModel):
    resume_text: str = Field(
        ..., min_length=1, description="Resume content to evaluate"
    )
    jd_text: Optional[str] = Field(
        default=None,
        description="Raw job description text. Required if jd_link is not provided.",
    )
    jd_link: Optional[str] = Field(
        default=None,
        description="URL pointing to the job description. Used when jd_text is not supplied.",
    )
    company_name: Optional[str] = Field(
        default=None,
        description="Optional company name for additional context.",
    )
    company_website: Optional[str] = Field(
        default=None,
        description="Optional company website content or URL for enrichment.",
    )

    @model_validator(mode="after")
    def ensure_job_description_source(self) -> "ATSEvaluationPayload":
        if not (self.jd_text or self.jd_link):
            raise ValueError("Either jd_text or jd_link must be provided.")
        return self


@text_based_router.post(
    "/ats/evaluate",
    response_model=JDEvaluatorResponse,
    summary="Evaluate resume against a job description.",
)
async def evaluate_ats(payload: ATSEvaluationPayload) -> JDEvaluatorResponse:
    try:
        return await ats_evaluate_service(
            resume_text=payload.resume_text,
            jd_text=payload.jd_text,
            jd_link=payload.jd_link,
            company_name=payload.company_name,
            company_website=payload.company_website,
        )

    except Exception:
        logger.exception(
            "ATS evaluation request failed",
            extra={
                "company_name": payload.company_name,
                "has_jd_text": bool(payload.jd_text),
                "has_jd_link": bool(payload.jd_link),
            },
        )
        raise


@file_based_router.post(
    "/ats/evaluate",
    response_model=JDEvaluatorResponse,
    summary="Evaluate resume against a job description (file-based).",
    description=(
        "Upload a resume file and optionally a job description file or provide a JD link."
    ),
)
async def evaluate_ats_file_based(
    resume_file: UploadFile = File(...),
    jd_file: Optional[UploadFile] = File(None),
    jd_link: Optional[str] = Form(None),
    company_name: Optional[str] = Form(None),
    company_website: Optional[str] = Form(None),
) -> JDEvaluatorResponse:
    # Read and process resume file
    resume_bytes = await resume_file.read()
    resume_text = process_document(resume_bytes, resume_file.filename)
    if not resume_text:
        raise HTTPException(status_code=400, detail="Failed to process resume file.")

    # Determine JD text (from file) or use link
    jd_text: Optional[str] = None
    if jd_file is not None:
        jd_bytes = await jd_file.read()
        jd_text = process_document(jd_bytes, jd_file.filename)
        if not jd_text:
            raise HTTPException(status_code=400, detail="Failed to process JD file.")

    if not jd_text and not jd_link:
        raise HTTPException(
            status_code=400, detail="Either a JD file or jd_link must be provided."
        )

    return await ats_evaluate_service(
        resume_text=resume_text,
        jd_text=jd_text,
        jd_link=jd_link,
        company_name=company_name,
        company_website=company_website,
    )
