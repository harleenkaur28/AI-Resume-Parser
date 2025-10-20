"""Research and web search models."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, HttpUrl


class WebSearchRequest(BaseModel):
    query: str
    max_results: int = Field(default=5, ge=1, le=10)


class WebSearchResult(BaseModel):
    title: str
    url: str
    snippet: str


class WebSearchResponse(BaseModel):
    success: bool = True
    query: str
    results: List[WebSearchResult]
    research_summary: Optional[str] = None


class GitHubAnalysisRequest(BaseModel):
    github_url: HttpUrl


class GitHubInsights(BaseModel):
    key_achievement: str
    technical_highlights: str
    impact_statement: str
    linkedin_hooks: List[str]
    suggested_hashtags: List[str]
    project_stats: Dict[str, Any]


class GitHubAnalysisResponse(BaseModel):
    success: bool = True
    repository_info: Dict[str, Any]
    linkedin_insights: GitHubInsights
    timestamp: str = Field(
        default_factory=lambda: __import__("datetime").datetime.now().isoformat()
    )
