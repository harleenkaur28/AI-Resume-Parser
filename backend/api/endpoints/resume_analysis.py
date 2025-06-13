import os

from fastapi import (
    APIRouter,
    File,
    UploadFile,
    HTTPException,
    Depends,
    Query,
    Form,
)

from typing import (
    List,
    Optional,
    Dict,
    Any,
)

import json
import re
import io
from datetime import datetime, timezone
from PyPDF2 import PdfReader
from docx import Document
import uuid

from schemas.resume import (
    ResumeAnalysisPrompt,
    ComprehensiveAnalysisData,
    ComprehensiveAnalysisResponse,
    TipsData,
    TipsResponse,
    AnalysisDB,
    ResumeMetadataDB,
)

from schemas.user import UserPublic

from llm.llm_config import (
    basic_resume_parser_chain,
    comprehensive_analyzer_chain,
    tips_generator_chain,
)

from core.ml_setup import (
    nlp,
    stop_words,
    clf,
    tfidf_vectorizer,
)

from security.auth import get_current_user
from db.session import get_db_connection
import asyncpg

router = APIRouter()


def extract_text_from_pdf(file_stream: io.BytesIO) -> str:
    reader = PdfReader(file_stream)
    text = ""

    for page_num in range(len(reader.pages)):
        page = reader.pages[page_num]
        text += page.extract_text() or ""

    return text


def extract_text_from_docx(file_stream: io.BytesIO) -> str:
    doc = Document(file_stream)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text


def clean_resume_text(text: str) -> str:
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^\x00-\x7f]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


@router.post("/upload-resume-and-analyze", response_model=AnalysisDB)
async def upload_resume_and_analyze(
    file: UploadFile = File(...),
    custom_name: Optional[str] = Form(None),
    show_in_central: bool = Form(False),
    current_user: UserPublic = Depends(get_current_user),
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    if not clf or not tfidf_vectorizer:
        raise HTTPException(
            status_code=503, detail="ML models not loaded. Analysis unavailable."
        )

    if not basic_resume_parser_chain:
        raise HTTPException(
            status_code=503, detail="LLM chain not initialized. Analysis unavailable."
        )

    contents = await file.read()
    file_stream = io.BytesIO(contents)
    filename = file.filename or "uploaded_file"

    extracted_text = ""
    if filename.lower().endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_stream)

    elif filename.lower().endswith(".docx"):
        extracted_text = extract_text_from_docx(file_stream)

    else:
        raise HTTPException(
            status_code=400, detail="Unsupported file type. Please upload PDF or DOCX."
        )

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400, detail="Could not extract text from the resume."
        )

    cleaned_text = clean_resume_text(extracted_text)

    input_features = tfidf_vectorizer.transform([cleaned_text])
    predicted_category = clf.predict(input_features)[0]

    name_match = re.search(r"([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)", extracted_text)

    email_match = re.search(
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", extracted_text
    )

    contact_match = re.search(
        r"(?:\+\d{1,3}[- ]?)?(?:\(?\d{3}\)?[- ]?)?\d{3}[- ]?\d{4}", extracted_text
    )

    initial_json_data = {
        "name": name_match.group(0) if name_match else "Unknown",
        "email": email_match.group(0).lower() if email_match else "unknown@example.com",
        "contact": contact_match.group(0) if contact_match else None,
        "predicted_field": predicted_category,
    }

    try:
        llm_input = {
            "resume_json": json.dumps(initial_json_data),
            "extracted_resume_text": cleaned_text,
        }
        llm_response_str = await basic_resume_parser_chain.arun(llm_input)
        parsed_data = json.loads(llm_response_str)

        resume_analysis_prompt_data = ResumeAnalysisPrompt(**parsed_data)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, detail="LLM returned invalid JSON for basic analysis."
        )

    except Exception as e:

        raise HTTPException(
            status_code=500, detail=f"Error during LLM basic analysis: {str(e)}"
        )

    user_id_uuid = (
        uuid.UUID(current_user.id)
        if isinstance(current_user.id, str)
        else current_user.id
    )

    file_url_for_db = f"uploads/{filename}"

    async with conn.transaction():
        try:
            resume_meta_id = await conn.fetchval(
                """INSERT INTO resumes.resume (user_id, custom_name, file_url, upload_date, show_in_central)
                   VALUES ($1, $2, $3, $4, $5) RETURNING id""",
                user_id_uuid,
                custom_name or filename,
                file_url_for_db,
                datetime.now(timezone.utc),
                show_in_central,
            )

            analysis_id = await conn.fetchval(
                """INSERT INTO resumes.analysis (resume_id, name, email, contact, predicted_field, college, skills, work_experience, projects, uploaded_at)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id""",
                resume_meta_id,
                resume_analysis_prompt_data.name,
                resume_analysis_prompt_data.email,
                resume_analysis_prompt_data.contact,
                resume_analysis_prompt_data.predicted_field,
                resume_analysis_prompt_data.college,
                json.dumps(resume_analysis_prompt_data.skills),
                json.dumps(
                    [
                        exp.dict()
                        for exp in resume_analysis_prompt_data.work_experience or []
                    ]
                ),
                json.dumps(
                    [proj.dict() for proj in resume_analysis_prompt_data.projects or []]
                ),
                resume_analysis_prompt_data.upload_date,
            )

            created_analysis_record = await conn.fetchrow(
                "SELECT * FROM resumes.analysis WHERE id = $1", analysis_id
            )
            if not created_analysis_record:
                raise HTTPException(
                    status_code=500, detail="Failed to retrieve saved analysis."
                )

            return AnalysisDB(
                id=created_analysis_record["id"],
                resume_id=created_analysis_record["resume_id"],
                name=created_analysis_record["name"],
                email=created_analysis_record["email"],
                contact=created_analysis_record["contact"],
                predicted_field=created_analysis_record["predicted_field"],
                college=created_analysis_record["college"],
                skills=json.loads(
                    created_analysis_record["skills"]
                    if created_analysis_record["skills"]
                    else "[]"
                ),
                work_experience=json.loads(
                    created_analysis_record["work_experience"]
                    if created_analysis_record["work_experience"]
                    else "[]"
                ),
                projects=json.loads(
                    created_analysis_record["projects"]
                    if created_analysis_record["projects"]
                    else "[]"
                ),
                uploaded_at=created_analysis_record["uploaded_at"],
            )

        except asyncpg.PostgresError as db_err:
            raise HTTPException(
                status_code=500,
                detail=f"Database error during analysis saving: {str(db_err)}",
            )

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred: {str(e)}",
            )


