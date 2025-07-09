import re
from typing import Any


def assess_contact_info(feats: dict[str, Any]) -> float:
    score = 0.0
    email = feats.get("email", "")
    phone = feats.get("phone", "")
    linkedin = feats.get("linkedin", "")

    if re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
        score += 0.5

    if re.match(r"^\+?\d[\d\s\-\(\)]+$", phone):
        score += 0.3

    if linkedin.startswith("https://www.linkedin.com/"):
        score += 0.2

    return score
