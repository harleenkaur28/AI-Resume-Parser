import numpy as np


def compute_weighted(w, x):
    """Weighted sum of features."""
    w = np.array(w)
    x = np.array(x)
    return float(np.dot(w, x))


def predict_logistic(w, b, x):
    """Logistic regression prediction."""
    w = np.array(w)
    x = np.array(x)
    z = np.dot(w, x) + b
    return float(1 / (1 + np.exp(-z)))


def cosine_sim(a, b):
    """Cosine similarity between two vectors."""
    a = np.array(a)
    b = np.array(b)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def compute_keyword_density(text, keywords):
    """Compute keyword density (keywords per 100 words)."""
    if not text or not keywords:
        return 0.0
    text_words = text.lower().split()
    keyword_count = sum(text_words.count(kw.lower()) for kw in keywords)
    density = (keyword_count / max(len(text_words), 1)) * 100
    return float(density)
