import os
import json
from datetime import datetime, timezone
from fastapi import HTTPException, UploadFile, File
from pydantic import ValidationError
from app.models.schemas import (
    FormattedAndAnalyzedResumeResponse,
    ResumeAnalysis,
    ResumeUploadResponse,
    ErrorResponse,
    ComprehensiveAnalysisResponse,
    ComprehensiveAnalysisData,
)
from app.services.utils import (
    process_document,
    clean_resume,
    extract_name_and_email,
    extract_contact_number_from_resume,
    extract_college_name,
    extract_work_experience,
    extract_skills_from_resume,
    extract_projects,
    predict_category,
    is_valid_resume,
)
from app.core.llm import llm
from app.data.skills import skills_list

from app.services.llm import format_resume_text_with_llm
from app.services.llm import format_resume_json_with_llm
from app.services.llm import comprehensive_analysis_llm
from app.services.llm import format_and_analyse_resumes
from app.services.llm import LLMNotFoundError


async def analyze_resume_service(file: UploadFile = File(...)):
    # This function implements the logic for /resume/analysis
    cleaned_data_dict = None
    try:
        uploads_dir = os.path.join(
            os.path.dirname(__file__),
            "../../uploads",
        )
        os.makedirs(
            uploads_dir,
            exist_ok=True,
        )
        temp_file_path = os.path.join(
            uploads_dir,
            f"temp_{file.filename}",
        )
        file_bytes = await file.read()

        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_bytes)

        resume_text = process_document(
            file_bytes,
            file.filename,
        )

        if resume_text is None:
            os.remove(temp_file_path)
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type or error processing file: {file.filename}",
            )

        file_extension = (
            os.path.splitext(file.filename)[1].lower() if file.filename else ""
        )

        if resume_text.strip() and file_extension not in [".md", ".txt"]:
            resume_text = format_resume_text_with_llm(resume_text)

        os.remove(temp_file_path)

        if not is_valid_resume(resume_text):
            raise HTTPException(
                status_code=400,
                detail="Invalid resume format",
            )

        name, email = extract_name_and_email(resume_text)
        contact = extract_contact_number_from_resume(resume_text)
        work_experience = extract_work_experience(resume_text)
        extracted_skills = extract_skills_from_resume(resume_text, skills_list)
        college = extract_college_name(resume_text)
        projects = extract_projects(resume_text)
        cleaned_resume_for_prediction = clean_resume(resume_text)
        predicted_category = predict_category(cleaned_resume_for_prediction)

        initial_resume_data = {
            "name": name,
            "email": email,
            "contact": contact,
            "predicted_field": predicted_category,
            "college": college,
            "work_experience": work_experience,
            "skills": extracted_skills,
            "projects": projects,
            "upload_date": datetime.now(timezone.utc).isoformat(),
        }

        try:
            resume_data = format_resume_json_with_llm(
                resume_json=initial_resume_data,
                extracted_resume_text=resume_text,
            )
            analysis_data = ResumeAnalysis(**resume_data)

        except LLMNotFoundError:
            analysis_data = ResumeAnalysis(**initial_resume_data)

        except ValidationError as e:
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message="Validation error for extracted data (LLM unavailable)",
                    error_detail=str(e.errors()),
                ).model_dump(),
            )

        if analysis_data.work_experience:
            filtered_work_experience = []
            for exp in analysis_data.work_experience:
                null_or_empty_count = 0
                please_remove = False
                if not exp.role:
                    null_or_empty_count += 1
                    if not exp.duration:
                        please_remove = True
                if not exp.company:
                    null_or_empty_count += 1
                if not exp.duration:
                    null_or_empty_count += 1
                if not exp.description:
                    null_or_empty_count += 1
                if null_or_empty_count <= 2 and not please_remove:
                    filtered_work_experience.append(exp)

            analysis_data.work_experience = filtered_work_experience

        if analysis_data.projects:
            filtered_projects = []
            for proj in analysis_data.projects:
                null_or_empty_count = 0
                if not proj.title:
                    null_or_empty_count += 1
                if not proj.technologies_used:
                    null_or_empty_count += 1
                if not proj.description:
                    null_or_empty_count += 1

                if null_or_empty_count < 2:
                    filtered_projects.append(proj)

            analysis_data.projects = filtered_projects

        return ResumeUploadResponse(
            data=analysis_data,
            cleaned_data_dict=cleaned_data_dict,
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to analyze resume",
                error_detail=str(e),
            ).model_dump(),
        )


