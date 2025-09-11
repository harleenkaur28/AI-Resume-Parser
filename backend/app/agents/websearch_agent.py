"""
WebSearch Agent for gathering real-time information from the web
"""

import requests
from typing import List, Dict, Optional, Any
from urllib.parse import quote
import re
from app.core.llm import llm

try:
    from bs4 import BeautifulSoup

    HAS_BS4 = True

except ImportError:
    HAS_BS4 = False


class WebSearchAgent:
    """Agent for performing web searches and extracting content"""

    def __init__(self):
        self.search_engines = {
            "duckduckgo": "https://duckduckgo.com/html/?q=",
            "bing": "https://www.bing.com/search?q=",
        }
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    def search_web(self, query: str, max_results: int = 5) -> List[Dict[str, str]]:
        """
        Search the web and return a list of results with titles, URLs, and snippets
        """
        try:
            search_url = f"https://duckduckgo.com/html/?q={quote(query)}"

            response = requests.get(search_url, headers=self.headers, timeout=10)
            html = response.text

            if not HAS_BS4:
                # Simple fallback without BeautifulSoup
                return [
                    {
                        "title": query,
                        "url": "",
                        "snippet": "Search functionality limited without BeautifulSoup",
                    }
                ]

            soup = BeautifulSoup(html, "html.parser")
            results = []

            # Parse DuckDuckGo results
            result_elements = soup.find_all("div", class_="web-result")[:max_results]

            for element in result_elements:
                try:
                    title_elem = element.find("a", class_="result__a")
                    snippet_elem = element.find("div", class_="result__snippet")

                    if title_elem and snippet_elem:
                        title = title_elem.get_text().strip()
                        url = title_elem.get("href", "")
                        snippet = snippet_elem.get_text().strip()

                        # Clean up URL if it's a DuckDuckGo redirect
                        if url.startswith("/l/?uddg="):
                            url = url.split("uddg=")[1] if "uddg=" in url else url

                        results.append({"title": title, "url": url, "snippet": snippet})
                except Exception as e:
                    print(f"Error parsing result: {e}")
                    continue

            return results

        except Exception as e:
            print(f"Error in web search: {e}")
            return []

    def extract_page_content(self, url: str) -> str:
        """
        Extract clean text content from a webpage
        """
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            html = response.text

            if not HAS_BS4:
                # Simple text extraction without BeautifulSoup
                # Remove common HTML tags manually
                text = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL)
                text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
                text = re.sub(r"<[^>]+>", "", text)
                return text[:3000] if len(text) > 3000 else text

            soup = BeautifulSoup(html, "html.parser")

            # Remove script and style elements
            for script in soup.find_all(["script", "style"]):
                script.decompose()

            # Get text content
            text = soup.get_text()

            # Clean up text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = " ".join(chunk for chunk in chunks if chunk)

            # Limit content length
            return text[:3000] if len(text) > 3000 else text

        except Exception as e:
            print(f"Error extracting content from {url}: {e}")
            return ""

    async def research_topic(self, topic: str, context: str = "") -> Dict[str, Any]:
        """
        Research a topic by searching the web and extracting relevant information
        """
        search_query = f"{topic} trends insights latest news"
        search_results = self.search_web(search_query, max_results=3)

        # Extract content from top results
        valid_contents = []
        for result in search_results[:2]:  # Limit to avoid timeouts
            if result["url"].startswith("http"):
                content = self.extract_page_content(result["url"])
                if content:
                    valid_contents.append(content)

        return {
            "search_results": search_results,
            "extracted_content": valid_contents,
            "research_summary": await self._summarize_research(
                topic, search_results, valid_contents
            ),
        }

    async def _summarize_research(
        self, topic: str, search_results: List[Dict], content: List[str]
    ) -> str:
        """
        Use LLM to summarize research findings
        """
        try:
            if not search_results and not content:
                return f"No recent information found about {topic}"

            # Prepare research data
            research_text = f"Topic: {topic}\n\n"

            if search_results:
                research_text += "Search Results:\n"
                for i, result in enumerate(search_results[:3], 1):
                    research_text += (
                        f"{i}. {result['title']}\n   {result['snippet']}\n\n"
                    )

            if content:
                research_text += "Detailed Content:\n"
                for i, text in enumerate(content[:2], 1):
                    research_text += f"Source {i}: {text[:800]}...\n\n"

            # Generate summary using LLM
            prompt = f"""Based on the following research about "{topic}", provide a concise summary of key insights, trends, and relevant information that would be useful for creating LinkedIn content:

{research_text}

Summary (2-3 sentences focusing on key insights and trends):"""

            response = await llm.ainvoke(prompt)
            summary = (
                str(response.content) if hasattr(response, "content") else str(response)
            )

            return summary.strip()

        except Exception as e:
            print(f"Error summarizing research: {e}")
            return f"Research data gathered about {topic} - ready for content creation"

    def get_trending_topics(self, industry: str = "") -> List[str]:
        """
        Get trending topics in a specific industry or general trends
        """
        try:
            query = (
                f"{industry} trending topics 2024"
                if industry
                else "trending topics 2024"
            )
            search_results = self.search_web(query, max_results=3)

            # Extract trending topics from search results
            trends = []
            for result in search_results:
                snippet = result["snippet"].lower()
                # Simple extraction of potential trending topics
                words = re.findall(
                    r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b",
                    result["title"] + " " + result["snippet"],
                )
                trends.extend(words[:3])

            # Remove duplicates and return top trends
            unique_trends = list(dict.fromkeys(trends))[:5]
            return (
                unique_trends if unique_trends else ["AI", "Technology", "Innovation"]
            )

        except Exception as e:
            print(f"Error getting trending topics: {e}")
            return ["AI", "Technology", "Innovation"]


