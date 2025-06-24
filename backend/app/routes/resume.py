from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Query
from typing import Optional, List
import json
from datetime import datetime

from ..models import (
    ResumeAnalysis,
    ResumeUploadResponse,
    ResumeListResponse,
    ResumeCategoryResponse,
    ComprehensiveAnalysisResponse,
    ComprehensiveAnalysisData,
    FormattedAndAnalyzedResumeResponse,
)
from ..utils import (
    process_document,
    clean_resume,
    extract_name_and_email,
    extract_contact_number,
    extract_skills,
    extract_education,
    extract_work_experience,
    extract_projects,
    is_valid_resume,
    get_llm_response,
    parse_llm_json_response,
)
from ..config import settings

router = APIRouter()


@router.post(
    "/resume/analysis",
    summary="Analyze Resume",
    response_model=ResumeUploadResponse,
    tags=["V1"],
)
async def analyze_resume(file: UploadFile = File(...)):
    """Analyze a resume file and extract relevant information."""
    try:
        # Process the uploaded file
        resume_text, file_extension = process_document(file)

        # Clean and validate resume
        cleaned_text = clean_resume(resume_text)
        if not is_valid_resume(cleaned_text):
            raise HTTPException(
                status_code=400,
                detail="Invalid resume format or content",
            )

        # Extract basic information
        name_email = extract_name_and_email(cleaned_text)
        contact = extract_contact_number(cleaned_text)
        skills = extract_skills(cleaned_text)
        education = extract_education(cleaned_text)
        work_exp = extract_work_experience(cleaned_text)
        projects = extract_projects(cleaned_text)

        # Create response
        analysis = ResumeAnalysis(
            name=name_email["name"] or "Unknown",
            email=name_email["email"] or "Unknown",
            contact=contact,
            predicted_field="Software Development",  # Default field
            college=education[0] if education else None,
            work_experience=work_exp,
            projects=projects,
            skills=skills,
            upload_date=datetime.utcnow(),
        )

        return ResumeUploadResponse(
            success=True,
            message="Resume analyzed successfully",
            data=analysis,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing resume: {str(e)}",
        )


@router.get(
    "/resumes/",
    response_model=ResumeListResponse,
    description="Fetch all resumes from the database.",
    tags=["V1"],
)
async def get_resumes():
    """Get all resumes from the database."""
    # TODO: Implement database integration
    return ResumeListResponse(
        success=True,
        message="Resumes retrieved successfully",
        data=[],
        count=0,
    )


@router.get(
    "/resumes/{category}",
    response_model=ResumeCategoryResponse,
    description="Fetch resumes by category.",
    tags=["V1"],
)
async def get_resumes_by_category(category: str):
    """Get resumes by category."""
    # TODO: Implement database integration
    return ResumeCategoryResponse(
        success=True,
        message="Resumes retrieved successfully",
        data=[],
        count=0,
        category=category,
    )


@router.post(
    "/resume/comprehensive/analysis/",
    response_model=ComprehensiveAnalysisResponse,
    description="Performs a comprehensive analysis of the uploaded resume using LLM.",
    tags=["V1"],
)
async def comprehensive_resume_analysis(file: UploadFile = File(...)):
    """Perform comprehensive resume analysis."""
    try:
        # Process the uploaded file
        resume_text, file_extension = process_document(file)

        # Clean and validate resume
        cleaned_text = clean_resume(resume_text)
        if not is_valid_resume(cleaned_text):
            raise HTTPException(
                status_code=400,
                detail="Invalid resume format or content",
            )

        # Generate comprehensive analysis using LLM
        prompt = f"""Analyze the following resume and provide a comprehensive analysis:
        {cleaned_text}
        
        Provide the analysis in JSON format with the following structure:
        {{
            "skills_analysis": [
                {{"skill_name": "skill1", "percentage": 90}},
                {{"skill_name": "skill2", "percentage": 80}}
            ],
            "recommended_roles": ["role1", "role2"],
            "languages": [
                {{"language": "language1"}},
                {{"language": "language2"}}
            ],
            "education": [
                {{"education_detail": "education1"}},
                {{"education_detail": "education2"}}
            ],
            "work_experience": [
                {{
                    "role": "role1",
                    "company_and_duration": "company1 (duration)",
                    "bullet_points": ["point1", "point2"]
                }}
            ],
            "projects": [
                {{
                    "title": "project1",
                    "technologies_used": ["tech1", "tech2"],
                    "description": "description1"
                }}
            ],
            "predicted_field": "field"
        }}
        """

        response = get_llm_response(prompt)
        analysis_dict = parse_llm_json_response(response)

        # Create response
        analysis_data = ComprehensiveAnalysisData(**analysis_dict)

        return ComprehensiveAnalysisResponse(
            success=True,
            message="Comprehensive analysis successful",
            data=analysis_data,
            cleaned_text=cleaned_text,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error performing comprehensive analysis: {str(e)}",
        )


