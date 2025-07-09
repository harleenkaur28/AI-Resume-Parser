from app.services.llm import ats_analysis_llm


def compute_industry_stats(
    score: float,
    resume_text: str = "",
    jd_text: str = "",
):
    # use llm for benchmarking

    llm_result = ats_analysis_llm(resume_text, jd_text)
    industry_avg = llm_result.get("industry_average")
    percentile = llm_result.get("percentile")

    if industry_avg is not None and percentile is not None:
        return float(industry_avg), int(percentile)

    # Fallback: heuristic mapping
    if score >= 90:
        return 85.0, 95

    elif score >= 75:
        return 75.0, 80

    elif score >= 60:
        return 65.0, 60

    else:
        return 55.0, 40
