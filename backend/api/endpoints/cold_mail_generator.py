from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from langchain.prompts import PromptTemplate

router = APIRouter()


class Tip(BaseModel):
    category: str
    advice: str


class TipsData(BaseModel):
    resume_tips: List[Tip] = Field(default_factory=list)
    interview_tips: List[Tip] = Field(default_factory=list)


class TipsGenerationRequest(BaseModel):
    job_category: str
    skills_list_str: str


class TipsResponse(BaseModel):
    tips: Optional[TipsData] = None
    error: Optional[str] = None


tips_generator_prompt_template_str = """
You are a helpful career advisor. Generate practical and actionable tips for resume improvement and interview preparation.

Context (Optional):
- Job Category: {job_category}
- Key Skills: {skills_list_str}

Instructions:
1.  **Resume Tips**: Provide 3-5 distinct tips for improving a resume. These can cover content, formatting, tailoring, and common mistakes to avoid. If `job_category` or `skills_list_str` are provided, try to make 1-2 tips relevant to them.
    - Each tip should have a `category` (e.g., "Content", "Keywords", "Impact") and `advice` (the tip itself).
2.  **Interview Tips**: Provide 3-5 distinct tips for interview preparation. These can cover research, common questions (STAR method), behavioral aspects, and post-interview follow-up. If `job_category` is provided, try to make 1-2 tips relevant to common interview focuses for that category.
    - Each tip should have a `category` (e.g., "Preparation", "Answering Questions", "Behavioral") and `advice`.

Pydantic Models for Output Structure:
```python
from typing import List
from pydantic import BaseModel, Field

class Tip(BaseModel):
    category: str
    advice: str

class TipsData(BaseModel):
    resume_tips: List[Tip] = Field(default_factory=list)
    interview_tips: List[Tip] = Field(default_factory=list)
```

Output:
Return ONLY a single JSON object that would successfully instantiate `TipsData(...)`.
"""

tips_generator_prompt = PromptTemplate(
    input_variables=["job_category", "skills_list_str"],
    template=tips_generator_prompt_template_str,
)


tips_generation_chain = None
if llm:
    tips_generation_chain = LLMChain(
        llm=llm,
        prompt=tips_generator_prompt,
    )


@router.post("/generate_tips", response_model=TipsResponse)
async def generate_tips_for_interview(
    request_data: TipsGenerationRequest,
):
    if not tips_generation_chain:
        raise HTTPException(
            status_code=503, detail="LLM for tips generation not available"
        )

    try:
        input_data = {
            "job_category": request_data.job_category,
            "skills_list_str": request_data.skills_list_str,
        }
        result_json_str = await tips_generation_chain.arun(input_data)

        tips_data = TipsData.parse_raw(result_json_str)

        return TipsResponse(
            tips=TipsData(resume_tips=[Tip(category="Test", advice="Test advice")])
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error during tips generation: {str(e)}"
        )

    return {
        "message": "Cold mail generator (tips) endpoint placeholder",
    }
