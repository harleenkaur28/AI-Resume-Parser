import requests


def return_markdown(url: str, timeout: int = 5000) -> str:
    """Fetches the markdown content from a given URL using the Jina AI service."""

    if not url:
        return ""

    try:
        res = requests.get(
            "https://r.jina.ai/" + url.lstrip("/"),
            timeout=timeout,
        )

        if res.status_code == 200 and res.text:
            return res.text

        return ""

    except Exception:
        return ""
