from typing import List, Dict, Any
from app.services.llm import ats_analysis_llm


class Recommendation:
    def __init__(
        self,
        id: str,
        title: str,
        description: str,
        category: str,
        priority: str,
        impact: str,
    ):
        self.id = id
        self.title = title
        self.description = description
        self.category = category
        self.priority = priority
        self.impact = impact

    def to_dict(self):
        return self.__dict__


def generate_recommendations(
    feats: Dict,
    raw: str,
    module_scores: Dict[str, Any],
) -> List[Recommendation]:

    llm_result = ats_analysis_llm(raw, "")
    recs = llm_result.get("recommendations", [])

    if not recs:
        recs = [
            {
                "id": "rec-1",
                "title": "Add more measurable achievements",
                "description": "Include more quantifiable results in your work experience.",
                "category": "content",
                "priority": "high",
                "impact": "strong",
            }
        ]
    return [Recommendation(**r) for r in recs]
