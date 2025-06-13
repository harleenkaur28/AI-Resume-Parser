import uuid
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from .common import WorkExperienceEntry, ProjectEntry


class ResumeMetadataDB(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    custom_name: str
    file_url: str
    upload_date: datetime
    show_in_central: bool = False

    class Config:
        orm_mode = True


class AnalysisDB(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    name: str
    email: EmailStr
    contact: Optional[str] = None
    predicted_field: str
    college: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    work_experience: List[WorkExperienceEntry] = Field(default_factory=list)
    projects: List[ProjectEntry] = Field(default_factory=list)
    uploaded_at: datetime

    class Config:
        orm_mode = True


class BulkUploadDB(BaseModel):
    id: uuid.UUID
    admin_id: uuid.UUID
    file_url: str
    total_files: int
    succeeded: int = 0
    failed: int = 0
    uploaded_at: datetime

    class Config:
        orm_mode = True


class ResumeAnalysisPrompt(BaseModel):
    name: str
    email: EmailStr
    contact: Optional[str] = None
    predicted_field: str
    college: Optional[str] = None
    work_experience: Optional[List[WorkExperienceEntry]] = Field(default_factory=list)
    projects: Optional[List[ProjectEntry]] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    upload_date: datetime = Field(default_factory=datetime.utcnow)


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
    email: Optional[EmailStr] = None  # Changed from str to EmailStr
    contact: Optional[str] = None
    predicted_field: Optional[str] = None


class ComprehensiveAnalysisResponse(BaseModel):
    success: bool = True
    message: str = "Comprehensive analysis successful"
    data: ComprehensiveAnalysisData


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
