from app.services.llm import ats_analysis_llm


def compute_industry_stats(score: float):
    # Heuristic: map score to industry average and percentile
    if score >= 90:
        return 85.0, 95
    elif score >= 75:
        return 75.0, 80
    elif score >= 60:
        return 65.0, 60
    else:
        return 55.0, 40
    # Optionally, supplement with LLM for advanced benchmarking
    # llm_result = ats_analysis_llm("", "")
    # if "industry_average" in llm_result and "percentile" in llm_result:
    #     return llm_result["industry_average"], llm_result["percentile"]
