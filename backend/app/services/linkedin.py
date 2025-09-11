import json
import re
from typing import List, Optional
from fastapi import HTTPException
from datetime import datetime

from app.models.schemas import (
    PostGenerationRequest,
    GeneratedPost,
    PostGenerationResponse,
)
from app.core.llm import llm

# Import agents for enhanced content generation
try:
    from app.agents.websearch_agent import WebSearchAgent
    from app.agents.github_agent import GitHubAgent

    HAS_AGENTS = True

except ImportError:
    HAS_AGENTS = False


def clean_post_content(content: str) -> str:
    """Clean up LLM output to remove explanatory text and return only the post content."""
    lines = content.strip().split("\n")

    # Remove common explanatory prefixes
    unwanted_prefixes = [
        "here's a linkedin post",
        "here is a linkedin post",
        "linkedin post:",
        "post:",
        "here's the post",
        "here is the post",
        "generated post:",
        "the post:",
        "below is",
        "here's what i",
    ]

    cleaned_lines = []
    for line in lines:
        line_lower = line.strip().lower()

        # Skip lines that are clearly explanatory
        if any(prefix in line_lower for prefix in unwanted_prefixes):
            continue

        # Skip lines that end with colons (likely headers)
        if line.strip().endswith(":") and len(line.strip()) < 50:
            continue

        cleaned_lines.append(line)

    # Join back and clean up extra whitespace
    result = "\n".join(cleaned_lines).strip()

    # Remove any remaining quotes around the entire content
    if result.startswith('"') and result.endswith('"'):
        result = result[1:-1]

    if result.startswith("'") and result.endswith("'"):
        result = result[1:-1]

    return result


def scrape_github_project_info(repo_url: str) -> dict:
    """Enhanced GitHub scraping function using GitHubAgent"""
    if HAS_AGENTS:
        try:
            agent = GitHubAgent()
            # Note: This would need to be async in a real implementation
            # For now, using the mock fallback
            pass
        except Exception as e:
            print(f"Error using GitHub agent: {e}")

    # Fallback to mock implementation
    match = re.match(r"https://github.com/([^/]+)/([^/]+)", repo_url)
    if not match:
        return {"error": "Invalid GitHub URL"}

    owner, repo = match.groups()
    return {
        "project_name": repo.replace("-", " ").title(),
        "description": f"Mock description for {repo}",
        "main_technologies": ["Python", "FastAPI"],
        "stars": 123,
        "repo_link": repo_url,
    }


async def research_topic_with_web(topic: str, context: str = "") -> dict:
    """Research a topic using web search agent"""
    if not HAS_AGENTS:
        return {
            "research_summary": f"Research data about {topic}",
            "search_results": [],
        }

    try:
        agent = WebSearchAgent()
        research = await agent.research_topic(topic, context)
        return research
    except Exception as e:
        print(f"Error researching topic: {e}")
        return {
            "research_summary": f"Research data about {topic}",
            "search_results": [],
        }


