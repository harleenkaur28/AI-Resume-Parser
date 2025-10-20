from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field, model_validator

from app.models.schemas import JDEvaluatorResponse
from app.services.ats import ats_evaluate_service


router = APIRouter()


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


@router.post(
    "/ats/evaluate",
    response_model=JDEvaluatorResponse,
    summary="Evaluate resume against a job description.",
)
async def evaluate_ats(payload: ATSEvaluationPayload) -> JDEvaluatorResponse:
    return await ats_evaluate_service(
        resume_text=payload.resume_text,
        jd_text=payload.jd_text,
        jd_link=payload.jd_link,
        company_name=payload.company_name,
        company_website=payload.company_website,
    )
