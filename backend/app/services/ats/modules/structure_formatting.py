from app.services.llm import ats_analysis_llm


def assess_structure_formatting(
    resume_text: str,
    jd_text: str = "",
) -> float:
    # try llm for formating
    llm_result = ats_analysis_llm(resume_text, jd_text)
    formatting_score = llm_result.get("formatting")

    if formatting_score is not None:
        return float(formatting_score)

    # Fallback: heuristic (check for common section headers)
    headers = [
        "experience",
        "education",
        "skills",
        "projects",
    ]

    found = sum(1 for h in headers if h in resume_text.lower())

    score = found / len(headers)

    return score
