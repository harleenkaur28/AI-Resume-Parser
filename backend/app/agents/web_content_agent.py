import requests


def return_markdown(url: str) -> str:
    """Fetches the markdown content from a given URL using the Jina AI service."""
    jina_url = "https://r.jina.ai/" + url
    print(f"Fetching markdown for URL: {url}")
    print(f"Using Jina AI endpoint: {jina_url}")

    try:
        res = requests.get(jina_url)
        return res.text

    except Exception as e:
        return f"Error fetching content from {url}: {str(e)}"