@router.post(
    "/comprehensive-analysis/{resume_id}", response_model=ComprehensiveAnalysisResponse
)
async def get_comprehensive_analysis(
    resume_id: uuid.UUID,
    current_user: UserPublic = Depends(get_current_user),
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    if not comprehensive_analyzer_chain:
        raise HTTPException(
            status_code=503, detail="Comprehensive analyzer LLM chain not initialized."
        )

    analysis_record = await conn.fetchrow(
        """SELECT ra.name, ra.email, ra.contact, ra.predicted_field, rm.file_url 
           FROM resumes.analysis ra JOIN resumes.resume rm ON ra.resume_id = rm.id
           WHERE ra.resume_id = $1 AND rm.user_id = $2""",
        resume_id,
        uuid.UUID(current_user.id),
    )

    if not analysis_record:
        raise HTTPException(
            status_code=404, detail="Resume analysis not found or access denied."
        )

    extracted_resume_text = ""

    file_path_to_check = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        analysis_record["file_url"],
    )

    if os.path.exists(file_path_to_check):
        try:
            with open(file_path_to_check, "rb") as f_resume:
                if file_path_to_check.lower().endswith(".pdf"):
                    extracted_resume_text = extract_text_from_pdf(
                        io.BytesIO(f_resume.read())
                    )

                elif file_path_to_check.lower().endswith(".docx"):
                    extracted_resume_text = extract_text_from_docx(
                        io.BytesIO(f_resume.read())
                    )

        except Exception as e:
            print(f"Could not re-read file for comprehensive analysis: {e}")

    if not extracted_resume_text:

        print(
            f"Warning: Could not retrieve full text for resume {resume_id}. Analysis might be limited."
        )

    basic_info = {
        "name": analysis_record["name"],
        "email": analysis_record["email"],
        "contact": analysis_record["contact"],
    }

    try:
        llm_input = {
            "extracted_resume_text": extracted_resume_text
            or "Text not available",  # Ensure it's not None
            "predicted_category": analysis_record["predicted_field"],
            "basic_info_json": json.dumps(basic_info),
        }

        llm_response_str = await comprehensive_analyzer_chain.arun(llm_input)
        comprehensive_data_dict = json.loads(llm_response_str)
        validated_data = ComprehensiveAnalysisData(**comprehensive_data_dict)

        return ComprehensiveAnalysisResponse(data=validated_data)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="LLM returned invalid JSON for comprehensive analysis.",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error during comprehensive analysis: {str(e)}"
        )


@router.get("/career-tips/", response_model=TipsResponse)
async def get_career_tips(
    job_category: Optional[str] = Query(None),
    skills: Optional[List[str]] = Query(None),
    current_user: UserPublic = Depends(get_current_user),
):
    if not tips_generator_chain:
        raise HTTPException(
            status_code=503, detail="Tips generator LLM chain not initialized."
        )

    skills_list_str = ", ".join(skills) if skills else "general skills"
    job_cat_str = job_category if job_category else "general career advice"

    try:
        llm_input = {
            "job_category": job_cat_str,
            "skills_list_str": skills_list_str,
        }

        llm_response_str = await tips_generator_chain.arun(llm_input)
        tips_data_dict = json.loads(llm_response_str)
        validated_tips = TipsData(**tips_data_dict)
        return TipsResponse(data=validated_tips)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, detail="LLM returned invalid JSON for tips generation."
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating tips: {str(e)}",
        )
