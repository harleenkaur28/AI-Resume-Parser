from fastapi import APIRouter, Query
from typing import Optional
from app.models.schemas import TipsResponse
from app.services import tips

router = APIRouter()


@router.get(
    "/generate/tips/",
    response_model=TipsResponse,
    description="Generates career & resume tips based on job category and skills.",
)
async def get_career_tips(
    job_category: Optional[str] = Query(
        None,
        description="Job category for tailored tips",
    ),
    skills: Optional[str | list[str]] = Query(
        None,
        description="Comma-separated skills for tailored tips",
    ),
):
    if job_category:
        job_category = job_category.strip().lower()
        if not job_category:
            job_category = "general"

    else:
        job_category = "general"

    if skills is None:
        skills_param = []

    else:
        skills_param = skills

    return tips.get_career_tips_service(job_category, skills_param)
