from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from langchain.prompts import PromptTemplate


from core.ml_setup import llm
from langchain.chains import LLMChain

router = APIRouter()


class SkillProficiency(BaseModel):
    skill_name: str
    percentage: int


class UIDetailedWorkExperienceEntry(BaseModel):
    role: str
    company_and_duration: str
    bullet_points: List[str]


class UIProjectEntry(BaseModel):
    title: str
    technologies_used: List[str] = Field(default_factory=list)
    description: str


class LanguageEntry(BaseModel):
    language: str


class EducationEntry(BaseModel):
    education_detail: str


class ComprehensiveAnalysisData(BaseModel):
    skills_analysis: List[SkillProficiency] = Field(default_factory=list)
    recommended_roles: List[str] = Field(default_factory=list)
    languages: List[LanguageEntry] = Field(default_factory=list)
    education: List[EducationEntry] = Field(default_factory=list)
    work_experience: List[UIDetailedWorkExperienceEntry] = Field(default_factory=list)
    projects: List[UIProjectEntry] = Field(default_factory=list)
    name: Optional[str] = None
    email: Optional[str] = None
    contact: Optional[str] = None
    predicted_field: Optional[str] = None


class ComprehensiveAnalysisRequest(BaseModel):
    extracted_resume_text: str
    predicted_category: Optional[str] = None
    basic_info_json: Optional[dict] = None


class ComprehensiveAnalysisResponse(BaseModel):
    analysis: Optional[ComprehensiveAnalysisData] = None
    error: Optional[str] = None


comprehensive_analysis_prompt_template_str = """\
You are an expert resume analyzer. Your task is to extract and structure information from the provided resume text to populate a JSON object conforming to the Pydantic models below.
The goal is to generate data that can be used to render a UI similar to the provided example.

Pydantic Models:
```python
from typing import List, Optional
from pydantic import BaseModel, Field

class SkillProficiency(BaseModel):
    skill_name: str
    percentage: int # e.g., 90 for 90%. Infer this based on experience, project mentions, and skill prominence. Max 5-7 skills.

class UIDetailedWorkExperienceEntry(BaseModel):
    role: str
    company_and_duration: str # Format as "Company Name | Start Year - End Year" or "Company Name | Start Year - Present"
    bullet_points: List[str] # Each bullet point as a separate string

class UIProjectEntry(BaseModel):
    title: str
    technologies_used: List[str] = Field(default_factory=list)
    description: str

class LanguageEntry(BaseModel):
    language: str # e.g., "English (Native)", "Spanish (Professional)"

class EducationEntry(BaseModel):
    education_detail: str # e.g., "Master's in Computer Science", "B.Tech in ECE - XYZ University"

class ComprehensiveAnalysisData(BaseModel):
    skills_analysis: List[SkillProficiency] = Field(default_factory=list)
    recommended_roles: List[str] = Field(default_factory=list) # Suggest 3-4 relevant roles based on skills and experience.
    languages: List[LanguageEntry] = Field(default_factory=list)
    education: List[EducationEntry] = Field(default_factory=list) # List all distinct education entries.
    work_experience: List[UIDetailedWorkExperienceEntry] = Field(default_factory=list) # List all significant work experiences.
    projects: List[UIProjectEntry] = Field(default_factory=list) # List all significant projects.
    name: Optional[str] = None
    email: Optional[str] = None
    contact: Optional[str] = None
    predicted_field: Optional[str] = None
```

Input:
- Raw Resume Text:
```text
{extracted_resume_text}
```
- Predicted Job Category (from previous analysis, if available, otherwise derive one):
```text
{predicted_category}
```
- Basic Extracted Info (Name, Email, Contact - use these if provided, otherwise extract):
```json
{basic_info_json}
```

Instructions:
1.  **Name, Email, Contact, Predicted Field**: Populate these from `basic_info_json` and `predicted_category`. If `basic_info_json` is minimal, extract name and email from `extracted_resume_text`. `predicted_field` should be derived if not provided.
2.  **Skills Analysis**:
    *   Identify the top 5-7 key technical and soft skills from the resume.
    *   For each skill, assign a proficiency `percentage` (0-100). Base this on frequency, context, project descriptions, and associated experience.
    *   If the resume is very sparse in skills, infer 1-2 common skills for the `predicted_category` using industry statistical averages (e.g., average top skills), and append `'(inferred)` to the `skill_name`.
3.  **Recommended Roles**:
    *   Based on the overall resume content, skills, and experience, suggest 3-4 suitable job titles.
4.  **Languages**:
    *   Extract languages spoken and their proficiency levels.
    *   If no languages are mentioned, infer the most common language for the role based on statistical prevalence (e.g., "English (Professional)"), appending `'(inferred)'`.
5.  **Education**:
    *   List educational qualifications.
    *   If education details are missing, infer a generic qualification based on typical requirements and statistical averages for the `predicted_category` (e.g., average degree level), appending `'(inferred)'`.
6.  **Work Experience**:
    *   For each significant work experience:
        *   Extract `role`.
        *   Combine `company` and `duration` into `company_and_duration`.
        *   List key responsibilities/achievements as `bullet_points`.
7.  **Projects**:
    *   For each project mentioned in the resume:
        *   Extract project `title`.
        *   Identify `technologies_used` as a list of technologies, frameworks, or tools used.
        *   Extract project `description` with key details about what was built/accomplished.
    *   If no projects are explicitly mentioned, infer 1-2 typical projects for the `predicted_category` and append `'(inferred)'` to the `title`.

8.  **General Inference Rule**: Prioritize direct extraction. When inferring missing fields, use statistical averages for the `predicted_category` and clearly mark all inferred values by appending `"(inferred)"`.

Output:
Return ONLY a single JSON object that would successfully instantiate `ComprehensiveAnalysisData(...)`. Ensure all fields are populated as accurately as possible. If a section is not present, use an empty list for list-based fields or null for optional fields.
"""


comprehensive_analysis_prompt = PromptTemplate(
    input_variables=[
        "extracted_resume_text",
        "predicted_category",
        "basic_info_json",
    ],
    template=comprehensive_analysis_prompt_template_str,
)


comprehensive_analysis_chain = None
if llm:
    comprehensive_analysis_chain = LLMChain(
        llm=llm,
        prompt=comprehensive_analysis_prompt,
    )


@router.post(
    "/comprehensive_analysis",
    response_model=ComprehensiveAnalysisResponse,
)
async def get_comprehensive_analysis(
    request_data: ComprehensiveAnalysisRequest,
):

    if not comprehensive_analysis_chain:
        raise HTTPException(
            status_code=503,
            detail="LLM for comprehensive analysis not available",
        )

    try:

        input_data = {
            "extracted_resume_text": request_data.extracted_resume_text,
            "predicted_category": request_data.predicted_category or "",
            "basic_info_json": request_data.basic_info_json or {},
        }
        result_json_str = await comprehensive_analysis_chain.arun(input_data)

        analysis_data = ComprehensiveAnalysisData.parse_raw(result_json_str)
        return ComprehensiveAnalysisResponse(
            analysis=analysis_data,
        )
        return ComprehensiveAnalysisResponse(
            analysis=ComprehensiveAnalysisData(
                name="Dummy Analysis",
            ),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during comprehensive analysis: {str(e)}",
        )

    return {
        "message": "Hiring assistant comprehensive analysis endpoint placeholder",
    }
