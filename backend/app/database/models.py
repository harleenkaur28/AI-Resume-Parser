from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Resume(Base):
    """Resume model for storing resume information."""

    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    contact = Column(String, nullable=True)
    predicted_field = Column(String)
    college = Column(String, nullable=True)
    skills = Column(JSON)
    upload_date = Column(DateTime, default=datetime.utcnow)
    work_experience = Column(JSON)
    projects = Column(JSON)


class Analysis(Base):
    """Analysis model for storing resume analysis results."""

    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    analysis_date = Column(DateTime, default=datetime.utcnow)
    skills_analysis = Column(JSON)
    recommended_roles = Column(JSON)
    languages = Column(JSON)
    education = Column(JSON)
    work_experience = Column(JSON)
    projects = Column(JSON)
    predicted_field = Column(String)

    resume = relationship("Resume", back_populates="analyses")


# Add relationship to Resume model
Resume.analyses = relationship("Analysis", back_populates="resume")
