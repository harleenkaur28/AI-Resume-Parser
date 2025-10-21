"""ATS evaluation service: returns structured analysis and a narrative.

Dependencies:
- Uses shared Google LLM via app.core.llm when available.
- Optional Tavily tool if configured.
"""

from typing import Any, Dict, Optional
import json
import logging

from fastapi import HTTPException
from pydantic import ValidationError

from app.services.ats_evaluator import evaluate_ats

from app.models.schemas import JDEvaluatorRequest
from app.models.schemas import JDEvaluatorResponse


logger = logging.getLogger(__name__)


async def ats_evaluate_service(
    resume_text: str,
    jd_text: str | None,
    jd_link: str | None = None,
    company_name: Optional[str] = None,
    company_website: Optional[str] = None,
) -> JDEvaluatorResponse:
    """Return a detailed ATS analysis including JD matching and suggestions."""

    logger.debug(
        "Starting ATS evaluation",
        extra={
            "company_name": company_name,
            "has_jd_text": bool(jd_text),
            "has_jd_link": bool(jd_link),
        },
    )

    if jd_text is None:
        if jd_link is not None:
            import app.agents.web_content_agent as web_agent

            try:
                jd_text = web_agent.return_markdown(jd_link)

            except Exception as retrieval_error:
                logger.exception(
                    "Failed to fetch job description from link",
                    extra={
                        "jd_link": jd_link,
                        "company_name": company_name,
                    },
                )
                raise HTTPException(
                    status_code=500,
                    detail="Failed to retrieve job description from link.",
                )

        else:
            logger.warning(
                "ATS evaluation missing job description",
                extra={
                    "company_name": company_name,
                    "has_jd_text": bool(jd_text),
                    "has_jd_link": bool(jd_link),
                },
            )
            raise HTTPException(
                status_code=400,
                detail="Either jd_text or jd_link must be provided.",
            )

    try:
        # Validate inputs using JDEvaluatorRequest Pydantic model
        try:
            JDEvaluatorRequest(
                company_name=company_name,
                company_website_content=company_website,
                jd=jd_text,
                resume=resume_text,
            )

        except ValidationError as ve:
            logger.warning(
                "ATS evaluation validation error",
                extra={
                    "company_name": company_name,
                    "error": str(ve),
                },
            )
            raise HTTPException(
                status_code=400,
                detail=str(ve),
            )

        # Call evaluator and normalize its output to a dict.
        logger.debug(
            "Invoking ATS evaluator graph",
            extra={
                "company_name": company_name,
            },
        )

        analysis_output = evaluate_ats(
            resume_text=resume_text,
            jd_text=jd_text,
            company_name=company_name,
            company_website=company_website,
        )

        logger.debug(
            "ATS evaluator raw output",
            extra={
                "company_name": company_name,
                "output_type": type(analysis_output).__name__,
                "raw_output": analysis_output,
            },
        )

        # If evaluator returned a JSON string, try to parse it.
        analysis_json: Dict[str, Any]
        if isinstance(analysis_output, str):
            try:
                analysis_json = json.loads(analysis_output)

            except Exception:
                logger.exception("Failed to decode ATS analysis JSON output")
                analysis_json = {
                    "message": analysis_output,
                }

        elif isinstance(analysis_output, dict):
            analysis_json = analysis_output

        else:
            analysis_json = {}

        # Ensure required fields exist and have correct types for JDEvaluatorResponse
        success = bool(analysis_json.get("success", True))
        message = analysis_json.get("message", "") or ""
        try:
            score = int(analysis_json.get("score", 0))
        except Exception:
            score = 0

        raw_reasons = analysis_json.get("reasons_for_the_score", []) or []
        if isinstance(raw_reasons, list):
            reasons_for_the_score = [str(r) for r in raw_reasons]
        else:
            reasons_for_the_score = [str(raw_reasons)]

        raw_suggestions = analysis_json.get("suggestions", []) or []

        if isinstance(raw_suggestions, list):
            suggestions = [str(s) for s in raw_suggestions]
        else:
            suggestions = [str(raw_suggestions)]

        logger.debug(
            "ATS evaluator normalized payload",
            extra={
                "company_name": company_name,
                "success_flag": success,
                "response_message": message,
                "score": score,
                "reasons": reasons_for_the_score,
                "suggestions": suggestions,
            },
        )

        response_payload = {
            "success": success,
            "message": str(message),
            "score": score,
            "reasons_for_the_score": reasons_for_the_score,
            "suggestions": suggestions,
        }

        logger.debug(
            "ATS evaluation completed",
            extra={
                "company_name": company_name,
                "score": response_payload.get("score"),
                "success": response_payload.get("success"),
            },
        )

        return JDEvaluatorResponse(**response_payload)

    except HTTPException as http_error:
        if http_error.status_code >= 500:
            logger.exception(
                "ATS evaluation server error",
                extra={
                    "company_name": company_name,
                },
            )
        raise

    except Exception as e:
        logger.exception(
            "ATS evaluation failed",
            extra={
                "company_name": company_name,
            },
        )
        raise HTTPException(
            status_code=500,
            detail=f"ATS evaluation failed: {e}",
        )
