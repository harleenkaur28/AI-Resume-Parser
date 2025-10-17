"""Resume generator utilities.

Provides a robust, tool-enabled resume tailoring pipeline based on LangGraph.

Usage:
    from app.services.resume_generator import generate_tailored_resume

    result = generate_tailored_resume(
            resume_text=my_resume,
            job="Software Engineer",
            company_name="Nike",
            company_website="https://nike.com",
            job_description=jd_text,
    )
"""

from .graph import (
    run_resume_pipeline as generate_tailored_resume,
    GraphBuilder,
)

__all__ = [
    "generate_tailored_resume",
    "GraphBuilder",
]
