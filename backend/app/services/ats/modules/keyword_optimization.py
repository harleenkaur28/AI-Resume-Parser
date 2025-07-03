from typing import List, Tuple


def assess_keyword_optimization(
    req_kw: List[str],
    opt_kw: List[str],
    skills: List[str],
) -> Tuple[float, float]:

    req_cov = sum(
        1
        for k in req_kw
        if k.lower()
        in map(
            str.lower,
            skills,
        )
    ) / max(1, len(req_kw))

    opt_cov = sum(
        1
        for k in opt_kw
        if k.lower()
        in map(
            str.lower,
            skills,
        )
    ) / max(1, len(opt_kw))

    return req_cov, opt_cov
