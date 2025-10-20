"""LinkedIn post generation models."""

from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl


class PostGenerationRequest(BaseModel):
    topic: str
    tone: Optional[str] = None
    audience: Optional[List[str]] = None
    length: Optional[Literal["Short", "Medium", "Long", "Any"]] = "Medium"
    hashtags_option: Optional[str] = "suggest"
    cta_text: Optional[str] = None
    mimic_examples: Optional[str] = None
    language: Optional[str] = None
    post_count: int = Field(default=3, ge=1, le=5)
    emoji_level: int = Field(default=1, ge=0, le=3)
    github_project_url: Optional[HttpUrl] = None
    enable_research: bool = Field(
        default=True, description="Enable web research for topic insights"
    )


class Source(BaseModel):
    title: str
    link: str


class GeneratedPost(BaseModel):
    text: str
    hashtags: Optional[List[str]] = None
    cta_suggestion: Optional[str] = None
    token_info: Optional[Dict[str, Any]] = None
    sources: Optional[List[Source]] = None
    github_project_name: Optional[str] = None


class StreamingEvent(BaseModel):
    type: str
    message: Optional[str] = None
    payload: Optional[Any] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class PostGenerationResponse(BaseModel):
    success: bool = True
    message: str = "Posts generated successfully"
    posts: List[GeneratedPost]
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
