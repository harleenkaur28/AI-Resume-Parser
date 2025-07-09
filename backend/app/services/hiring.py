import os
import json
from typing import Optional
import requests
from fastapi import HTTPException, UploadFile
from app.models.schemas import HiringAssistantResponse, ErrorResponse
from app.services.utils import process_document, is_valid_resume
from app.services.llm import format_resume_text_with_llm
from app.data.ai.hirring_assistant import hiring_assistant_chain
from app.core.llm import llm


def get_company_research(company_name, company_url):
    """Gets basic company research information."""
    url = company_url.strip()
    try:
        if not url or not url.startswith(("http://", "https://")):
            return f"Research about {company_name}: Invalid or no URL provided for company research."

        response = requests.get(
            "https://r.jina.ai/" + url,
            timeout=10,
        )
        response.raise_for_status()

        if not response.text.strip():
            return (
                f"Research about {company_name}: No content found at the provided URL."
            )

        max_research_length = 20_000
        research_text = response.text.strip()
        if len(research_text) > max_research_length:
            research_text = research_text[:max_research_length] + "..."

        if not company_name.strip():
            return f"The website content: {research_text}"

        return f"Research about {company_name}: {research_text}"

    except requests.exceptions.RequestException as e:
        return f"Research about {company_name}: Error fetching data from URL: {e}"

    except Exception as e:
        return f"Research about {company_name}: An unexpected error occurred during company research: {e}"


def generate_answers_for_geting_hired(
    resume_text,
    role,
    company,
    questions_list,
    word_limit,
    user_company_knowledge,
    company_research,
):

    company_context = ""
    if user_company_knowledge.strip():
        company_context += f"\n\nAdditional information about {company}:\n{user_company_knowledge.strip()}"

    if company_research.strip():
        company_context += (
            f"\n\nResearch findings about {company}:\n{company_research.strip()}"
        )

    results = []

    for question in questions_list:
        try:
            response_content = hiring_assistant_chain.invoke(
                {
                    "resume": resume_text,
                    "role": role,
                    "company": company,
                    "company_context": company_context,
                    "question": question,
                    "word_limit": word_limit,
                }
            )
            answer = (
                response_content
                if isinstance(response_content, str)
                else getattr(response_content, "content", "")
            )

            results.append(
                {
                    "question": question,
                    "answer": answer.strip(),
                }
            )

        except Exception as e:
            results.append(
                {
                    "question": question,
                    "answer": f"Error generating answer: {e}",
                }
            )

    return results


def hiring_assistant_service(
    file: UploadFile,
    role: str,
    questions: str,
    company_name: str,
    user_knowledge: Optional[str],
    company_url: Optional[str],
    word_limit: Optional[int],
):
    try:
        try:
            questions_list = json.loads(questions)
            if (
                not isinstance(questions_list, list)
                or not all(isinstance(q, str) for q in questions_list)
                or not questions_list
            ):
                raise ValueError("Questions must be a non-empty list of strings.")

        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(
                status_code=422,
                detail=ErrorResponse(
                    message="Invalid format for questions. Expected a JSON string representing a non-empty list of strings.",
                    error_detail=str(e),
                ).model_dump(),
            )

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
            f"temp_hr_assist_{file.filename}",
        )
        file_bytes = file.file.read()

        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_bytes)

        resume_text = process_document(
            file_bytes,
            file.filename,
        )

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

        generated_answers_list = generate_answers_for_geting_hired(
            resume_text=resume_text,
            role=role,
            company=company_name,
            questions_list=questions_list,
            word_limit=word_limit,
            user_company_knowledge=user_knowledge or "",
            company_research=company_research_info,
        )

        answers_data = {}
        for item in generated_answers_list:
            answers_data[item["question"]] = item["answer"]

        if not answers_data:
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(message="No answers were generated.").model_dump(),
            )
        return HiringAssistantResponse(data=answers_data)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate hiring assistance.", error_detail=str(e)
            ).model_dump(),
        )


async def hiring_assistant_v2_service(
    resume_text: str,
    role: str,
    questions: str,
    company_name: str,
    user_knowledge: Optional[str],
    company_url: Optional[str],
    word_limit: Optional[int],
):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(message="LLM service is not available.").model_dump(),
        )

    try:
        try:
            questions_list = json.loads(questions)
            if (
                not isinstance(questions_list, list)
                or not all(isinstance(q, str) for q in questions_list)
                or not questions_list
            ):
                raise ValueError("Questions must be a non-empty list of strings.")

        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(
                status_code=422,
                detail=ErrorResponse(
                    message="Invalid format for questions. Expected a JSON string representing a non-empty list of strings.",
                    error_detail=str(e),
                ).model_dump(),
            )

        company_research_info = ""
        if company_url:
            company_research_info = get_company_research(company_name, company_url)

        generated_answers_list = generate_answers_for_geting_hired(
            resume_text=resume_text,
            role=role,
            company=company_name,
            questions_list=questions_list,
            word_limit=word_limit,
            user_company_knowledge=user_knowledge or "",
            company_research=company_research_info,
        )

        answers_data = {}
        for item in generated_answers_list:
            answers_data[item["question"]] = item["answer"]

        if not answers_data:
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(message="No answers were generated.").model_dump(),
            )
        return HiringAssistantResponse(data=answers_data)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate hiring assistance.", error_detail=str(e)
            ).model_dump(),
        )