async def generate_single_post(
    request: PostGenerationRequest,
    post_number: int = 1,
    github_context: str = "",
    research_context: str = "",
) -> GeneratedPost:
    """Generate a single LinkedIn post with enhanced context"""

    if not llm:
        raise HTTPException(status_code=500, detail="LLM is not available")

    # Map emoji levels to descriptions
    emoji_map = {
        0: "no emojis",
        1: "a few emojis",
        2: "moderate emojis",
        3: "many emojis",
    }
    emoji_guidance = emoji_map.get(request.emoji_level, "a few emojis")

    # Map length to descriptions
    length_map = {
        "Short": "short (50-80 words)",
        "Medium": "medium (100-150 words)",
        "Long": "long (200+ words)",
        "Any": "appropriate length",
    }
    length_guidance = length_map.get(
        request.length or "Medium", "medium (100-150 words)"
    )

    # Build enhanced context
    enhanced_context = ""
    if github_context:
        enhanced_context += f"\nProject Context: {github_context}"
    if research_context:
        enhanced_context += f"\nResearch Insights: {research_context}"

    # Create the enhanced prompt
    prompt = f"""Generate ONLY the LinkedIn post content ({length_guidance}) about {request.topic}.
Tone: {request.tone or 'Professional'}
Audience: {request.audience or 'General'}
Use {emoji_guidance}.
{enhanced_context}

Make the post engaging, authentic, and valuable to your professional network. Include insights, personal thoughts, or industry perspectives when relevant.

IMPORTANT: Return ONLY the post text without any explanatory lines, introductions, or meta-commentary. 
Do not include lines like 'Here's a LinkedIn post about...' or similar. 
Just return the actual post content that would be posted directly to LinkedIn."""

    try:
        # Generate the post content
        response = await llm.ainvoke(prompt)
        post_text = clean_post_content(
            str(response.content) if hasattr(response, "content") else str(response)
        )

        # Generate hashtags if requested
        hashtags = []
        if request.hashtags_option == "suggest":
            hashtag_prompt = f"Suggest exactly 3 simple hashtags for this LinkedIn post (return as plain text separated by commas, no quotes, no # symbols): {post_text}"
            hashtag_response = await llm.ainvoke(hashtag_prompt)

            # Parse hashtags
            hashtag_text = (
                str(hashtag_response.content)
                if hasattr(hashtag_response, "content")
                else str(hashtag_response)
            )
            hashtag_text = hashtag_text.strip()
            for h in hashtag_text.split(",")[:3]:
                cleaned = (
                    h.strip()
                    .replace("#", "")
                    .replace('"', "")
                    .replace("'", "")
                    .replace("[", "")
                    .replace("]", "")
                )
                if cleaned:
                    hashtags.append(cleaned)

        # Generate CTA if not provided
        cta = request.cta_text
        if not cta:
            cta_prompt = f"Suggest a concise call-to-action (CTA) for this LinkedIn post: {post_text}"
            cta_response = await llm.ainvoke(cta_prompt)
            cta = (
                str(cta_response.content)
                if hasattr(cta_response, "content")
                else str(cta_response)
            )
            cta = cta.strip()

        # Get GitHub project name if available
        github_project_name = None
        if github_context and "Project:" in github_context:
            # Extract project name from context
            match = re.search(r"Project: ([^-]+)", github_context)
            if match:
                github_project_name = match.group(1).strip()

        return GeneratedPost(
            text=post_text,
            hashtags=hashtags,
            cta_suggestion=cta,
            token_info={"prompt_tokens": 0, "completion_tokens": 0},
            github_project_name=github_project_name,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating post: {str(e)}")
        if github_context and "Project:" in github_context:
            # Extract project name from context
            match = re.search(r"Project: ([^-]+)", github_context)
            if match:
                github_project_name = match.group(1).strip()

        return GeneratedPost(
            text=post_text,
            hashtags=hashtags,
            cta_suggestion=cta,
            token_info={"prompt_tokens": 0, "completion_tokens": 0},
            github_project_name=github_project_name,
        )

    except Exception as e:  # type: ignore
        raise HTTPException(status_code=500, detail=f"Error generating post: {str(e)}")


async def generate_linkedin_posts_service(
    request: PostGenerationRequest,
) -> PostGenerationResponse:
    """Generate LinkedIn posts using the core LLM with enhanced research capabilities"""

    try:
        # Research the topic if agents are available
        research_context = ""
        if HAS_AGENTS and request.topic:
            try:
                research_data = await research_topic_with_web(request.topic)
                research_context = research_data.get("research_summary", "")
            except Exception as e:
                print(f"Research failed, continuing without: {e}")

        # Handle GitHub project info if provided
        github_context = ""
        if request.github_project_url:
            github_data = scrape_github_project_info(str(request.github_project_url))
            if not github_data.get("error"):
                github_context = f"\nProject: {github_data.get('project_name')} - {github_data.get('description')}\n"

        # Generate multiple posts
        posts = []
        for i in range(request.post_count):
            post = await generate_single_post(
                request, i + 1, github_context, research_context
            )
            posts.append(post)

        return PostGenerationResponse(
            success=True,
            message=f"Successfully generated {len(posts)} LinkedIn posts",
            posts=posts,
            timestamp=datetime.now().isoformat(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating posts: {str(e)}")


async def edit_post_llm_service(payload: dict) -> dict:
    """Edit a post using LLM according to user instruction"""

    if not llm:
        raise HTTPException(status_code=500, detail="LLM is not available")

    try:
        post = payload.get("post", {})
        instruction = payload.get("instruction", "")

        if not post or not instruction:
            return post

        prompt = f"""You are an assistant that edits LinkedIn posts. 
Instruction: {instruction}
Post: {post.get('text', '')}

Return only the edited post text without any explanatory comments."""

        response = await llm.ainvoke(prompt)
        edited_text = clean_post_content(
            str(response.content) if hasattr(response, "content") else str(response)
        )

        # Update the post text
        post["text"] = edited_text
        return post

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error editing post: {str(e)}")
