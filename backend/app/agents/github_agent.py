"""
GitHub Agent for extracting project information and insights
"""

import re
import requests
from typing import Dict, List, Optional, Any
from urllib.parse import urlparse
from app.core.llm import llm


class GitHubAgent:
    """Agent for extracting information from GitHub repositories"""

    def __init__(self):
        self.github_api_base = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "TalentSync-LinkedIn-Generator",
        }

    def parse_github_url(self, url: str) -> Optional[Dict[str, str]]:
        """
        Parse GitHub URL to extract owner and repository name
        """
        try:
            # Handle different GitHub URL formats
            patterns = [
                r"github\.com/([^/]+)/([^/]+?)(?:\.git)?/?$",
                r"github\.com/([^/]+)/([^/]+)/.*",
                r"github\.com/([^/]+)/([^/]+)$",
            ]

            for pattern in patterns:
                match = re.search(pattern, url)
                if match:
                    owner, repo = match.groups()
                    # Clean up repo name
                    repo = repo.rstrip(".git")
                    return {"owner": owner, "repo": repo}

            return None

        except Exception as e:
            print(f"Error parsing GitHub URL: {e}")
            return None

    async def get_repository_info(self, url: str) -> Dict[str, Any]:
        """
        Get comprehensive repository information from GitHub
        """
        parsed = self.parse_github_url(url)
        if not parsed:
            return {"error": "Invalid GitHub URL format"}

        owner, repo = parsed["owner"], parsed["repo"]

        try:
            # Get basic repository info
            repo_url = f"{self.github_api_base}/repos/{owner}/{repo}"
            response = requests.get(repo_url, headers=self.headers, timeout=10)

            if response.status_code != 200:
                return {
                    "error": f"Repository not found or private: {response.status_code}"
                }

            repo_data = response.json()

            # Get languages
            languages_url = f"{self.github_api_base}/repos/{owner}/{repo}/languages"
            lang_response = requests.get(
                languages_url, headers=self.headers, timeout=10
            )
            languages = lang_response.json() if lang_response.status_code == 200 else {}

            # Get recent commits (for activity)
            commits_url = (
                f"{self.github_api_base}/repos/{owner}/{repo}/commits?per_page=5"
            )
            commit_response = requests.get(
                commits_url, headers=self.headers, timeout=10
            )
            commits = (
                commit_response.json() if commit_response.status_code == 200 else []
            )

            # Get README content
            readme_content = self._get_readme_content(owner, repo)

            return {
                "name": repo_data.get("name", ""),
                "full_name": repo_data.get("full_name", ""),
                "description": repo_data.get("description", ""),
                "stars": repo_data.get("stargazers_count", 0),
                "forks": repo_data.get("forks_count", 0),
                "language": repo_data.get("language", ""),
                "languages": languages,
                "topics": repo_data.get("topics", []),
                "created_at": repo_data.get("created_at", ""),
                "updated_at": repo_data.get("updated_at", ""),
                "homepage": repo_data.get("homepage", ""),
                "license": (
                    repo_data.get("license", {}).get("name", "")
                    if repo_data.get("license")
                    else ""
                ),
                "open_issues": repo_data.get("open_issues_count", 0),
                "readme_content": readme_content,
                "recent_commits": len(commits),
                "is_active": len(commits) > 0,
                "url": repo_data.get("html_url", url),
            }

        except Exception as e:
            print(f"Error fetching repository info: {e}")
            return {"error": f"Failed to fetch repository information: {str(e)}"}

    def _get_readme_content(self, owner: str, repo: str) -> str:
        """
        Get README content from repository
        """
        try:
            readme_url = f"{self.github_api_base}/repos/{owner}/{repo}/readme"
            response = requests.get(readme_url, headers=self.headers, timeout=10)

            if response.status_code == 200:
                readme_data = response.json()
                # GitHub API returns base64 encoded content
                import base64

                content = base64.b64decode(readme_data["content"]).decode("utf-8")
                # Return first 1000 characters to avoid too much content
                return content[:1000] if len(content) > 1000 else content
            return ""
        except Exception:
            return ""

    async def analyze_project_for_linkedin(self, url: str) -> Dict[str, Any]:
        """
        Analyze GitHub project and generate insights for LinkedIn content
        """
        repo_info = await self.get_repository_info(url)

        if repo_info.get("error"):
            return repo_info

        # Generate project analysis using LLM
        analysis = await self._generate_project_insights(repo_info)

        return {**repo_info, "linkedin_insights": analysis}

    async def _generate_project_insights(
        self, repo_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate LinkedIn-friendly insights about the project
        """
        try:
            # Prepare project context
            context = f"""
Project: {repo_info.get('name', 'Unknown')}
Description: {repo_info.get('description', 'No description')}
Main Language: {repo_info.get('language', 'Not specified')}
Stars: {repo_info.get('stars', 0)}
Topics: {', '.join(repo_info.get('topics', []))}
README excerpt: {repo_info.get('readme_content', '')[:500]}
"""

            # Generate insights using LLM
            prompt = f"""Analyze this GitHub project and provide LinkedIn-friendly insights:

{context}

Provide insights in the following format:
1. Key Achievement: What makes this project notable?
2. Technical Highlights: Key technologies and innovations
3. Impact Statement: What problem does it solve or value does it provide?
4. LinkedIn Hooks: 3 engaging ways to present this project on LinkedIn

Keep each point concise and professional."""

            response = await llm.ainvoke(prompt)
            insights_text = (
                str(response.content) if hasattr(response, "content") else str(response)
            )

            # Parse insights (basic parsing)
            insights = {
                "key_achievement": self._extract_insight(
                    insights_text, "Key Achievement"
                ),
                "technical_highlights": self._extract_insight(
                    insights_text, "Technical Highlights"
                ),
                "impact_statement": self._extract_insight(
                    insights_text, "Impact Statement"
                ),
                "linkedin_hooks": self._extract_hooks(insights_text),
                "suggested_hashtags": self._generate_hashtags(repo_info),
                "project_stats": {
                    "stars": repo_info.get("stars", 0),
                    "language": repo_info.get("language", ""),
                    "is_active": repo_info.get("is_active", False),
                },
            }

            return insights

        except Exception as e:
            print(f"Error generating project insights: {e}")
            return {
                "key_achievement": f"Open source project: {repo_info.get('name', 'Unknown')}",
                "technical_highlights": f"Built with {repo_info.get('language', 'various technologies')}",
                "impact_statement": repo_info.get(
                    "description", "Innovative software solution"
                ),
                "linkedin_hooks": [
                    f"Just released my latest project: {repo_info.get('name', 'Unknown')}",
                    f"Working with {repo_info.get('language', 'cutting-edge tech')} to solve real problems",
                    f"Open source contribution: {repo_info.get('description', 'Building something amazing')}",
                ],
                "suggested_hashtags": self._generate_hashtags(repo_info),
                "project_stats": {
                    "stars": repo_info.get("stars", 0),
                    "language": repo_info.get("language", ""),
                    "is_active": repo_info.get("is_active", False),
                },
            }

    def _extract_insight(self, text: str, section: str) -> str:
        """
        Extract specific insight section from LLM response
        """
        try:
            # Look for the section in the text
            pattern = rf"{section}:?\s*(.+?)(?=\n\d+\.|$)"
            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(1).strip()
            return f"Insights about {section.lower()}"
        except:
            return f"Insights about {section.lower()}"

    def _extract_hooks(self, text: str) -> List[str]:
        """
        Extract LinkedIn hooks from LLM response
        """
        try:
            # Look for LinkedIn Hooks section
            hooks_section = self._extract_insight(text, "LinkedIn Hooks")
            # Split by common delimiters and clean up
            hooks = []
            for line in hooks_section.split("\n"):
                line = line.strip()
                if line and not line.startswith("LinkedIn Hooks"):
                    # Remove bullet points and numbering
                    cleaned = re.sub(r"^[\d\-\*\•]\s*", "", line)
                    if cleaned:
                        hooks.append(cleaned)

            return (
                hooks[:3]
                if hooks
                else [
                    "Excited to share my latest project",
                    "Building innovative solutions with modern tech",
                    "Open source development at its finest",
                ]
            )
        except:
            return [
                "Excited to share my latest project",
                "Building innovative solutions with modern tech",
                "Open source development at its finest",
            ]

    def _generate_hashtags(self, repo_info: Dict[str, Any]) -> List[str]:
        """
        Generate relevant hashtags based on project information
        """
        hashtags = []

        # Add language-based hashtags
        language = repo_info.get("language", "").lower()
        if language:
            hashtags.append(language)

        # Add topic-based hashtags
        topics = repo_info.get("topics", [])
        hashtags.extend(topics[:3])

        # Add generic tech hashtags
        generic_tags = ["opensource", "development", "coding", "tech", "innovation"]
        hashtags.extend(generic_tags[:2])

        # Clean and limit hashtags
        cleaned_hashtags = []
        for tag in hashtags:
            if isinstance(tag, str):
                clean_tag = re.sub(r"[^a-zA-Z0-9]", "", tag.lower())
                if clean_tag and clean_tag not in cleaned_hashtags:
                    cleaned_hashtags.append(clean_tag)

        return cleaned_hashtags[:5]


# Convenience function for easy import
async def analyze_github_for_linkedin(url: str) -> Dict[str, Any]:
    """
    Convenience function to analyze a GitHub project for LinkedIn content
    """
    agent = GitHubAgent()
    return await agent.analyze_project_for_linkedin(url)
