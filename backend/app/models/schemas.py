# All Pydantic models for the backend
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime, timezone
from pydantic import BaseModel, Field, HttpUrl


class WorkExperienceEntry(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None


class ProjectEntry(BaseModel):
    title: Optional[str] = None
    technologies_used: Optional[List[str]] = Field(default_factory=list)
    description: Optional[str] = None


class PublicationEntry(BaseModel):
    title: str
    authors: Optional[str] = None
    journal_conference: Optional[str] = None
    year: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None


class PositionOfResponsibilityEntry(BaseModel):
    title: str
    organization: str
    duration: Optional[str] = None
    description: Optional[str] = None


class CertificationEntry(BaseModel):
    name: str
    issuing_organization: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    url: Optional[str] = None


class AchievementEntry(BaseModel):
    title: str
    description: Optional[str] = None
    year: Optional[str] = None
    category: Optional[str] = (
        None  # e.g., "Academic", "Professional", "Competition", "Award"
    )


class SkillProficiency(BaseModel):
    skill_name: str
    percentage: int


class UIDetailedWorkExperienceEntry(BaseModel):
    role: str
    company_and_duration: str
    bullet_points: List[str]


class UIProjectEntry(BaseModel):
    title: str
    technologies_used: List[str] = Field(default_factory=list)
    description: str


class UIPublicationEntry(BaseModel):
    title: str
    authors: Optional[str] = None
    journal_conference: Optional[str] = None
    year: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None


class UIPositionOfResponsibilityEntry(BaseModel):
    title: str
    organization: str
    duration: Optional[str] = None
    description: Optional[str] = None


class UICertificationEntry(BaseModel):
    name: str
    issuing_organization: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    url: Optional[str] = None


class UIAchievementEntry(BaseModel):
    title: str
    description: Optional[str] = None
    year: Optional[str] = None
    category: Optional[str] = None


class LanguageEntry(BaseModel):
    language: str


class EducationEntry(BaseModel):
    education_detail: str


class ComprehensiveAnalysisData(BaseModel):
    skills_analysis: List[SkillProficiency] = Field(default_factory=list)
    recommended_roles: List[str] = Field(default_factory=list)
    languages: List[LanguageEntry] = Field(default_factory=list)
    education: List[EducationEntry] = Field(default_factory=list)
    work_experience: List[UIDetailedWorkExperienceEntry] = Field(default_factory=list)
    projects: List[UIProjectEntry] = Field(default_factory=list)
    publications: List[UIPublicationEntry] = Field(default_factory=list)
    positions_of_responsibility: List[UIPositionOfResponsibilityEntry] = Field(
        default_factory=list
    )
    certifications: List[UICertificationEntry] = Field(default_factory=list)
    achievements: List[UIAchievementEntry] = Field(default_factory=list)
    name: Optional[str] = None
    email: Optional[str] = None
    contact: Optional[str] = None
    predicted_field: Optional[str] = None


class ComprehensiveAnalysisResponse(BaseModel):
    success: bool = True
    message: str = "Comprehensive analysis successful"
    data: ComprehensiveAnalysisData
    cleaned_text: Optional[str] = None


class Tip(BaseModel):
    category: str
    advice: str


class TipsData(BaseModel):
    resume_tips: List[Tip] = Field(default_factory=list)
    interview_tips: List[Tip] = Field(default_factory=list)


class TipsResponse(BaseModel):
    success: bool = True
    message: str = "Tips retrieved successfully"
    data: TipsData


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


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_detail: Optional[str] = None


class HiringAssistantRequest(BaseModel):
    role: str = Field(
        ...,
        min_length=1,
        description="The role the candidate is applying for.",
    )
    questions: List[str] = Field(
        default_factory=list,
        description="List of interview questions.",
    )
    company_name: str = Field(
        ...,
        min_length=1,
        description="Name of the company.",
    )
    user_knowledge: Optional[str] = Field(
        default="",
        description="What the user already knows about the company/role.",
    )
    company_url: Optional[str] = Field(
        None,
        description="URL of the company for research.",
    )
    word_limit: Optional[int] = Field(
        150,
        ge=50,
        le=500,
        description="Word limit for each answer.",
    )


class HiringAssistantResponse(BaseModel):
    success: bool = True
    message: str = "Answers generated successfully."
    data: Dict[str, str]


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
    company_url: Optional[str] = Field(
        None,
        description="URL of the company for research (optional).",
    )


class ColdMailResponse(BaseModel):
    success: bool = True
    message: str = "Cold email content generated successfully."
    subject: str
    body: str


class FormattedAndAnalyzedResumeResponse(BaseModel):
    success: bool = True
    message: str = "Resume formatted and analyzed successfully"
    cleaned_text: str
    analysis: ComprehensiveAnalysisData


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


# LinkedIn Post Generation Models
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
