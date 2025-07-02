# All Pydantic models for the backend
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class WorkExperienceEntry(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None


class ProjectEntry(BaseModel):
    title: Optional[str] = None
    technologies_used: Optional[List[str]] = Field(default_factory=list)
    description: Optional[str] = None


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
