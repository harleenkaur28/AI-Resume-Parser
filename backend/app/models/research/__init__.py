"""Research package exposing request/response models."""

from .response import (
    WebSearchRequest,
    WebSearchResult,
    WebSearchResponse,
    GitHubAnalysisRequest,
    GitHubInsights,
    GitHubAnalysisResponse,
)

__all__ = [
    "WebSearchRequest",
    "WebSearchResult",
    "WebSearchResponse",
    "GitHubAnalysisRequest",
    "GitHubInsights",
    "GitHubAnalysisResponse",
]
