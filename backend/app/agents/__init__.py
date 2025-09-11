"""
Agents module for TalentSync - AI-powered tools for content generation
"""

from .websearch_agent import WebSearchAgent
from .github_agent import GitHubAgent

__all__ = [
    "WebSearchAgent",
    "GitHubAgent",
]
