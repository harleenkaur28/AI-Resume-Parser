"""
LinkedIn Page Generator Service - Creates comprehensive LinkedIn presence content
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from fastapi import HTTPException
from pydantic import BaseModel, HttpUrl, Field

from app.core.llm import llm
from app.models.schemas import PostGenerationRequest, GeneratedPost

# Import agents with fallback
try:
    from app.agents.websearch_agent import WebSearchAgent
    from app.agents.github_agent import GitHubAgent

    HAS_AGENTS = True
except ImportError:
    HAS_AGENTS = False


class LinkedInProfileContent(BaseModel):
    """LinkedIn profile content structure"""

    headline: str
    summary: str
    about_section: str
    experience_highlights: List[str]
    skills_to_highlight: List[str]
    featured_projects: List[Dict[str, Any]]


class LinkedInPageRequest(BaseModel):
    """Request model for LinkedIn page generation"""

    # Personal Information
    name: str
    current_role: str
    industry: str
    years_of_experience: int = Field(ge=0, le=50)

    # Professional Background
    key_skills: List[str] = Field(max_items=10)  # type: ignore
    achievements: List[str] = Field(max_items=5)  # type: ignore
    company_name: Optional[str] = None

    # Content Preferences
    target_audience: str = Field(default="Professionals")
    professional_tone: str = Field(default="Professional")
    include_personal_touch: bool = Field(default=True)

    # Optional GitHub Integration
    github_profile_url: Optional[HttpUrl] = None
    featured_repositories: List[HttpUrl] = Field(default_factory=list, max_items=3)  # type: ignore

    # Content Generation Options
    generate_posts: bool = Field(default=True)
    post_count: int = Field(default=5, ge=1, le=10)
    content_themes: List[str] = Field(
        default_factory=lambda: [
            "Industry insights",
            "Career growth",
            "Technology trends",
        ]
    )


class LinkedInPageResponse(BaseModel):
    """Response model for LinkedIn page generation"""

    success: bool = True
    profile_content: LinkedInProfileContent
    suggested_posts: List[GeneratedPost] = Field(default_factory=list)
    content_calendar: List[Dict[str, Any]] = Field(default_factory=list)
    engagement_tips: List[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class LinkedInPageGenerator:
    """Service class for generating comprehensive LinkedIn page content"""

    def __init__(self):
        self.web_agent = WebSearchAgent() if HAS_AGENTS else None
        self.github_agent = GitHubAgent() if HAS_AGENTS else None

    async def generate_linkedin_page(
        self, request: LinkedInPageRequest
    ) -> LinkedInPageResponse:
        """
        Generate comprehensive LinkedIn page content including profile and posts
        """
        try:
            # Research industry trends if agents are available
            industry_insights = ""
            if self.web_agent and request.industry:
                try:
                    research = await self.web_agent.research_topic(
                        f"{request.industry} trends career opportunities 2024",
                        f"Professional with {request.years_of_experience} years experience",
                    )
                    industry_insights = research.get("research_summary", "")
                except Exception as e:
                    print(f"Industry research failed: {e}")

            # Analyze GitHub projects if provided
            github_insights = []
            if self.github_agent and request.featured_repositories:
                for repo_url in request.featured_repositories:
                    try:
                        analysis = await self.github_agent.analyze_project_for_linkedin(
                            str(repo_url)
                        )
                        if not analysis.get("error"):
                            github_insights.append(analysis)
                    except Exception as e:
                        print(f"GitHub analysis failed for {repo_url}: {e}")

            # Generate profile content
            profile_content = await self._generate_profile_content(
                request, industry_insights, github_insights
            )

            # Generate suggested posts
            suggested_posts = []
            if request.generate_posts:
                suggested_posts = await self._generate_suggested_posts(
                    request, industry_insights, github_insights
                )

            # Create content calendar
            content_calendar = self._create_content_calendar(request, suggested_posts)

            # Generate engagement tips
            engagement_tips = self._generate_engagement_tips(request)

            return LinkedInPageResponse(
                profile_content=profile_content,
                suggested_posts=suggested_posts,
                content_calendar=content_calendar,
                engagement_tips=engagement_tips,
            )

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error generating LinkedIn page: {str(e)}"
            )

    async def _generate_profile_content(
        self,
        request: LinkedInPageRequest,
        industry_insights: str,
        github_insights: List[Dict],
    ) -> LinkedInProfileContent:
        """Generate LinkedIn profile content"""

        # Build context for profile generation
        context = f"""
