import asyncio
import datetime
import numpy as np
from typing import List, Dict, Tuple
from app.services.ats.modules.compatibility import assess_compatibility
from app.services.ats.modules.contact_info import assess_contact_info
from app.services.ats.modules.content_quality import assess_content_quality
from app.services.ats.modules.keyword_optimization import assess_keyword_optimization
from app.services.ats.modules.structure_formatting import assess_structure_formatting
from app.services.ats.modules.recommendations import (
    generate_recommendations,
    Recommendation,
)
from app.services.ats.modules.benchmarking import compute_industry_stats
from app.services.ats.extractor import parse_jd, parse_resume
from app.services.ats.models import (
    compute_weighted,
    predict_logistic,
    cosine_sim,
    compute_keyword_density,
)
from app.services.llm import ats_analysis_llm


class ATSCalculator:
    def __init__(
        self,
        weight_file: str = "models/weights.npy",
        bias_file: str = "models/bias.npy",
    ):
        self.w = np.load(weight_file)
        self.b = float(np.load(bias_file))
        self.career_weights = {
            "entry": (0.3, 0.3, 0.4),
            "mid": (0.4, 0.4, 0.2),
            "senior": (0.5, 0.4, 0.1),
            "executive": (0.6, 0.3, 0.1),
        }

    async def batch_score(
        self, jd_text: str, resumes: List[str], career_level: str = "mid"
    ) -> Dict:
        # Parse JD
        if jd_text:
            jd_feats, jd_emb = await parse_jd(jd_text)
        else:
            jd_feats, jd_emb = {}, None

        req_kw = jd_feats.get("required_skills", [])
        opt_kw = jd_feats.get("optional_skills", [])
        all_kw = list(dict.fromkeys(req_kw + opt_kw))

        # Parse resumes
        parsed = await asyncio.gather(*[parse_resume(r) for r in resumes])
        results = []

        for (feats, r_emb), raw in zip(parsed, resumes):
            # Heuristic/module-based scores
            comp = assess_compatibility(feats)
            contact = assess_contact_info(feats)
            content = assess_content_quality(raw)
            req_cov, opt_cov = assess_keyword_optimization(
                req_kw,
                opt_kw,
                feats.get("skills", []),
            )
            fmt = assess_structure_formatting(raw)
            dens = compute_keyword_density(
                raw,
                all_kw,
            )

            found = [
                kw
                for kw in all_kw
                if kw.lower() in map(str.lower, feats.get("skills", []))
            ]

            missing = [kw for kw in all_kw if kw not in found]
            x = feats.get("x", np.zeros_like(self.w))

            sw = compute_weighted(self.w, x)
            pl = predict_logistic(self.w, self.b, x)
            sem = cosine_sim(jd_emb, r_emb) if jd_emb is not None else 0.0
            alpha, beta, gamma = self.career_weights.get(
                career_level.lower(), (0.4, 0.4, 0.2)
            )
            comp_score = alpha * sw + beta * pl + gamma * sem

            # LLM for recommendations, summary, strengths, areas
            llm_result = ats_analysis_llm(raw, jd_text)
            recs = llm_result.get("recommendations") or generate_recommendations(
                feats,
                raw,
                {
                    "compatibility": comp,
                    "contact": contact,
                    "content": content,
                    "req_keyword_cov": req_cov,
                    "opt_keyword_cov": opt_cov,
                    "formatting": fmt,
                    "keyword_density": dens,
                },
            )

            strengths = llm_result.get("strengths") or []
            areas = llm_result.get("areas_for_improvement") or []
            industry_avg, pct = compute_industry_stats(comp_score)
            summary = llm_result.get("summary") or ""

            # Compose result
            results.append(
                {
                    "composite": comp_score,
                    "semantic": sem,
                    "compatibility": comp,
                    "contact": contact,
                    "content": content,
                    "req_keyword_cov": req_cov,
                    "opt_keyword_cov": opt_cov,
                    "formatting": fmt,
                    "keyword_density": dens,
                    "found_keywords": found,
                    "missing_keywords": missing,
                    "recommended_keywords": missing,
                    "recommendations": recs,
                    "strengths": strengths,
                    "areas_for_improvement": areas,
                    "industry_average": industry_avg,
                    "percentile": pct,
                    "summary": summary,
                }
            )

        overall = float(np.mean([r["composite"] for r in results]))

        return {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "career_level": career_level,
            "overall_score": overall,
            "results": results,
        }
