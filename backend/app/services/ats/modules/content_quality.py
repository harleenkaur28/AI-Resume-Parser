from typing import Any
from app.services.llm import ats_analysis_llm


def assess_content_quality(
    resume_text: str,
    jd_text: str = "",
) -> float:
    # use llm for quality analysis
    llm_result = ats_analysis_llm(resume_text, jd_text)
    content_score = llm_result.get("content")

    if content_score is not None:
        return float(content_score)

    # Fallback: heuristic (length and presence of metrics)
    length_score = min(len(resume_text) / 2000, 1.0)

    metrics_score = 1.0 if any(char.isdigit() for char in resume_text) else 0.5

    score = (length_score + metrics_score) / 2

    return score
