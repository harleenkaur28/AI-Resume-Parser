from fastapi import APIRouter, File, UploadFile, Form
from typing import Optional
from app.models.schemas import HiringAssistantResponse
from backend.app.services import hiring_assiatnat


file_based_router = APIRouter()


@file_based_router.post(
    "/hiring-assistant/",
    description="Generates answers to interview questions based on the provided resume and inputs.",
    response_model=HiringAssistantResponse,
)
async def hiring_assistant(
    file: UploadFile = File(...),
    role: str = Form(...),
    questions: str = Form(...),
    company_name: str = Form(...),
    user_knowledge: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
    word_limit: Optional[int] = Form(150),
):
    return hiring_assiatnat.hiring_assistant_service(
        file,
        role,
        questions,
        company_name,
        user_knowledge,
        company_url,
        word_limit,
    )


text_based_router = APIRouter()


@text_based_router.post(
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
    return await hiring_assiatnat.hiring_assistant_v2_service(
        resume_text,
        role,
        questions,
        company_name,
        user_knowledge,
        company_url,
        word_limit,
    )
