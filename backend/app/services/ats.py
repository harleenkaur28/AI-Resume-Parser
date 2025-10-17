"""ATS evaluation service: returns structured analysis and a narrative.

Dependencies:
- Uses shared Google LLM via app.core.llm when available.
- Optional Tavily tool if configured.
"""

from typing import Any, Dict, Optional, Tuple

from fastapi import HTTPException

from app.services.ats_evaluator import evaluate_ats


def ats_evaluate_service(
    resume_text: str,
    jd_text: str,
    company_name: Optional[str] = None,
    company_website: Optional[str] = None,
) -> Dict[str, Any]:
    """Return a detailed ATS analysis including JD matching and suggestions.

    Response shape:
    {
      "analysis": { ...structured JSON... },
      "narrative": "Analysis Narrative ..."
    }
    """
    try:
        if not resume_text or not resume_text.strip():
            raise HTTPException(status_code=400, detail="Resume text is required")
        if not jd_text or not jd_text.strip():
            raise HTTPException(status_code=400, detail="Job description is required")

        analysis_json, narrative = evaluate_ats(
            resume_text=resume_text,
            jd_text=jd_text,
            company_name=company_name,
            company_website=company_website,
        )

        if not isinstance(analysis_json, dict):
            analysis_json = {}

        return {
            "analysis": analysis_json,
            "narrative": narrative or "",
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS evaluation failed: {e}")
