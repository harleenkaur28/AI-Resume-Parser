import json
from typing import TypedDict, Dict, Any, List

from langchain.prompts import PromptTemplate
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.core.llm import llm


class AnalyzerState(TypedDict, total=False):
    resume_text: str
    job_text: str
    analysis: Dict[str, Any]
    suggestions: Dict[str, Any]


class CompareState(TypedDict, total=False):
    resume_text: str
    job_text: str
    resume_keywords: List[str]
    job_keywords: List[str]
    strengths: List[str]
    gaps: List[str]
    missing_keywords: List[str]
    match_score: float
    summary: str
    top_fixes: List[str]
    keyword_additions: List[str]
    improved_summary: str


def _ensure_llm():
    if llm is None:
        raise RuntimeError(
            "LLM (Google Gemini) is not configured. Set GOOGLE_API_KEY in .env"
        )
    return llm


def _analysis_node(state: AnalyzerState) -> AnalyzerState:
    model = _ensure_llm()
    prompt = PromptTemplate.from_template(
        """
        You are an expert resume reviewer. Analyze the following resume against the job description and return STRICT JSON with keys:
        - summary: short overview
        - strengths: array of strings
        - gaps: array of strings (missing qualifications or weak areas)
        - missing_keywords: array of strings
        - match_score: number 0-100 (overall fit)

        Job Description:\n"""
        + "{job_text}"
        + """\n\nResume:\n"""
        + "{resume_text}"
        + """

        Respond ONLY with JSON, no markdown.
        """
    )
    msg = prompt.format(
        job_text=state.get("job_text", ""), resume_text=state.get("resume_text", "")
    )
    res = model.invoke(msg)
    text = res if isinstance(res, str) else getattr(res, "content", str(res))
    try:
        analysis = json.loads(text.strip().strip("`"))
    except Exception:
        # best effort JSON extraction
        s, e = text.find("{"), text.rfind("}") + 1
        analysis = (
            json.loads(text[s:e])
            if s != -1 and e > s
            else {
                "summary": "",
                "strengths": [],
                "gaps": [],
                "missing_keywords": [],
                "match_score": 0,
            }
        )
    state["analysis"] = analysis
    return state


def _suggestion_node(state: AnalyzerState) -> AnalyzerState:
    model = _ensure_llm()
    analysis = state.get("analysis", {})
    prompt = PromptTemplate.from_template(
        """
        Based on this JSON analysis and the inputs, generate:
        - top_fixes: array of concrete bullet points to improve the resume.
        - keyword_additions: array of missing keywords to weave in naturally.
        - improved_summary: a single professional resume summary paragraph.

        Inputs JSON:\n{analysis}\n\nJob Description:\n{job_text}\n\nResume:\n{resume_text}
        Return ONLY JSON with the three keys above, no markdown.
        """
    )
    msg = prompt.format(
        analysis=json.dumps(analysis, ensure_ascii=False),
        job_text=state.get("job_text", ""),
        resume_text=state.get("resume_text", ""),
    )
    res = model.invoke(msg)
    text = res if isinstance(res, str) else getattr(res, "content", str(res))
    try:
        suggestions = json.loads(text.strip().strip("`"))
    except Exception:
        s, e = text.find("{"), text.rfind("}") + 1
        suggestions = (
            json.loads(text[s:e])
            if s != -1 and e > s
            else {"top_fixes": [], "keyword_additions": [], "improved_summary": ""}
        )
    state["suggestions"] = suggestions
    return state


def build_resume_analyzer_graph():
    graph = StateGraph(AnalyzerState)
    graph.add_node("analyze", _analysis_node)
    graph.add_node("suggest", _suggestion_node)
    graph.set_entry_point("analyze")
    graph.add_edge("analyze", "suggest")
    graph.add_edge("suggest", END)
    memory = MemorySaver()
    return graph.compile(checkpointer=memory)


def analyze_resume_with_langgraph(resume_text: str, job_text: str) -> Dict[str, Any]:
    """Run the LangGraph pipeline using Gemini and return analysis + suggestions."""
    app = build_resume_analyzer_graph()
    state: AnalyzerState = {
        "resume_text": resume_text or "",
        "job_text": job_text or "",
    }
    final = app.invoke(state)
    return {
        "analysis": final.get("analysis", {}),
        "suggestions": final.get("suggestions", {}),
    }


def _extract_keywords_node(which: str):
    """Factory to build a node that extracts keywords from resume or job text."""

    def _node(state: CompareState) -> CompareState:
        model = _ensure_llm()
        text = state.get("resume_text" if which == "resume" else "job_text", "")
        prompt = PromptTemplate.from_template(
            """
            Extract up to 30 concise, lowercase keywords/skills/technologies relevant to hiring from the following text.
            Return ONLY JSON of the form: {{"keywords": ["keyword1", "keyword2", ...]}}
            Text:\n{input}
            """
        )
        res = model.invoke(prompt.format(input=text))
        out = res if isinstance(res, str) else getattr(res, "content", str(res))
        keywords: List[str] = []
        try:
            payload = json.loads(out.strip().strip("`"))
            raw = payload.get("keywords", []) if isinstance(payload, dict) else payload
            if isinstance(raw, list):
                keywords = [str(k).strip().lower() for k in raw if str(k).strip()]
        except Exception:
            s, e = out.find("{"), out.rfind("}") + 1
            if s != -1 and e > s:
                try:
                    payload = json.loads(out[s:e])
                    raw = (
                        payload.get("keywords", []) if isinstance(payload, dict) else []
                    )
                    if isinstance(raw, list):
                        keywords = [
                            str(k).strip().lower() for k in raw if str(k).strip()
                        ]
                except Exception:
                    keywords = []
        key = "resume_keywords" if which == "resume" else "job_keywords"
        state[key] = keywords
        return state

    return _node


