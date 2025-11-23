"""ATS evaluation models."""

from typing import Optional, Dict, Any
from pydantic import BaseModel


class ATSEvaluationRequest(BaseModel):
    resume_text: str
    jd_text: str
    company_name: Optional[str] = None
    company_website: Optional[str] = None


class ATSEvaluationResponse(BaseModel):
    success: bool = True
    message: str = "ATS evaluation completed successfully"
    analysis: Dict[str, Any]
    narrative: str
