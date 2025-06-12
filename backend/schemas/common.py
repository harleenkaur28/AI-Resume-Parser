# /Users/taf/Projects/Resume Portal/backend/schemas/common.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid


class WorkExperienceEntry(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None


class ProjectEntry(BaseModel):
    title: Optional[str] = None
    technologies_used: Optional[List[str]] = []
    description: Optional[str] = None