Professional Profile Information:
- Name: {request.name}
- Current Role: {request.current_role}
- Industry: {request.industry}
- Experience: {request.years_of_experience} years
- Key Skills: {', '.join(request.key_skills)}
- Achievements: {'; '.join(request.achievements)}
- Target Audience: {request.target_audience}
- Company: {request.company_name or 'Not specified'}

Industry Context: {industry_insights}

GitHub Projects: {len(github_insights)} featured projects available
"""

        # Generate headline
        headline_prompt = f"""
Create a compelling LinkedIn headline for this professional. Keep it under 220 characters, professional yet engaging.

{context}

Generate ONLY the headline text, no explanations:"""

        headline_response = await llm.ainvoke(headline_prompt)
        headline = str(
            headline_response.content
            if hasattr(headline_response, "content")
            else headline_response
        ).strip()

        # Generate summary
        summary_prompt = f"""
Create a professional LinkedIn summary/about section (2-3 paragraphs) for this professional. Make it engaging, authentic, and value-focused.

{context}

Generate ONLY the summary text, no explanations:"""

        summary_response = await llm.ainvoke(summary_prompt)
        summary = str(
            summary_response.content
            if hasattr(summary_response, "content")
            else summary_response
        ).strip()

        # Generate about section (longer version)
        about_prompt = f"""
Create a detailed LinkedIn 'About' section for this professional. Include professional journey, expertise, values, and what they're passionate about. Keep it conversational but professional.

{context}

Generate ONLY the about section text, no explanations:"""

        about_response = await llm.ainvoke(about_prompt)
        about_section = str(
            about_response.content
            if hasattr(about_response, "content")
            else about_response
        ).strip()

        # Process experience highlights
        experience_highlights = [
            f"{request.years_of_experience}+ years in {request.industry}",
            f"Expertise in {', '.join(request.key_skills[:3])}",
        ]
        if request.achievements:
            experience_highlights.extend(request.achievements[:3])

        # Skills to highlight (top skills with industry relevance)
        skills_to_highlight = request.key_skills[:8]  # Top 8 skills

        # Featured projects from GitHub
        featured_projects = []
        for insight in github_insights[:3]:  # Top 3 projects
            project = {
                "name": insight.get("name", "Unknown Project"),
                "description": insight.get("description", ""),
                "technologies": insight.get("language", ""),
                "stars": insight.get("stars", 0),
                "url": insight.get("url", ""),
            }
            featured_projects.append(project)

        return LinkedInProfileContent(
            headline=headline,
            summary=summary,
            about_section=about_section,
            experience_highlights=experience_highlights,
            skills_to_highlight=skills_to_highlight,
            featured_projects=featured_projects,
        )

    async def _generate_suggested_posts(
        self,
        request: LinkedInPageRequest,
        industry_insights: str,
        github_insights: List[Dict],
    ) -> List[GeneratedPost]:
        """Generate suggested LinkedIn posts"""

        posts = []
        themes = request.content_themes or [
            "Industry insights",
            "Career growth",
            "Technology trends",
        ]

        for i, theme in enumerate(themes[: request.post_count]):
            try:
                # Create context for post generation
                post_context = f"""
