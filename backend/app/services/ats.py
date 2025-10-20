"""ATS evaluation service: returns structured analysis and a narrative.

Dependencies:
- Uses shared Google LLM via app.core.llm when available.
- Optional Tavily tool if configured.
"""

from typing import Any, Dict, Optional, Tuple
import json

from fastapi import HTTPException
from pydantic import ValidationError

from app.services.ats_evaluator import evaluate_ats

from app.models.schemas import JDEvaluatorRequest
from app.models.schemas import JDEvaluatorResponse


async def ats_evaluate_service(
    resume_text: str,
    jd_text: str | None,
    jd_link: str | None = None,
    company_name: Optional[str] = None,
    company_website: Optional[str] = None,
) -> JDEvaluatorResponse:
    """Return a detailed ATS analysis including JD matching and suggestions."""

    if jd_text is None:
        if jd_link is not None:
            import app.agents.web_content_agent as web_agent

            try:
                jd_text = web_agent.return_markdown(jd_link)

            except Exception:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to retrieve job description from link.",
                )

        else:
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
            raise HTTPException(
                status_code=400,
                detail=str(ve),
            )

        # Call evaluator and normalize its output to a dict.
        analysis_output = evaluate_ats(
            resume_text=resume_text,
            jd_text=jd_text,
            company_name=company_name,
            company_website=company_website,
        )

        # If evaluator returned a JSON string, try to parse it.
        analysis_json: Dict[str, Any]
        if isinstance(analysis_output, str):
            try:
                analysis_json = json.loads(analysis_output)

            except Exception:
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

        response_payload = {
            "success": success,
            "message": str(message),
            "score": score,
            "reasons_for_the_score": reasons_for_the_score,
            "suggestions": suggestions,
        }

        return JDEvaluatorResponse(**response_payload)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"ATS evaluation failed: {e}",
        )
