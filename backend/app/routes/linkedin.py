from fastapi import APIRouter
from app.models.schemas import (
    PostGenerationRequest,
    PostGenerationResponse,
)
from app.services import (
    linkedin_profile,
)
from app.services import linkedin_post

router = APIRouter()


@router.post(
    "/linkedin/generate-posts",
    response_model=PostGenerationResponse,
    summary="Generate LinkedIn Posts",
    description="Generate multiple LinkedIn posts based on topic, tone, and other parameters",
)
async def generate_linkedin_posts(request: PostGenerationRequest):
    """
    Generate LinkedIn posts using AI based on the provided parameters.

    Returns a structured response with generated posts, hashtags, and CTA suggestions.
    """
    return await linkedin_post.generate_linkedin_posts_service(request)


@router.post(
    "/linkedin/edit-post",
    summary="Edit LinkedIn Post with AI",
    description="Edit an existing LinkedIn post using AI based on user instructions",
)
async def edit_linkedin_post(payload: dict):
    """
    Edit a LinkedIn post using AI based on user instructions.

    Expected payload: {"post": {...}, "instruction": "Make it shorter"}
    Returns the updated post.
    """
    return await linkedin_post.edit_post_llm_service(payload)


@router.post(
    "/linkedin/generate-page",
    response_model=linkedin_profile.LinkedInPageResponse,
    summary="Generate Complete LinkedIn Page",
    description="Generate comprehensive LinkedIn page content including profile, posts, and engagement strategy",
)
async def generate_linkedin_page(request: linkedin_profile.LinkedInPageRequest):
    """
    Generate comprehensive LinkedIn page content including:
    - Professional profile content (headline, summary, about section)
    - Experience highlights and skills
    - Featured projects from GitHub
    - Suggested posts for content calendar
    - Engagement tips and strategy

    This endpoint combines web research, GitHub analysis, and AI-powered content generation
    to create a complete LinkedIn presence strategy.
    """
    return await linkedin_profile.generate_comprehensive_linkedin_page(request)
