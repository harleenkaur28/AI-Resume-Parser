"""
Service helper to generate a tailored resume using the robust LangGraph-based generator.

Environment:
- GOOGLE_API_KEY must be set (for Gemini via langchain-google-genai)
- Optional: TAVILY_API_KEY for web search enrichment (if available)
"""

from typing import Optional

from app.services.resume_generator import generate_tailored_resume


def tailor_resume(
    resume_text: str,
    job_role: str,
    company_name: Optional[str] = None,
    company_website: Optional[str] = None,
    job_description: Optional[str] = None,
) -> str:
    """Pure function that returns a tailored resume string.

    This does not perform file I/O; it simply orchestrates the generator with the given context.
    """
    if not resume_text or not resume_text.strip():
        return ""

    if not job_role or not job_role.strip():
        job_role = "Software Engineer"

    return generate_tailored_resume(
        resume=resume_text,
        job=job_role,
        company_name=company_name,
        company_website=company_website,
        jd=job_description,
    )
