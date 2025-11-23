"""Resume-related request and response models."""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from app.models.common.types import WorkExperienceEntry, ProjectEntry


class ResumeAnalysis(BaseModel):
    name: str
    email: str
    contact: Optional[str] = None
    predicted_field: str
    college: Optional[str] = None
    work_experience: Optional[List[WorkExperienceEntry]] = Field(default_factory=list)
    projects: Optional[List[ProjectEntry]] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ResumeUploadResponse(BaseModel):
    success: bool = True
    message: str = "Resume analyzed successfully"
    data: ResumeAnalysis
    cleaned_data_dict: Optional[dict] = None


class ResumeListResponse(BaseModel):
    success: bool = True
    message: str = "Resumes retrieved successfully"
    data: List[ResumeAnalysis]
    count: int


class ResumeCategoryResponse(BaseModel):
    success: bool = True
    message: str = "Resumes retrieved successfully"
    data: List[ResumeAnalysis]
    count: int
    category: str


class ScoreRequest(BaseModel):
    jd_text: Optional[str]
    resume_texts: List[str]
    career_level: Optional[str] = "mid"


class RecommendationItem(BaseModel):
    id: str
    title: str
    description: str
    category: str
    priority: str
    impact: str


class ResumeResult(BaseModel):
    composite: float
    semantic: float
    compatibility: float
    contact: float
    content: float
    req_keyword_cov: float = Field(..., alias="req_keyword_cov")
    opt_keyword_cov: float
    formatting: float
    keyword_density: float
    found_keywords: List[str]
    missing_keywords: List[str]
    recommended_keywords: List[str]
    recommendations: List[RecommendationItem]
    strengths: List[str]
    areas_for_improvement: List[str]
    industry_average: float
    percentile: int
    summary: str


class ScoreResponse(BaseModel):
    timestamp: datetime
    career_level: str
    overall_score: float
    results: List[ResumeResult]


class ResumeAnalyzerResponse(BaseModel):
    success: bool = True
    message: str
    analysis: Dict[str, Any]
    suggestions: Dict[str, Any]


class CompareToJDResponse(BaseModel):
    success: bool = True
    message: str = "Comparison complete"
    match_score: float
    summary: str
    strengths: List[str]
    gaps: List[str]
    missing_keywords: List[str]
    top_fixes: List[str]
    keyword_additions: List[str]
    improved_summary: str


class FormattedAndAnalyzedResumeResponse(BaseModel):
    success: bool = True
    message: str = "Resume formatted and analyzed successfully"
    cleaned_text: str
    analysis: Any  # ComprehensiveAnalysisData, imported separately