# Convenience function for easy import
async def search_web_for_linkedin(topic: str, context: str = "") -> Dict[str, Any]:
    """
    Convenience function to research a topic for LinkedIn content
    """
    agent = WebSearchAgent()
    return await agent.research_topic(topic, context)

    async def research_topic(self, topic: str, context: str = "") -> Dict[str, Any]:
        """
        Research a topic by searching the web and extracting relevant information
        """
        search_query = f"{topic} trends insights latest news"
        search_results = await self.search_web(search_query, max_results=3)

        # Extract content from top results
        content_tasks = []
        for result in search_results[:2]:  # Limit to avoid timeouts
            if result["url"].startswith("http"):
                content_tasks.append(self.extract_page_content(result["url"]))

        if content_tasks:
            try:
                contents = await asyncio.gather(*content_tasks, return_exceptions=True)
                valid_contents = [c for c in contents if isinstance(c, str) and c]
            except:
                valid_contents = []
        else:
            valid_contents = []

        return {
            "search_results": search_results,
            "extracted_content": valid_contents,
            "research_summary": await self._summarize_research(
                topic, search_results, valid_contents
            ),
        }

    async def _summarize_research(
        self, topic: str, search_results: List[Dict], content: List[str]
    ) -> str:
        """
        Use LLM to summarize research findings
        """
        try:
            if not search_results and not content:
                return f"No recent information found about {topic}"

            # Prepare research data
            research_text = f"Topic: {topic}\n\n"

            if search_results:
                research_text += "Search Results:\n"
                for i, result in enumerate(search_results[:3], 1):
                    research_text += (
                        f"{i}. {result['title']}\n   {result['snippet']}\n\n"
                    )

            if content:
                research_text += "Detailed Content:\n"
                for i, text in enumerate(content[:2], 1):
                    research_text += f"Source {i}: {text[:800]}...\n\n"

            # Generate summary using LLM
            prompt = f"""Based on the following research about "{topic}", provide a concise summary of key insights, trends, and relevant information that would be useful for creating LinkedIn content:

{research_text}

Summary (2-3 sentences focusing on key insights and trends):"""

            response = await llm.ainvoke(prompt)
            summary = (
                str(response.content) if hasattr(response, "content") else str(response)
            )

            return summary.strip()

        except Exception as e:
            print(f"Error summarizing research: {e}")
            return f"Research data gathered about {topic} - ready for content creation"

    async def get_trending_topics(self, industry: str = "") -> List[str]:
        """
        Get trending topics in a specific industry or general trends
        """
        try:
            query = (
                f"{industry} trending topics 2024"
                if industry
                else "trending topics 2024"
            )
            search_results = await self.search_web(query, max_results=3)

            # Extract trending topics from search results
            trends = []
            for result in search_results:
                snippet = result["snippet"].lower()
                # Simple extraction of potential trending topics
                words = re.findall(
                    r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b",
                    result["title"] + " " + result["snippet"],
                )
                trends.extend(words[:3])

            # Remove duplicates and return top trends
            unique_trends = list(dict.fromkeys(trends))[:5]
            return (
                unique_trends if unique_trends else ["AI", "Technology", "Innovation"]
            )

        except Exception as e:
            print(f"Error getting trending topics: {e}")
            return ["AI", "Technology", "Innovation"]


# Convenience function for easy import
async def search_web_for_linkedin(topic: str, context: str = "") -> Dict[str, Any]:
    """
    Convenience function to research a topic for LinkedIn content
    """
    agent = WebSearchAgent()
    return await agent.research_topic(topic, context)
