from __future__ import annotations

import logging
import os
import random
import time
from typing import Any, Dict, List, Optional

import requests
from tavily import TavilyClient
from dotenv import load_dotenv

from app.agents.web_content_agent import return_markdown


load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

REQUEST_TIMEOUT = 15
MAX_RETRIES = 2
BACKOFF_BASE = 0.7

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
]


def _headers() -> Dict[str, str]:
    return {
        "User-Agent": random.choice(USER_AGENTS),
    }


def _get(url: str, params: Optional[Dict[str, Any]] = None) -> requests.Response:
    last_exc: Optional[Exception] = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            resp = requests.get(
                url,
                params=params,
                headers=_headers(),
                timeout=REQUEST_TIMEOUT,
            )

            if resp.status_code in (429, 500, 502, 503, 504):
                raise requests.HTTPError(f"Transient HTTP {resp.status_code} on {url}")

            return resp

        except Exception as e:
            last_exc = e
            time.sleep(BACKOFF_BASE * (2**attempt))

    assert last_exc is not None
    raise last_exc


# Tavily search client
_TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
_tavily: Optional[TavilyClient] = (
    TavilyClient(api_key=_TAVILY_API_KEY) if _TAVILY_API_KEY else None
)


def search_and_get_urls(
    query: str, num_results: int = 10, lang: str = "en"
) -> List[str]:
    if not _tavily:
        logger.warning("TAVILY_API_KEY missing; returning empty list.")
        return []
    try:
        # Use 'search' for general queries; you can also use 'qna' when you want synthesized answers.
        res = _tavily.search(
            query=query,
            max_results=num_results,
            search_depth="advanced",  # or "basic" for speed
            include_answer=False,
            include_raw_content=False,
            include_images=False,
        )
        urls: List[str] = []
        for item in res.get("results", []):
            u = item.get("url")
            if u:
                urls.append(u)
            if len(urls) >= num_results:
                break
        return urls

    except Exception as e:
        logger.warning(f"Tavily search failed: {e}")
        return []


def get_cleaned_texts(urls: List[str]) -> List[Dict[str, str]]:
    texts: List[Dict[str, str]] = []
    for u in urls:
        md = return_markdown(u)
        if md and md.strip():
            texts.append(
                {
                    "url": u,
                    "md_body_content": md,
                }
            )
    return texts


def web_search_pipeline(query: str, max_results: int = 10) -> List[Dict[str, str]]:
    urls = search_and_get_urls(
        query,
        num_results=max_results,
    )
    if not urls:
        return []

    return get_cleaned_texts(urls)


# Agents (same external API)
from app.core.llm import llm
import asyncio


class WebSearchAgent:
    def __init__(self, max_results: int = 10):
        self.max_results = max_results

    def search_web(
        self, query: str, max_results: Optional[int] = None
    ) -> List[Dict[str, str]]:
        max_r = max_results or self.max_results
        urls = search_and_get_urls(query, num_results=max_r)
        return [
            {
                "title": u,
                "url": u,
                "snippet": "",
            }
            for u in urls
        ]

    def extract_page_content(self, url: str) -> str:
        return return_markdown(url)

    async def research_topic(self, topic: str, context: str = "") -> Dict[str, Any]:
        query = f"{topic} trends insights latest news" if topic else context
        results = self.search_web(query, max_results=3)
        contents: List[str] = []

        for r in results[:2]:
            if r["url"].startswith("http"):
                contents.append(self.extract_page_content(r["url"]))

        summary = await self._summarize_research(
            topic,
            results,
            contents,
        )

        return {
            "search_results": results,
            "extracted_content": contents,
            "research_summary": summary,
        }

    async def _summarize_research(
        self, topic: str, search_results: List[Dict[str, str]], contents: List[str]
    ) -> str:
        if not llm:
            return (
                "LLM unavailable; raw content gathered."
                if contents
                else f"No information found about {topic}."
            )
        try:
            research_text = f"Topic: {topic}\n\n"
            if search_results:
                research_text += (
                    "Search Results:\n"
                    + "\n".join(
                        f"{i}. {r['url']}" for i, r in enumerate(search_results[:3], 1)
                    )
                    + "\n"
                )
            if contents:
                research_text += "\nContent Excerpts:\n" + "\n\n".join(
                    f"Source {i}: {c[:600]}..." for i, c in enumerate(contents[:2], 1)
                )
            prompt = (
                f"Summarize key insights, trends, and takeaways about '{topic}' for a professional LinkedIn post. "
                f"Base it ONLY on the following material. Be concise (2-3 sentences).\n\n{research_text}\nSummary:"
            )
            resp = await llm.ainvoke(prompt)
            return str(getattr(resp, "content", resp)).strip()
        except Exception as e:
            logger.warning(f"[websearch] summarization failed: {e}")
            return "Summary unavailable; see extracted content."


class LinkedInResearcher(WebSearchAgent):
    def __init__(self, max_results: int = 10, sentences: int = 3):
        super().__init__(max_results=max_results)
        self.sentences = sentences

    async def generate_post(self, topic: str):
        research = await self.research_topic(topic)
        summary = research.get("research_summary", "")

        if not llm or not summary:
            research["linkedin_post"] = (
                f"{topic.title()} – Key update: {summary or 'Insights gathered; see sources.'}"[
                    :800
                ]
            )
            return research
        try:
            prompt = (
                "You are a professional LinkedIn content strategist. Using ONLY the following summary, "
                f"draft a concise LinkedIn post (max {self.sentences} sentences). First sentence: a hook. "
                "Avoid hashtags except at most 2 at end if they add clarity. Maintain professional, optimistic tone.\n\n"
                f"SUMMARY:\n{summary}\n\nPOST:"
            )
            resp = await llm.ainvoke(prompt)
            research["linkedin_post"] = str(getattr(resp, "content", resp)).strip()
            return research

        except Exception as e:
            logger.warning(f"[linkedin_researcher] post generation failed: {e}")
            research["linkedin_post"] = summary
            return research


async def main() -> None:
    print("Running websearch_agent self-test\n")

    agent = WebSearchAgent(max_results=3)
    query = "Python typing improvements 2024"
    print(f"Searching for: {query}")
    results = agent.search_web(query, max_results=3)
    print("Search results:")
    for i, r in enumerate(results, 1):
        print(f"{i}. {r['url']}")

    if results:
        first_url = results[0]["url"]
        print(f"\nFetching content for first result: {first_url}")
        snippet = agent.extract_page_content(first_url)
        print("Content snippet:")
        print(snippet[:500] + ("..." if len(snippet) > 500 else ""))

    researcher = LinkedInResearcher(max_results=3, sentences=2)
    topic = "Python typing"
    print(f"\nGenerating LinkedIn post for topic: {topic} (LLM may be unavailable)")
    post_result = await researcher.generate_post(topic)
    print("\nGenerated LinkedIn post:")
    print(post_result.get("linkedin_post", "<no post returned>"))


if __name__ == "__main__":
    try:
        import asyncio

        asyncio.run(main())
    except KeyboardInterrupt:
        pass
