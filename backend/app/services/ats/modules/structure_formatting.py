from app.services.llm import ats_analysis_llm


def assess_structure_formatting(resume_text: str) -> float:
    # Heuristic: check for common section headers
    headers = ["experience", "education", "skills", "projects"]
    found = sum(1 for h in headers if h in resume_text.lower())
    score = found / len(headers)
    # Optionally, supplement with LLM for advanced feedback
    # llm_result = ats_analysis_llm(resume_text, "")
    # if "formatting" in llm_result:
    #     score = (score + float(llm_result["formatting"])) / 2
    return score