Professional Background: {request.current_role} in {request.industry}
Industry Insights: {industry_insights}
Theme: {theme}
"""

                # Add GitHub context if available
                if github_insights and i < len(github_insights):
                    project = github_insights[i]
                    post_context += f"\nFeatured Project: {project.get('name')} - {project.get('description')}"

                # Generate post using existing LinkedIn service logic
                post_request = PostGenerationRequest(
                    topic=f"{theme} in {request.industry}",
                    tone=request.professional_tone,
                    audience=[request.target_audience],
                    length="Medium",
                    hashtags_option="suggest",
                    post_count=1,
                    emoji_level=1 if request.include_personal_touch else 0,
                )

                # Generate individual post
                from backend.app.services.linkedin_post import generate_single_post

                post = await generate_single_post(post_request, i + 1, post_context)
                posts.append(post)

            except Exception as e:
                print(f"Error generating post for theme '{theme}': {e}")
                continue

        return posts

    def _create_content_calendar(
        self, request: LinkedInPageRequest, posts: List[GeneratedPost]
    ) -> List[Dict[str, Any]]:
        """Create a content calendar for LinkedIn posts"""

        calendar = []
        themes = request.content_themes or [
            "Industry insights",
            "Career growth",
            "Technology trends",
        ]

        # Suggest posting schedule
        posting_schedule = [
            "Monday - Industry insights and trends",
            "Wednesday - Professional development and career tips",
            "Friday - Project highlights and achievements",
            "Weekend - Thought leadership and personal reflections",
        ]

        for i, schedule_item in enumerate(posting_schedule):
            if i < len(posts):
                calendar.append(
                    {
                        "day": schedule_item.split(" - ")[0],
                        "content_type": schedule_item.split(" - ")[1],
                        "suggested_post": posts[i].text[:100] + "...",
                        "hashtags": posts[i].hashtags,
                        "engagement_goal": "Drive professional discussions",
                    }
                )

        # Add additional content ideas
        calendar.extend(
            [
                {
                    "day": "Bi-weekly",
                    "content_type": "Industry news commentary",
                    "suggested_post": f"Share insights on {request.industry} developments",
                    "hashtags": [request.industry.lower(), "innovation", "insights"],
                    "engagement_goal": "Position as thought leader",
                },
                {
                    "day": "Monthly",
                    "content_type": "Career milestone or reflection",
                    "suggested_post": "Share professional growth journey and lessons learned",
                    "hashtags": ["careerjourney", "professionalgrowth", "leadership"],
                    "engagement_goal": "Connect with peers and inspire others",
                },
            ]
        )

        return calendar

    def _generate_engagement_tips(self, request: LinkedInPageRequest) -> List[str]:
        """Generate personalized engagement tips"""

        base_tips = [
            "Post consistently 2-3 times per week for optimal engagement",
            "Share industry insights and personal professional experiences",
            "Engage authentically with comments - respond thoughtfully",
            "Use relevant hashtags (3-5 per post) to increase discoverability",
            "Share behind-the-scenes content about your work and projects",
        ]

        # Add personalized tips based on request
        if request.github_profile_url:
            base_tips.append(
                "Regularly showcase your technical projects and open-source contributions"
            )

        if request.years_of_experience > 5:
            base_tips.append(
                "Mentor others by sharing lessons learned throughout your career"
            )

        if request.include_personal_touch:
            base_tips.append(
                "Include personal anecdotes to make your content more relatable"
            )

        base_tips.extend(
            [
                f"Connect with other professionals in {request.industry} to expand your network",
                "Share and comment on posts from industry leaders and peers",
                "Use LinkedIn Stories and LinkedIn Live to show more personality",
                "Write long-form articles monthly to establish thought leadership",
            ]
        )

        return base_tips


# Service instance
linkedin_page_generator = LinkedInPageGenerator()


# Main service function
async def generate_comprehensive_linkedin_page(
    request: LinkedInPageRequest,
) -> LinkedInPageResponse:
    """
    Generate comprehensive LinkedIn page content
    """
    return await linkedin_page_generator.generate_linkedin_page(request)
