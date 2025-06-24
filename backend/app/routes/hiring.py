from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
import json

from ..models import (
    HiringAssistantResponse,
    ErrorResponse,
)
from ..utils import (
    process_document,
    generate_answers_for_geting_hired,
    get_company_research,
)
from ..config import API_KEYS_DICT

router = APIRouter()


@router.post(
    "/hiring-assistant/",
    description="Generates answers to interview questions based on the provided resume and inputs.",
    response_model=HiringAssistantResponse,
    tags=["V1"],
)
async def hiring_assistant(
    file: UploadFile = File(...),
    role: str = Form(...),
    questions: str = Form(...),  # JSON string: '["q1", "q2"]'
    company_name: str = Form(...),
    user_knowledge: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
    word_limit: Optional[int] = Form(150),
):
    """Generate answers to interview questions."""
    try:
        # Process the uploaded file
        file_content = await file.read()
        resume_text, temp_file_path = process_document(file_content, file.filename)

        # Parse questions
        try:
            questions_list = json.loads(questions)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid questions format. Please provide a valid JSON array of strings.",
            )

        # Get company research if URL is provided
        company_research = ""
        if company_url:
            company_research = get_company_research(company_name, company_url)

        # Generate answers
        answers = generate_answers_for_geting_hired(
            resume_text=resume_text,
            role=role,
            company=company_name,
            questions_list=questions_list,
            word_limit=word_limit,
            user_company_knowledge=user_knowledge,
            company_research=company_research,
            api_keys_dict=API_KEYS_DICT,
        )

        return HiringAssistantResponse(
            success=True,
            message="Answers generated successfully.",
            data=answers,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                success=False,
                message="Error generating answers",
                error_detail=str(e),
            ),
        )


@router.post(
    "/hiring-assistant/",
    description="Generates answers to interview questions based on the provided resume text and inputs.",
    response_model=HiringAssistantResponse,
    tags=["V2"],
)
async def hiring_assistant_v2(
    resume_text: str = Form(...),
    role: str = Form(...),
    questions: str = Form(...),  # JSON string: '["q1", "q2"]'
    company_name: str = Form(...),
    user_knowledge: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
    word_limit: Optional[int] = Form(150),
):
    """Generate answers to interview questions using V2 API."""
    try:
        # Parse questions
        try:
            questions_list = json.loads(questions)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid questions format. Please provide a valid JSON array of strings.",
            )

        # Get company research if URL is provided
        company_research = ""
        if company_url:
            company_research = get_company_research(company_name, company_url)

        # Generate answers
        answers = generate_answers_for_geting_hired(
            resume_text=resume_text,
            role=role,
            company=company_name,
            questions_list=questions_list,
            word_limit=word_limit,
            user_company_knowledge=user_knowledge,
            company_research=company_research,
            api_keys_dict=API_KEYS_DICT,
        )

        return HiringAssistantResponse(
            success=True,
            message="Answers generated successfully.",
            data=answers,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                success=False,
                message="Error generating answers",
                error_detail=str(e),
            ),
        )
