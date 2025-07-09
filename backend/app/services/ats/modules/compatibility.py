from typing import Dict

EXPECTED_FIELDS = [
    "name",
    "email",
    "phone",
    "education",
    "experience",
    "skills",
]


def assess_compatibility(feats: Dict) -> float:
    found = sum(1 for f in EXPECTED_FIELDS if feats.get(f) is not None)
    return found / len(EXPECTED_FIELDS)
