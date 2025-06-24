from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional

from ..models import (
    ColdMailResponse,
    ErrorResponse,
)
from ..utils import (
    process_document,
    generate_cold_mail_content,
    get_company_research,
)
from ..config import API_KEYS_DICT

router = APIRouter()


@router.post(
    "/cold-mail/generator/",
    response_model=ColdMailResponse,
    description="Generates a cold email based on the provided resume and user inputs.",
    tags=["V1"],
)
async def cold_mail_generator(
    file: UploadFile = File(...),
    recipient_name: str = Form(...),
    recipient_designation: str = Form(...),
    company_name: str = Form(...),
    sender_name: str = Form(...),
    sender_role_or_goal: str = Form(...),
    key_points_to_include: str = Form(...),
    additional_info_for_llm: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
):
    """Generate a cold email."""
    try:
        # Process the uploaded file
        file_content = await file.read()
        resume_text, temp_file_path = process_document(file_content, file.filename)

        # Get company research if URL is provided
        company_research = ""
        if company_url:
            company_research = get_company_research(company_name, company_url)

        # Generate cold email
        email_content = generate_cold_mail_content(
            resume_text=resume_text,
            recipient_name=recipient_name,
            recipient_designation=recipient_designation,
            company_name=company_name,
            sender_name=sender_name,
            sender_role_or_goal=sender_role_or_goal,
            key_points_to_include=key_points_to_include,
            additional_info_for_llm=additional_info_for_llm or "",
            company_research=company_research,
            api_keys_dict=API_KEYS_DICT,
        )

        return ColdMailResponse(
            success=True,
            message="Cold email content generated successfully.",
            subject=email_content["subject"],
            body=email_content["body"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                success=False,
                message="Error generating cold email",
                error_detail=str(e),
            ),
        )


@router.post(
    "/cold-mail/editor/",
    response_model=ColdMailResponse,
    description="Edit a cold email based on the provided resume and user inputs.",
    tags=["V1"],
)
async def cold_mail_editor(
    file: UploadFile = File(...),
    recipient_name: str = Form(...),
    recipient_designation: str = Form(...),
    company_name: str = Form(...),
    sender_name: str = Form(...),
    sender_role_or_goal: str = Form(...),
    key_points_to_include: str = Form(...),
    additional_info_for_llm: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
    generated_email_subject: str = Form(""),
    generated_email_body: str = Form(""),
    edit_inscription: str = Form(""),
):
    """Edit a cold email."""
    try:
        # Process the uploaded file
        file_content = await file.read()
        resume_text, temp_file_path = process_document(file_content, file.filename)

        # Get company research if URL is provided
        company_research = ""
        if company_url:
            company_research = get_company_research(company_name, company_url)

        # Generate edited cold email
        email_content = generate_cold_mail_content(
            resume_text=resume_text,
            recipient_name=recipient_name,
            recipient_designation=recipient_designation,
            company_name=company_name,
            sender_name=sender_name,
            sender_role_or_goal=sender_role_or_goal,
            key_points_to_include=key_points_to_include,
            additional_info_for_llm=f"{additional_info_for_llm or ''}\n\nEdit instructions: {edit_inscription}\n\nPrevious email:\nSubject: {generated_email_subject}\nBody: {generated_email_body}",
            company_research=company_research,
            api_keys_dict=API_KEYS_DICT,
        )

        return ColdMailResponse(
            success=True,
            message="Cold email content edited successfully.",
            subject=email_content["subject"],
            body=email_content["body"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                success=False,
                message="Error editing cold email",
                error_detail=str(e),
            ),
        )


@router.post(
    "/cold-mail/generator/",
    response_model=ColdMailResponse,
    description="Generates a cold email based on the provided resume text and user inputs.",
    tags=["V2"],
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
    """Generate a cold email using V2 API."""
    try:
        # Get company research if URL is provided
        company_research = ""
        if company_url:
            company_research = get_company_research(company_name, company_url)

        # Generate cold email
        email_content = generate_cold_mail_content(
            resume_text=resume_text,
            recipient_name=recipient_name,
            recipient_designation=recipient_designation,
            company_name=company_name,
            sender_name=sender_name,
            sender_role_or_goal=sender_role_or_goal,
            key_points_to_include=key_points_to_include,
            additional_info_for_llm=additional_info_for_llm or "",
            company_research=company_research,
            api_keys_dict=API_KEYS_DICT,
        )

        return ColdMailResponse(
            success=True,
            message="Cold email content generated successfully.",
            subject=email_content["subject"],
            body=email_content["body"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                success=False,
                message="Error generating cold email",
                error_detail=str(e),
            ),
        )


@router.post(
    "/cold-mail/edit/",
    response_model=ColdMailResponse,
    description="Edit a cold email based on the provided resume text and user inputs.",
    tags=["V2"],
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
    """Edit a cold email using V2 API."""
    try:
        # Get company research if URL is provided
        company_research = ""
        if company_url:
            company_research = get_company_research(company_name, company_url)

        # Generate edited cold email
        email_content = generate_cold_mail_content(
            resume_text=resume_text,
            recipient_name=recipient_name,
            recipient_designation=recipient_designation,
            company_name=company_name,
            sender_name=sender_name,
            sender_role_or_goal=sender_role_or_goal,
            key_points_to_include=key_points_to_include,
            additional_info_for_llm=f"{additional_info_for_llm or ''}\n\nEdit instructions: {edit_inscription}\n\nPrevious email:\nSubject: {generated_email_subject}\nBody: {generated_email_body}",
            company_research=company_research,
            api_keys_dict=API_KEYS_DICT,
        )

        return ColdMailResponse(
            success=True,
            message="Cold email content edited successfully.",
            subject=email_content["subject"],
            body=email_content["body"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                success=False,
                message="Error editing cold email",
                error_detail=str(e),
            ),
        )
