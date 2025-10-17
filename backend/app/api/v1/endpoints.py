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
    ResumeAnalyzerResponse,
    CompareToJDResponse,
    PostGenerationRequest,
    PostGenerationResponse,
)
from app.services.linkedin_profile_generator import (
    LinkedInPageRequest,
    LinkedInPageResponse,
    generate_comprehensive_linkedin_page,
)
from app.services import (
    resume,
    cold_mail,
    hiring,
    tips,
    linkedin,
)

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


# LinkedIn Post Generation Endpoints
@router.post(
    "/linkedin/generate-posts",
    response_model=PostGenerationResponse,
    summary="Generate LinkedIn Posts",
    description="Generate multiple LinkedIn posts based on topic, tone, and other parameters",
    tags=["V1", "LinkedIn"],
)
async def generate_linkedin_posts(request: PostGenerationRequest):
    """
    Generate LinkedIn posts using AI based on the provided parameters.

    Returns a structured response with generated posts, hashtags, and CTA suggestions.
    """
    return await linkedin.generate_linkedin_posts_service(request)


@router.post(
    "/linkedin/edit-post",
    summary="Edit LinkedIn Post with AI",
    description="Edit an existing LinkedIn post using AI based on user instructions",
    tags=["V1", "LinkedIn"],
)
async def edit_linkedin_post(payload: dict):
    """
    Edit a LinkedIn post using AI based on user instructions.

    Expected payload: {"post": {...}, "instruction": "Make it shorter"}
    Returns the updated post.
    """
    return await linkedin.edit_post_llm_service(payload)


@router.post(
    "/linkedin/generate-page",
    response_model=LinkedInPageResponse,
    summary="Generate Complete LinkedIn Page",
    description="Generate comprehensive LinkedIn page content including profile, posts, and engagement strategy",
    tags=["V1", "LinkedIn"],
)
async def generate_linkedin_page(request: LinkedInPageRequest):
    """
    Generate comprehensive LinkedIn page content including:
    - Professional profile content (headline, summary, about section)
    - Experience highlights and skills
    - Featured projects from GitHub
    - Suggested posts for content calendar
    - Engagement tips and strategy

    This endpoint combines web research, GitHub analysis, and AI-powered content generation
    to create a complete LinkedIn presence strategy.
    """
    return await generate_comprehensive_linkedin_page(request)