@router.post(
    "/resume/format-and-analyze",
    summary="Format, Clean, and Analyze Resume from File (V2)",
    response_model=FormattedAndAnalyzedResumeResponse,
    tags=["V2"],
)
async def format_and_analyze_resume_v2(file: UploadFile = File(...)):
    """Format, clean, and analyze resume from file (V2)."""
    try:
        # Process the uploaded file
        resume_text, file_extension = process_document(file)

        # Clean and validate resume
        cleaned_text = clean_resume(resume_text)
        if not is_valid_resume(cleaned_text):
            raise HTTPException(
                status_code=400,
                detail="Invalid resume format or content",
            )

        # Generate comprehensive analysis using LLM
        prompt = f"""Format and analyze the following resume:
        {cleaned_text}
        
        Provide the analysis in JSON format with the following structure:
        {{
            "cleaned_text": "formatted resume text",
            "analysis": {{
                "skills_analysis": [
                    {{"skill_name": "skill1", "percentage": 90}},
                    {{"skill_name": "skill2", "percentage": 80}}
                ],
                "recommended_roles": ["role1", "role2"],
                "languages": [
                    {{"language": "language1"}},
                    {{"language": "language2"}}
                ],
                "education": [
                    {{"education_detail": "education1"}},
                    {{"education_detail": "education2"}}
                ],
                "work_experience": [
                    {{
                        "role": "role1",
                        "company_and_duration": "company1 (duration)",
                        "bullet_points": ["point1", "point2"]
                    }}
                ],
                "projects": [
                    {{
                        "title": "project1",
                        "technologies_used": ["tech1", "tech2"],
                        "description": "description1"
                    }}
                ],
                "predicted_field": "field"
            }}
        }}
        """

        response = get_llm_response(prompt)
        result_dict = parse_llm_json_response(response)

        # Create response
        analysis_data = ComprehensiveAnalysisData(**result_dict["analysis"])

        return FormattedAndAnalyzedResumeResponse(
            success=True,
            message="Resume formatted and analyzed successfully",
            cleaned_text=result_dict["cleaned_text"],
            analysis=analysis_data,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error formatting and analyzing resume: {str(e)}",
        )


@router.post(
    "/resume/analysis",
    summary="Analyze Resume (V2)",
    response_model=ComprehensiveAnalysisData,
    tags=["V2"],
)
async def analyze_resume_v2(
    formated_resume: str = Form(
        ...,
        description="Formatted resume text",
    ),
):
    """Analyze formatted resume (V2)."""
    try:
        # Clean and validate resume
        cleaned_text = clean_resume(formated_resume)
        if not is_valid_resume(cleaned_text):
            raise HTTPException(
                status_code=400,
                detail="Invalid resume format or content",
            )

        # Generate comprehensive analysis using LLM
        prompt = f"""Analyze the following formatted resume:
        {cleaned_text}
        
        Provide the analysis in JSON format with the following structure:
        {{
            "skills_analysis": [
                {{"skill_name": "skill1", "percentage": 90}},
                {{"skill_name": "skill2", "percentage": 80}}
            ],
            "recommended_roles": ["role1", "role2"],
            "languages": [
                {{"language": "language1"}},
                {{"language": "language2"}}
            ],
            "education": [
                {{"education_detail": "education1"}},
                {{"education_detail": "education2"}}
            ],
            "work_experience": [
                {{
                    "role": "role1",
                    "company_and_duration": "company1 (duration)",
                    "bullet_points": ["point1", "point2"]
                }}
            ],
            "projects": [
                {{
                    "title": "project1",
                    "technologies_used": ["tech1", "tech2"],
                    "description": "description1"
                }}
            ],
            "predicted_field": "field"
        }}
        """

        response = get_llm_response(prompt)
        analysis_dict = parse_llm_json_response(response)

        # Create response
        return ComprehensiveAnalysisData(**analysis_dict)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing resume: {str(e)}",
        )
