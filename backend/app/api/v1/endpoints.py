from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Form
from typing import Optional
from app.models.schemas import (
    ResumeUploadResponse,
    ResumeListResponse,
    ResumeCategoryResponse,
    ComprehensiveAnalysisResponse,
    HiringAssistantResponse,
    ColdMailResponse,
    TipsResponse,
    ScoreRequest,
    ScoreResponse,
)
from app.services import resume, cold_mail, hiring, tips
from app.services.ats.calculator import ATSCalculator

router = APIRouter()


# resume analysis
@router.post(
    "/resume/analysis",
    summary="Analyze Resume",
    response_model=ResumeUploadResponse,
    tags=["V1"],
)
async def analyze_resume(file: UploadFile = File(...)):
    return await resume.analyze_resume_service(file)


@router.post(
    "/resume/comprehensive/analysis/",
    response_model=ComprehensiveAnalysisResponse,
    description="Performs a comprehensive analysis of the uploaded resume using LLM.",
    tags=["V1"],
)
async def comprehensive_resume_analysis(file: UploadFile = File(...)):
    return await resume.comprehensive_resume_analysis_service(file)


# hiring assistant
@router.post(
    "/hiring-assistant/",
    description="Generates answers to interview questions based on the provided resume and inputs.",
    response_model=HiringAssistantResponse,
    tags=["V1"],
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
    return hiring.hiring_assistant_service(
        file,
        role,
        questions,
        company_name,
        user_knowledge,
        company_url,
        word_limit,
    )


# cold mail
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
    return cold_mail.cold_mail_generator_service(
        file,
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
    return cold_mail.cold_mail_editor_service(
        file,
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


# tips generator
@router.get(
    "/generate/tips/",
    response_model=TipsResponse,
    description="Generates career & resume tips based on job category and skills.",
    tags=["V1"],
)
async def get_career_tips(
    job_category: Optional[str] = Query(
        None,
        description="Job category for tailored tips",
    ),
    skills: Optional[str | list[str]] = Query(
        None,
        description="Comma-separated skills for tailored tips",
    ),
):
    if job_category:
        job_category = job_category.strip().lower()
        if not job_category:
            job_category = "general"

    else:
        job_category = "general"

    if skills is None:
        skills_param = []

    else:
        skills_param = skills

    return tips.get_career_tips_service(job_category, skills_param)


# postfres fetching endpoints
@router.get(
    "/resumes/",
    response_model=ResumeListResponse,
    description="Fetch all resumes from the database.",
    tags=["V1"],
)
async def get_resumes():
    return resume.get_resumes_service()


@router.get(
    "/resumes/{category}",
    response_model=ResumeCategoryResponse,
    description="Fetch resumes by category. The category is the predicted field from the resume analysis.",
    tags=["V1"],
)
async def get_resumes_by_category(category: str):
    return resume.get_resumes_by_category_service(category)


@router.post("/ats/score", response_model=ScoreResponse, tags=["V1"])
async def score_ats(req: ScoreRequest):
    ats = ATSCalculator(weight_file="model/weights.npy", bias_file="model/bias.npy")
    jd_text = req.jd_text or ""
    career_level = req.career_level or "mid"
    return await ats.batch_score(jd_text, req.resume_texts, career_level)
