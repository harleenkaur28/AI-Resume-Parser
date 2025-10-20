"""Tips and advice models."""

from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.common.types import (
    SkillProficiency,
    LanguageEntry,
    EducationEntry,
    UIDetailedWorkExperienceEntry,
    UIProjectEntry,
    UIPublicationEntry,
    UIPositionOfResponsibilityEntry,
    UICertificationEntry,
    UIAchievementEntry,
)


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
