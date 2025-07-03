# Cold mail generation and editing logic will go here

import os
import json
from typing import Optional
from fastapi import HTTPException, UploadFile
from app.models.schemas import ColdMailResponse, ErrorResponse
from app.services.utils import process_document, is_valid_resume
from app.services.hiring import get_company_research
from app.core.llm import llm
from app.services.llm import format_resume_text_with_llm
from app.data.ai.cold_mail_gen import (
    cold_main_generator_chain,
    cold_mail_prompt,
)
from app.data.ai.cold_mail_editor import (
    cold_mail_edit_chain,
    cold_mail_edit_prompt,
)


def generate_cold_mail_content(
    resume_text,
    recipient_name,
    recipient_designation,
    company_name,
    sender_name,
    sender_role_or_goal,
    key_points_to_include,
    additional_info_for_llm,
    company_research,
):
    # TODO: Replace with actual LLM logic
    formatted_prompt_str = cold_mail_prompt.format(
        resume_text=resume_text,
        recipient_name=recipient_name,
        recipient_designation=recipient_designation,
        company_name=company_name,
        sender_name=sender_name,
        sender_role_or_goal=sender_role_or_goal,
        key_points_to_include=key_points_to_include,
        additional_info_for_llm=additional_info_for_llm,
        company_research=company_research,
    )
    try:
        response = cold_main_generator_chain.invoke(formatted_prompt_str)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate cold mail content.",
                error_detail=str(e),
            ).model_dump(),
        )

    return {
        "subject": f"Application for {sender_role_or_goal} at {company_name}",
        "body": f"Dear {recipient_name},\n\nI am writing to express my interest in the {sender_role_or_goal} position at {company_name}. (Sample body...)\n\nBest regards,\n{sender_name}",
    }


def generate_cold_mail_edit_content(
    resume_text,
    recipient_name,
    recipient_designation,
    company_name,
    sender_name,
    sender_role_or_goal,
    key_points_to_include,
    additional_info_for_llm,
    company_research,
    previous_email_subject,
    previous_email_body,
    edit_instructions,
):
    formatted_prompt_str = cold_mail_edit_prompt.format(
        resume_text=resume_text,
        recipient_name=recipient_name,
        recipient_designation=recipient_designation,
        company_name=company_name,
        sender_name=sender_name,
        sender_role_or_goal=sender_role_or_goal,
        key_points_to_include=key_points_to_include,
        additional_info_for_llm=additional_info_for_llm,
        company_research=company_research,
        previous_email_subject=previous_email_subject,
        previous_email_body=previous_email_body,
        edit_instructions=edit_instructions,
    )
    try:
        response = cold_mail_edit_chain.invoke(formatted_prompt_str)
        response_content = (
            response.content if hasattr(response, "content") else str(response)
        )
        response_content = str(response_content).strip()

        if response_content.startswith("{") and response_content.endswith("}"):
            try:
                response_json = json.loads(response_content)
                return {
                    "subject": response_json.get("subject", ""),
                    "body": response_json.get("body", ""),
                }

            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=500,
                    detail=ErrorResponse(
                        message="Failed to parse LLM response as JSON."
                    ).model_dump(),
                )
        elif response_content.startswith("```json") and response_content.endswith(
            "```"
        ):
            try:
                json_str = response_content[8:-3].strip()
                response_json = json.loads(json_str)
                return {
                    "subject": response_json.get("subject", ""),
                    "body": response_json.get("body", ""),
                }

            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=500,
                    detail=ErrorResponse(
                        message="Failed to parse LLM response as JSON."
                    ).model_dump(),
                )
        else:
            start_index = response_content.find("{")
            end_index = response_content.rfind("}")

            if start_index != -1 and end_index != -1:
                json_str = response_content[start_index : end_index + 1].strip()

                if len(json_str) == 0:
                    raise HTTPException(
                        status_code=500,
                        detail=ErrorResponse(
                            message="LLM response does not contain valid JSON."
                        ).model_dump(),
                    )

                try:
                    response_json = json.loads(json_str)
                    return {
                        "subject": response_json.get("subject", ""),
                        "body": response_json.get("body", ""),
                    }

                except json.JSONDecodeError:
                    raise HTTPException(
                        status_code=500,
                        detail=ErrorResponse(
                            message="Failed to parse LLM response as JSON."
                        ).model_dump(),
                    )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate cold mail edit content.",
                error_detail=str(e),
            ).model_dump(),
        )

    return {
        "subject": f"[Edited] {previous_email_subject}",
        "body": f"[Edited] {previous_email_body}\n\n(Edit instructions: {edit_instructions})",
    }


