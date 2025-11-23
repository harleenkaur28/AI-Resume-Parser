import os
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
from app.services.process_resume import (
    process_document,
    is_valid_resume,
)

from app.services.data_processor import (
    format_resume_text_with_llm,
    format_resume_json_with_llm,
    comprehensive_analysis_llm,
    format_and_analyse_resumes,
    LLMNotFoundError,
)


async def analyze_resume_service(file: UploadFile = File(...)):
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

        try:
            resume_data = format_resume_json_with_llm(
                extracted_resume_text=resume_text,
            )
            if not resume_data:
                raise LLMNotFoundError(
                    "LLM service is not available or returned empty data."
                )
            cleaned_data_dict = resume_data
            analysis_data = ResumeAnalysis(**resume_data)

            if alias := cleaned_data_dict.get("personal_website, or any other link"):
                analysis_data.portfolio = alias
            elif alias := cleaned_data_dict.get("personal_website"):
                analysis_data.portfolio = alias
            elif alias := cleaned_data_dict.get("any other link"):
                analysis_data.portfolio = alias
            elif alias := cleaned_data_dict.get("website"):
                analysis_data.portfolio = alias

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

        os.remove(temp_file_path)

        if not is_valid_resume(resume_text):
            raise HTTPException(
                status_code=400,
                detail="Invalid resume format or content.",
            )

        analysis_dict = comprehensive_analysis_llm(resume_text)
        if not isinstance(analysis_dict, dict):
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="Analysis result is not a dictionary.",
                    error_detail=str(type(analysis_dict)),
                ).model_dump(),
            )
        analysis_dict = {str(k): v for k, v in analysis_dict.items()}

        comprehensive_data = ComprehensiveAnalysisData(**analysis_dict)

        if alias := analysis_dict.get("personal_website, or any other link"):
            comprehensive_data.portfolio = alias
        elif alias := analysis_dict.get("personal_website"):
            comprehensive_data.portfolio = alias
        elif alias := analysis_dict.get("any other link"):
            comprehensive_data.portfolio = alias
        elif alias := analysis_dict.get("website"):
            comprehensive_data.portfolio = alias

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

        analysis_dict = format_and_analyse_resumes(
            raw_text=raw_resume_text,
        )

        analysis = ComprehensiveAnalysisData(**analysis_dict)

        if alias := analysis_dict.get("personal_website, or any other link"):
            analysis.portfolio = alias
        elif alias := analysis_dict.get("personal_website"):
            analysis.portfolio = alias
        elif alias := analysis_dict.get("any other link"):
            analysis.portfolio = alias
        elif alias := analysis_dict.get("website"):
            analysis.portfolio = alias

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

        formated_resume = formated_resume.strip()

        analysis_dict = comprehensive_analysis_llm(
            resume_text=formated_resume,
        )

        if not isinstance(analysis_dict, dict):
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="Analysis result is not a dictionary.",
                    error_detail=str(type(analysis_dict)),
                ).model_dump(),
            )
        analysis_dict = {str(k): v for k, v in analysis_dict.items()}

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
