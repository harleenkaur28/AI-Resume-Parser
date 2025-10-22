from fastapi import APIRouter
from backend.app.services import resume_analysis
from app.models.schemas import (
    ResumeListResponse,
    ResumeCategoryResponse,
)

router = APIRouter()


@router.get(
    "/resumes/",
    response_model=ResumeListResponse,
    description="Fetch all resumes from the database.",
)
async def get_resumes():
    return resume_analysis.get_resumes_service()


@router.get(
    "/resumes/{category}",
    response_model=ResumeCategoryResponse,
    description="Fetch resumes by category. The category is the predicted field from the resume analysis.",
)
async def get_resumes_by_category(category: str):
    return resume_analysis.get_resumes_by_category_service(category)