async def comprehensive_resume_analysis_service(file: UploadFile):
    try:
        uploads_dir = os.path.join(
            os.path.dirname(__file__),
            "../../uploads",
        )
        os.makedirs(
            uploads_dir,
            exist_ok=True,
        )

        file_bytes = await file.read()

        temp_file_path = os.path.join(
            uploads_dir,
            f"temp_comp_{file.filename}",
        )

        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_bytes)

        resume_text = process_document(
            file_bytes,
            file.filename,
        )

        if resume_text is None:
            os.remove(temp_file_path)
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type or error processing file: {file.filename}",
            )

        if resume_text.strip():
            resume_text = format_resume_text_with_llm(resume_text)

        os.remove(temp_file_path)

        if not is_valid_resume(resume_text):
            raise HTTPException(
                status_code=400,
                detail="Invalid resume format or content.",
            )

        name, email = extract_name_and_email(resume_text)
        contact = extract_contact_number_from_resume(resume_text)
        cleaned_resume_for_prediction = clean_resume(resume_text)
        predicted_category = predict_category(cleaned_resume_for_prediction)

        basic_info = {
            "name": name,
            "email": email,
            "contact": contact,
        }

        analysis_dict = comprehensive_analysis_llm(
            resume_text,
            predicted_category,
            basic_info,
        )

        comprehensive_data = ComprehensiveAnalysisData(**analysis_dict)

        return ComprehensiveAnalysisResponse(
            data=comprehensive_data,
            cleaned_text=resume_text,
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to perform comprehensive analysis",
                error_detail=str(e),
            ).model_dump(),
        )


async def format_and_analyze_resume_service(file: UploadFile):
    # Async version for v2
    try:
        uploads_dir = os.path.join(
            os.path.dirname(__file__),
            "../../uploads",
        )

        os.makedirs(uploads_dir, exist_ok=True)
        file_bytes = await file.read()

        temp_file_path = os.path.join(
            uploads_dir,
            f"temp_format_analyze_{file.filename}",
        )

        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_bytes)

        raw_resume_text = process_document(
            file_bytes,
            file.filename,
        )
        os.remove(temp_file_path)

        if raw_resume_text is None:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type or error processing file: {file.filename}",
            )

        name, email = extract_name_and_email(raw_resume_text)
        contact = extract_contact_number_from_resume(raw_resume_text)
        basic_info = {
            "name": name,
            "email": email,
            "contact": contact,
        }

        analysis_dict = format_and_analyse_resumes(
            raw_text=raw_resume_text,
            basic_info=basic_info,
        )

        analysis = ComprehensiveAnalysisData(**analysis_dict)

        return FormattedAndAnalyzedResumeResponse(
            cleaned_text=raw_resume_text,
            analysis=analysis,
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to format and analyze resume.",
                error_detail=str(e),
            ).model_dump(),
        )


async def analyze_resume_v2_service(formated_resume: str):
    # Async version for v2
    try:
        if not formated_resume.strip():
            raise HTTPException(
                status_code=400, detail="Formatted resume text cannot be empty."
            )

        name, email = extract_name_and_email(formated_resume)
        contact = extract_contact_number_from_resume(formated_resume)
        cleaned_resume_for_prediction = clean_resume(formated_resume)
        predicted_category = predict_category(cleaned_resume_for_prediction)
        analysis_dict = {
            "skills_analysis": [],
            "recommended_roles": [
                "Software Engineer",
                "Data Scientist",
            ],
            "languages": [],
            "education": [],
            "work_experience": [],
            "projects": [],
            "name": name,
            "email": email,
            "contact": contact,
            "predicted_field": predicted_category,
        }
        return ComprehensiveAnalysisData(**analysis_dict)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to analyze resume.", error_detail=str(e)
            ).model_dump(),
        )


# db response placeholders
def get_resumes_service():
    # TODO: Replace with actual DB or persistent storage
    return {
        "success": True,
        "message": "Fetched resumes successfully.",
        "data": [],
        "count": 0,
    }


def get_resumes_by_category_service(category: str):
    # TODO: Replace with actual DB or persistent storage
    return {
        "success": True,
        "message": f"Fetched resumes for category: {category}",
        "data": [],
        "count": 0,
        "category": category,
    }
