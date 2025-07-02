from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Form
from typing import Optional
from app.models.schemas import (
    FormattedAndAnalyzedResumeResponse,
    ComprehensiveAnalysisData,
    HiringAssistantResponse,
    ColdMailResponse,
)
from app.services import resume, cold_mail, hiring

router = APIRouter()


@router.post(
    "/resume/format-and-analyze",
    summary="Format, Clean, and Analyze Resume from File (V2)",
    response_model=FormattedAndAnalyzedResumeResponse,
    tags=["V2"],
)
async def format_and_analyze_resume_v2(file: UploadFile = File(...)):
    return await resume.format_and_analyze_resume_service(file)


@router.post(
    "/resume/analysis",
    summary="Analyze Resume (V2)",
    response_model=ComprehensiveAnalysisData,
    tags=["V2"],
)
async def analyze_resume_v2(
    formated_resume: str = Form(..., description="Formatted resume text"),
):
    return await resume.analyze_resume_v2_service(formated_resume)


@router.post(
    "/hiring-assistant/",
    description="Generates answers to interview questions based on the provided resume text and inputs.",
    response_model=HiringAssistantResponse,
)
async def hiring_assistant2(
    resume_text: str = Form(...),
    role: str = Form(...),
    questions: str = Form(...),
    company_name: str = Form(...),
    user_knowledge: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
    word_limit: Optional[int] = Form(150),
):
    return await hiring.hiring_assistant_v2_service(
        resume_text,
        role,
        questions,
        company_name,
        user_knowledge,
        company_url,
        word_limit,
    )


@router.post(
    "/cold-mail/generator/",
    response_model=ColdMailResponse,
    description="Generates a cold email based on the provided resume text and user inputs.",
)
async def cold_mail_generator_v2(
    resume_text: str = Form(...),
    recipient_name: str = Form(...),
    recipient_designation: str = Form(...),
    company_name: str = Form(...),
    sender_name: str = Form(...),
    sender_role_or_goal: str = Form(...),
    key_points_to_include: str = Form(...),
    additional_info_for_llm: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
):
    return await cold_mail.cold_mail_generator_v2_service(
        resume_text,
        recipient_name,
        recipient_designation,
        company_name,
        sender_name,
        sender_role_or_goal,
        key_points_to_include,
        additional_info_for_llm,
        company_url,
    )


@router.post(
    "/cold-mail/edit/",
    response_model=ColdMailResponse,
    description="Edit a cold email based on the provided resume text and user inputs.",
)
async def cold_mail_editor_v2(
    resume_text: str = Form(...),
    recipient_name: str = Form(...),
    recipient_designation: str = Form(...),
    company_name: str = Form(...),
    sender_name: str = Form(...),
    sender_role_or_goal: str = Form(...),
    key_points_to_include: str = Form(...),
    additional_info_for_llm: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
    generated_email_subject: str = Form(...),
    generated_email_body: str = Form(...),
    edit_inscription: str = Form(""),
):
    return await cold_mail.cold_mail_editor_v2_service(
        resume_text,
        recipient_name,
        recipient_designation,
        company_name,
        sender_name,
        sender_role_or_goal,
        key_points_to_include,
        additional_info_for_llm,
        company_url,
        generated_email_subject,
        generated_email_body,
        edit_inscription,
    )
