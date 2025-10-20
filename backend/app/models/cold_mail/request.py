from typing import Optional
from pydantic import BaseModel, Field, HttpUrl


class ColdMailRequest(BaseModel):
    recipient_name: str = Field(
        ...,
        min_length=1,
        description="Name of the person being emailed.",
    )
    recipient_designation: str = Field(
        ...,
        min_length=1,
        description="Designation of the recipient.",
    )
    company_name: str = Field(
        ...,
        min_length=1,
        description="Company the recipient works for.",
    )
    sender_name: str = Field(
        ...,
        min_length=1,
        description="Your name (sender).",
    )
    sender_role_or_goal: str = Field(
        ...,
        min_length=1,
        description="Your primary goal or role you're interested in.",
    )
    key_points_to_include: str = Field(
        ...,
        min_length=10,
        description="Key points or achievements to highlight.",
    )
    additional_info_for_llm: Optional[str] = Field(
        "",
        description="Any other context for the LLM.",
    )
    company_url: Optional[HttpUrl] = Field(
        None,
        description="URL of the company for research (optional).",
    )