def cold_mail_generator_service(
    file: UploadFile,
    recipient_name: str,
    recipient_designation: str,
    company_name: str,
    sender_name: str,
    sender_role_or_goal: str,
    key_points_to_include: str,
    additional_info_for_llm: Optional[str],
    company_url: Optional[str],
):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(message="LLM service is not available.").model_dump(),
        )

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
            f"temp_cold_mail_{file.filename}",
        )
        file_bytes = file.file.read()

        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_bytes)

        resume_text = process_document(file_bytes, file.filename)

        if resume_text is None:
            os.remove(temp_file_path)
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message=f"Unsupported file type or error processing file: {file.filename}"
                ).model_dump(),
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
                detail=ErrorResponse(
                    message="Invalid resume format or content."
                ).model_dump(),
            )

        company_research_info = ""

        if company_url:
            company_research_info = get_company_research(company_name, company_url)

        email_content = generate_cold_mail_content(
            resume_text=resume_text,
            recipient_name=recipient_name,
            recipient_designation=recipient_designation,
            company_name=company_name,
            sender_name=sender_name,
            sender_role_or_goal=sender_role_or_goal,
            key_points_to_include=key_points_to_include,
            additional_info_for_llm=additional_info_for_llm or "",
            company_research=company_research_info,
        )

        return ColdMailResponse(
            subject=email_content["subject"], body=email_content["body"]
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate cold mail content.", error_detail=str(e)
            ).model_dump(),
        )


def cold_mail_editor_service(
    file: UploadFile,
    recipient_name: str,
    recipient_designation: str,
    company_name: str,
    sender_name: str,
    sender_role_or_goal: str,
    key_points_to_include: str,
    additional_info_for_llm: Optional[str],
    company_url: Optional[str],
    generated_email_subject: str,
    generated_email_body: str,
    edit_inscription: str,
):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(message="LLM service is not available.").model_dump(),
        )
    try:
        uploads_dir = os.path.join(
            os.path.dirname(__file__),
            "../../uploads",
        )
        os.makedirs(uploads_dir, exist_ok=True)

        temp_file_path = os.path.join(uploads_dir, f"temp_cold_mail_{file.filename}")
        file_bytes = file.file.read()

        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_bytes)
        resume_text = process_document(file_bytes, file.filename)

        if resume_text is None:
            os.remove(temp_file_path)
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message=f"Unsupported file type or error processing file: {file.filename}"
                ).model_dump(),
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
                detail=ErrorResponse(
                    message="Invalid resume format or content."
                ).model_dump(),
            )

        company_research_info = ""
        if company_url:
            company_research_info = get_company_research(company_name, company_url)

        email_content = generate_cold_mail_edit_content(
            resume_text=resume_text,
            recipient_name=recipient_name,
            recipient_designation=recipient_designation,
            company_name=company_name,
            sender_name=sender_name,
            sender_role_or_goal=sender_role_or_goal,
            key_points_to_include=key_points_to_include,
            additional_info_for_llm=additional_info_for_llm or "",
            company_research=company_research_info,
            previous_email_subject=generated_email_subject,
            previous_email_body=generated_email_body,
            edit_instructions=edit_inscription,
        )

        return ColdMailResponse(
            subject=email_content["subject"], body=email_content["body"]
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate cold mail content.", error_detail=str(e)
            ).model_dump(),
        )


async def cold_mail_generator_v2_service(
    resume_text: str,
    recipient_name: str,
    recipient_designation: str,
    company_name: str,
    sender_name: str,
    sender_role_or_goal: str,
    key_points_to_include: str,
    additional_info_for_llm: Optional[str],
    company_url: Optional[str],
):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(message="LLM service is not available.").model_dump(),
        )

    try:
        company_research_info = ""
        if company_url:
            company_research_info = get_company_research(company_name, company_url)

        email_content = generate_cold_mail_content(
            resume_text=resume_text,
            recipient_name=recipient_name,
            recipient_designation=recipient_designation,
            company_name=company_name,
            sender_name=sender_name,
            sender_role_or_goal=sender_role_or_goal,
            key_points_to_include=key_points_to_include,
            additional_info_for_llm=additional_info_for_llm or "",
            company_research=company_research_info,
        )
        return ColdMailResponse(
            subject=email_content["subject"], body=email_content["body"]
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate cold mail content.", error_detail=str(e)
            ).model_dump(),
        )


async def cold_mail_editor_v2_service(
    resume_text: str,
    recipient_name: str,
    recipient_designation: str,
    company_name: str,
    sender_name: str,
    sender_role_or_goal: str,
    key_points_to_include: str,
    additional_info_for_llm: Optional[str],
    company_url: Optional[str],
    generated_email_subject: str,
    generated_email_body: str,
    edit_inscription: str,
):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(message="LLM service is not available.").model_dump(),
        )
    try:
        company_research_info = ""
        if company_url:
            company_research_info = get_company_research(company_name, company_url)

        email_content = generate_cold_mail_edit_content(
            resume_text=resume_text,
            recipient_name=recipient_name,
            recipient_designation=recipient_designation,
            company_name=company_name,
            sender_name=sender_name,
            sender_role_or_goal=sender_role_or_goal,
            key_points_to_include=key_points_to_include,
            additional_info_for_llm=additional_info_for_llm or "",
            company_research=company_research_info,
            previous_email_subject=generated_email_subject,
            previous_email_body=generated_email_body,
            edit_instructions=edit_inscription,
        )
        return ColdMailResponse(
            subject=email_content["subject"],
            body=email_content["body"],
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate cold mail content.", error_detail=str(e)
            ).model_dump(),
        )
