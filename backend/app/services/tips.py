from app.models.schemas import TipsResponse, TipsData, Tip


def tips_llm(job_category, skills):
    # TODO: Replace with actual LLM logic
    return TipsData(
        resume_tips=[
            Tip(
                category="Content",
                advice="Keep your resume concise and relevant.",
            ),
            Tip(
                category="Formatting",
                advice="Use clear section headings and bullet points.",
            ),
        ],
        interview_tips=[
            Tip(
                category="Preparation",
                advice="Research the company before your interview.",
            ),
            Tip(
                category="Behavioral",
                advice="Practice common behavioral questions.",
            ),
        ],
    )


def get_career_tips_service(job_category, skills):
    tips_data = tips_llm(job_category, skills)
    return TipsResponse(data=tips_data)
