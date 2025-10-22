from fastapi import APIRouter, File, UploadFile, Form
from backend.app.services import resume_analysis
from app.models.schemas import (
    ResumeUploadResponse,
    ComprehensiveAnalysisResponse,
    FormattedAndAnalyzedResumeResponse,
    ComprehensiveAnalysisData,
)


file_based_router = APIRouter()


@file_based_router.post(
    "/resume/analysis",
    summary="Analyze Resume",
    response_model=ResumeUploadResponse,
)
async def analyze_resume(file: UploadFile = File(...)):
    return await resume_analysis.analyze_resume_service(file)


@file_based_router.post(
    "/resume/comprehensive/analysis/",
    response_model=ComprehensiveAnalysisResponse,
    description="Performs a comprehensive analysis of the uploaded resume using LLM.",
)
async def comprehensive_resume_analysis(file: UploadFile = File(...)):
    return await resume_analysis.comprehensive_resume_analysis_service(file)


text_based_router = APIRouter()


@text_based_router.post(
    "/resume/format-and-analyze",
    summary="Format, Clean, and Analyze Resume from File V2",
    response_model=FormattedAndAnalyzedResumeResponse,
)
async def format_and_analyze_resume_v2(file: UploadFile = File(...)):
    return await resume_analysis.format_and_analyze_resume_service(file)


@text_based_router.post(
    "/resume/analysis",
    summary="Analyze Resume V2",
    response_model=ComprehensiveAnalysisData,
)
async def analyze_resume_v2(
    formated_resume: str = Form(
        ...,
        description="Formatted resume text",
    ),
):
    return await resume_analysis.analyze_resume_v2_service(formated_resume)