def _compute_overlap_node(state: CompareState) -> CompareState:
    rk = set([k.strip().lower() for k in state.get("resume_keywords", []) if k])
    jk = set([k.strip().lower() for k in state.get("job_keywords", []) if k])
    if not jk:
        # If no JD keywords, fallback to zero-division safe score
        jaccard = 0.0
    else:
        inter = rk & jk
        union = rk | jk
        jaccard = float(len(inter) / len(union)) if union else 0.0
    missing = list(jk - rk)
    strengths = list((rk & jk))
    gaps = missing[:]
    state["match_score"] = round(jaccard * 100.0, 2)
    state["missing_keywords"] = sorted(missing)
    state["strengths"] = sorted(strengths)
    state["gaps"] = sorted(gaps)
    return state


def _compare_summary_node(state: CompareState) -> CompareState:
    model = _ensure_llm()
    prompt = PromptTemplate.from_template(
        """
        You are a hiring expert. Using the resume, job description, and keyword analysis below, generate:
        - summary: one short paragraph (single string)
        - top_fixes: list of concrete bullet points to improve the resume for this JD
        - keyword_additions: list of missing keywords from JD to add naturally
        - improved_summary: a single professional resume summary paragraph tailored to the JD

        Provide ONLY JSON with keys: summary, top_fixes, keyword_additions, improved_summary.

        Resume (truncated acceptable):\n{resume_text}\n\nJob (truncated acceptable):\n{job_text}\n\nData:\nresume_keywords={resume_keywords}\njob_keywords={job_keywords}\nstrengths={strengths}\ngaps={gaps}\nmissing_keywords={missing_keywords}\nmatch_score={match_score}
        """
    )
    res = model.invoke(
        prompt.format(
            resume_text=state.get("resume_text", "")[:6000],
            job_text=state.get("job_text", "")[:6000],
            resume_keywords=state.get("resume_keywords", []),
            job_keywords=state.get("job_keywords", []),
            strengths=state.get("strengths", []),
            gaps=state.get("gaps", []),
            missing_keywords=state.get("missing_keywords", []),
            match_score=state.get("match_score", 0.0),
        )
    )
    text = res if isinstance(res, str) else getattr(res, "content", str(res))
    try:
        payload = json.loads(text.strip().strip("`"))
    except Exception:
        s, e = text.find("{"), text.rfind("}") + 1
        payload = json.loads(text[s:e]) if s != -1 and e > s else {}

    state["summary"] = payload.get("summary", "") if isinstance(payload, dict) else ""
    state["top_fixes"] = (
        payload.get("top_fixes", []) if isinstance(payload, dict) else []
    )
    state["keyword_additions"] = (
        payload.get("keyword_additions", []) if isinstance(payload, dict) else []
    )
    state["improved_summary"] = (
        payload.get("improved_summary", "") if isinstance(payload, dict) else ""
    )
    return state


def build_compare_graph():
    graph = StateGraph(CompareState)
    graph.add_node("extract_resume_keywords", _extract_keywords_node("resume"))
    graph.add_node("extract_job_keywords", _extract_keywords_node("job"))
    graph.add_node("overlap", _compute_overlap_node)
    graph.add_node("summarize", _compare_summary_node)
    graph.set_entry_point("extract_resume_keywords")
    graph.add_edge("extract_resume_keywords", "extract_job_keywords")
    graph.add_edge("extract_job_keywords", "overlap")
    graph.add_edge("overlap", "summarize")
    graph.add_edge("summarize", END)
    memory = MemorySaver()
    return graph.compile(checkpointer=memory)


def compare_resume_to_jd(resume_text: str, job_text: str) -> Dict[str, Any]:
    """Compare resume to JD using a dedicated LangGraph and return compact result."""
    app = build_compare_graph()
    initial: CompareState = {
        "resume_text": resume_text or "",
        "job_text": job_text or "",
    }
    final = app.invoke(initial)
    return {
        "match_score": float(final.get("match_score", 0.0) or 0.0),
        "summary": final.get("summary", "") or "",
        "strengths": final.get("strengths", []) or [],
        "gaps": final.get("gaps", []) or [],
        "missing_keywords": final.get("missing_keywords", []) or [],
        "top_fixes": final.get("top_fixes", []) or [],
        "keyword_additions": final.get("keyword_additions", []) or [],
        "improved_summary": final.get("improved_summary", "") or "",
    }
