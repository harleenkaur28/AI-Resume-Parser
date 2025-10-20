"""JD evaluator models."""

from typing import Optional, List
from pydantic import BaseModel, Field


class JDEvaluatorRequest(BaseModel):
    """Input model for the JD evaluator agent.

    Fields mirror the prompt inputs used by the JD evaluator.
    """

    company_name: Optional[str] = None
    company_website_content: Optional[str] = None
    jd: Optional[str] = Field(..., min_length=1)
    jd_link: Optional[str] = None
    resume: str = Field(..., min_length=1)


class JDEvaluatorResponse(BaseModel):
    """Structured response expected from the JD evaluator.

    Matches the strict JSON schema required by the JD evaluator prompt.
    """

    success: bool = True
    message: str = "JD evaluation completed"
    score: int
    reasons_for_the_score: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
