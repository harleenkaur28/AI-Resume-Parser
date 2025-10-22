"""
Service helper to generate a tailored resume using the LangGraph-based generator.

Environment:
- GOOGLE_API_KEY must be set (for Gemini via langchain-google-genai)
- Optional: TAVILY_API_KEY for web search enrichment (if available)
"""

import json
from json import JSONDecodeError
from typing import Optional

from app.services.resume_generator import generate_tailored_resume
from app.models.schemas import (
    ComprehensiveAnalysisData,
    ComprehensiveAnalysisResponse,
)


async def tailor_resume(
    resume_text: str,
    job_role: str,
    company_name: Optional[str] = None,
    company_website: Optional[str] = None,
    job_description: Optional[str] = None,
) -> ComprehensiveAnalysisResponse:
    """Generate a tailored resume analysis response from the provided context."""

    normalized_resume = resume_text.strip() if resume_text else ""

    if not normalized_resume:
        return ComprehensiveAnalysisResponse(
            success=False,
            message="Resume text cannot be empty",
            data=ComprehensiveAnalysisData(),
        )

    if not job_role or not job_role.strip():
        job_role = "Software Engineer"

    # run_resume_pipeline is async (per generator implementation) so await it
    raw_result = await generate_tailored_resume(
        resume=normalized_resume,
        job=job_role,
        company_name=company_name,
        company_website=company_website,
        jd=job_description,
    )

    if isinstance(raw_result, str):
        try:
            parsed_result = json.loads(raw_result)
        except JSONDecodeError:
            # LLM occasionally returns invalid JSON; surface a graceful error payload.
            return ComprehensiveAnalysisResponse(
                success=False,
                message="Failed to parse tailored resume output",
                data=ComprehensiveAnalysisData(),
                cleaned_text=raw_result,
            )

    elif isinstance(raw_result, dict):
        parsed_result = raw_result

    else:
        return ComprehensiveAnalysisResponse(
            success=False,
            message="Unexpected response type from resume generator",
            data=ComprehensiveAnalysisData(),
        )

    if isinstance(parsed_result, dict) and parsed_result.get("error"):
        return ComprehensiveAnalysisResponse(
            success=False,
            message=parsed_result.get("error", "Tailored resume generation failed"),
            data=ComprehensiveAnalysisData(),
            cleaned_text=parsed_result.get("raw"),
        )

    try:
        analysis = ComprehensiveAnalysisData.model_validate(parsed_result)  # type: ignore[attr-defined]

    except AttributeError:
        # Support older Pydantic versions if required.
        analysis = ComprehensiveAnalysisData.parse_obj(parsed_result)  # type: ignore[attr-defined]

    return ComprehensiveAnalysisResponse(
        data=analysis,
    )
