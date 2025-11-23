"""Resume package exposing request/response models."""

from . import response

# re-export the model classes at package level for backward compatibility
from .response import (
    ResumeAnalysis,
    ResumeUploadResponse,
    ResumeListResponse,
    ResumeCategoryResponse,
    ScoreRequest,
    RecommendationItem,
    ResumeResult,
    ScoreResponse,
    ResumeAnalyzerResponse,
    CompareToJDResponse,
    FormattedAndAnalyzedResumeResponse,
)

__all__ = [
    "response",
    "ResumeAnalysis",
    "ResumeUploadResponse",
    "ResumeListResponse",
    "ResumeCategoryResponse",
    "ScoreRequest",
    "RecommendationItem",
    "ResumeResult",
    "ScoreResponse",
    "ResumeAnalyzerResponse",
    "CompareToJDResponse",
    "FormattedAndAnalyzedResumeResponse",
]
