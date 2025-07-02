import json
from fastapi import HTTPException
from app.models.schemas import TipsResponse, TipsData, Tip
from app.data.ai.tips_generator import tips_generator_chain


def tips_llm(
    job_category: str,
    skills: list[str] | str,
) -> TipsData:
    if not tips_generator_chain:
        raise HTTPException(
            status_code=503,
            detail="LLM service is not available.",
        )

    if not job_category:
        job_category = "General"

    if not skills:
        skills = ""

    if isinstance(skills, list):
        skills = ", ".join(skills)

    try:
        result = tips_generator_chain.invoke(
            {
                "job_category": job_category,
                "skills_list_str": skills,
            }
        )
        result = str(result.content)

        if result.strip().startswith("```json"):
            result = result.strip().removeprefix("```json").removesuffix("```").strip()

            return TipsData(**json.loads(result))

        elif result.strip().startswith("{"):
            result = result.strip()

            return TipsData(**json.loads(result))

        else:
            result = result.strip()

            start_index = result.find("{")
            end_index = result.rfind("}") + 1

            result = result[start_index:end_index]

            error_flag = len(result) < 0

            try:
                return TipsData(**json.loads(result))

            except json.JSONDecodeError:
                error_flag = True

            if error_flag:
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

    except Exception as e:
        print(f"Error in tips_llm: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate tips: {str(e)}",
        )

    raise ValueError("Unexpected result format from tips_generator_chain")


def get_career_tips_service(
    job_category: str,
    skills: list[str] | str,
) -> TipsResponse:
    try:
        tips_data = tips_llm(job_category, skills)

    except HTTPException:
        raise

    except Exception as e:
        print(f"Error in /tips/: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve tips: {str(e)}"
        )

    return TipsResponse(data=tips_data)
