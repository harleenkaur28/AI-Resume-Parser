from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class HiringAssistantRequest(BaseModel):
    role: str = Field(
        ..., min_length=1, description="The role the candidate is applying for."
    )
    questions: List[str] = Field(
        ..., min_items=1, description="List of interview questions."
    )
    company_name: str = Field(..., min_length=1, description="Name of the company.")
    user_knowledge: Optional[str] = Field(
        "", description="What the user already knows about the company/role."
    )
    company_url: Optional[str] = Field(
        None, description="URL of the company for research."
    )
    word_limit: Optional[int] = Field(150, description="Word limit for each answer.")


class HiringAssistantResponse(BaseModel):
    success: bool = True
    message: str = "Answers generated successfully."
    data: Dict[str, str]


class ColdMailRequest(BaseModel):
    recipient_name: str = Field(
        ..., min_length=1, description="Name of the person being emailed."
    )
    recipient_designation: str = Field(
        ..., min_length=1, description="Designation of the recipient."
    )
    company_name: str = Field(
        ..., min_length=1, description="Company the recipient works for."
    )
    sender_name: str = Field(..., min_length=1, description="Your name (sender).")
    sender_role_or_goal: str = Field(
        ..., min_length=1, description="Your primary goal or role you're interested in."
    )
    key_points_to_include: str = Field(
        ..., min_length=10, description="Key points or achievements to highlight."
    )
    additional_info_for_llm: Optional[str] = Field(
        "", description="Any other context for the LLM."
    )
    company_url: Optional[str] = Field(
        None, description="URL of the company for research."
    )


class ColdMailResponse(BaseModel):
    success: bool = True
    message: str = "Cold email content generated successfully."
    subject: str
    body: str
