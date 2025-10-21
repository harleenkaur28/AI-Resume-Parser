from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="TalentSync Normies API",
    description="API for analyzing resumes, extracting structured data, and providing tips for improvement.",
    version="1.5.8",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.api.linkedin import router as linkedin_router
from app.api.postgres import router as postgres_router
from app.api.tips import router as tips_router
from app.api.cold_mail import file_based_router as cold_mail_file_based_router
from app.api.cold_mail import text_based_router as cold_mail_text_based_router
from app.api.hiring_assistant import file_based_router as hiring_file_based_router
from app.api.hiring_assistant import text_based_router as hiring_text_based_router
from app.api.resume_analysis import file_based_router as resume_file_based_router
from app.api.resume_analysis import text_based_router as resume_text_based_router
from app.api.ats import file_based_router as ats_file_based_router
from app.api.ats import text_based_router as ats_text_based_router
from app.api.tailored_resume import (
    file_based_router as tailored_resume_file_based_router,
    text_based_router as tailored_resume_text_based_router,
)

app.include_router(
    linkedin_router,
    prefix="/api/v1",
    tags=[
        "LinkedIn",
    ],
)

app.include_router(
    postgres_router,
    prefix="/api/v1",
    tags=[
        "Database",
    ],
)

app.include_router(
    tips_router,
    prefix="/api/v1",
    tags=[
        "Tips",
    ],
)

app.include_router(
    cold_mail_file_based_router,
    prefix="/api/v1",
    tags=[
        "Cold Mail",
    ],
)

app.include_router(
    cold_mail_text_based_router,
    prefix="/api/v1",
    tags=[
        "Cold Mail",
    ],
)

app.include_router(
    cold_mail_text_based_router,
    prefix="/api/v2",
    tags=[
        "Cold Mail",
    ],
)

app.include_router(
    hiring_file_based_router,
    prefix="/api/v1",
    tags=[
        "Hiring Assistant",
    ],
)

app.include_router(
    hiring_text_based_router,
    prefix="/api/v2",
    tags=[
        "Hiring Assistant",
    ],
)

app.include_router(
    resume_file_based_router,
    prefix="/api/v1",
    tags=[
        "Resume Analysis",
    ],
)

app.include_router(
    resume_text_based_router,
    prefix="/api/v2",
    tags=[
        "Resume Analysis",
    ],
)

app.include_router(
    ats_file_based_router,
    prefix="/api/v1",
    tags=[
        "ATS Evaluation",
    ],
)

app.include_router(
    ats_text_based_router,
    prefix="/api/v2",
    tags=[
        "ATS Evaluation",
    ],
)

app.include_router(
    tailored_resume_file_based_router,
    prefix="/api/v1",
    tags=[
        "Tailored Resume",
    ],
)

app.include_router(
    tailored_resume_text_based_router,
    prefix="/api/v2",
    tags=[
        "Tailored Resume",
    ],
)
