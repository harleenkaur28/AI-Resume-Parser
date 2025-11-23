"""Common entry types used across multiple models."""

from typing import List, Optional
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


class LanguageEntry(BaseModel):
    language: str


class EducationEntry(BaseModel):
    education_detail: str


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
