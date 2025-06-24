from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from ..models import (
    TipsResponse,
    ErrorResponse,
)

router = APIRouter()


@router.get(
    "/generate/tips/",
    response_model=TipsResponse,
    description="Generates career & resume tips based on job category and skills.",
    tags=["V1"],
)
async def get_career_tips(
    job_category: Optional[str] = Query(
        None,
        description="Job category for tailored tips",
    ),
    skills: Optional[str] = Query(
        None,
        description="Comma-separated skills for tailored tips",
    ),
):
    """Generate career and resume tips."""
    try:
        # TODO: Implement tips generation using LLM
        # For now, return placeholder tips
        tips_data = {
            "resume_tips": [
                {
                    "category": "Format",
                    "advice": "Keep your resume clean and well-organized with clear sections.",
                },
                {
                    "category": "Content",
                    "advice": "Highlight your most relevant achievements and skills for the target role.",
                },
            ],
            "interview_tips": [
                {
                    "category": "Preparation",
                    "advice": "Research the company and role thoroughly before the interview.",
                },
                {
                    "category": "Communication",
                    "advice": "Practice clear and concise communication of your experience and skills.",
                },
            ],
        }

        return TipsResponse(
            success=True,
            message="Tips retrieved successfully",
            data=tips_data,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                success=False,
                message="Error generating tips",
                error_detail=str(e),
            ),
        )
