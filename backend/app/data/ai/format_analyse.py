from langchain.prompts import PromptTemplate
from app.core.llm import llm


format_analyse_prompt_template_str = """
You are an expert resume text-processing and analysis assistant.

Phase 1 – CLEAN & FORMAT  
The following text was extracted from a resume file. It may contain:
- Broken lines, inconsistent spacing, or duplicated words  
- Unnecessary artifacts (page numbers, headers/footers, tool watermarks)  
- Jumbled ordering of sections  

Your first task is to transform it into a professional, well-structured plain-text resume.

Guidelines:
1. Preserve every substantive detail (contact info, summary, experience, education, skills, projects, certifications, etc.).  
2. Re-organize logically under clear section headings (e.g., “Contact Information”, “Professional Summary”, “Experience”, “Education”, “Skills”, “Projects”).  
3. Use consistent spacing and bullet points.  
4. Remove obvious non-content artifacts (e.g., “Page 1 of 2”, extraction tool names).  
5. Keep wording concise but do not omit information.  
6. Output MUST be plain text only – no markdown, no code fences, no commentary.

Phase 2 – STRUCTURE AS JSON  
After cleaning, extract information from the cleaned text and populate the Pydantic models below.

Pydantic Models
```python
from typing import List, Optional
from pydantic import BaseModel, Field

class SkillProficiency(BaseModel):
    skill_name: str
    percentage: int           # 0-100, based on prominence, depth, and recency

class UIDetailedWorkExperienceEntry(BaseModel):
    role: str
    company_and_duration: str # Format “Company Name | Start Year – End Year” or “Company Name | Start Year – Present”
    bullet_points: List[str] # Each bullet point as a separate string

class UIProjectEntry(BaseModel):
    title: str
    technologies_used: List[str] = Field(default_factory=list)
    description: str

class LanguageEntry(BaseModel):
    language: str             # e.g., “English (Native)”, “Spanish (Professional)”

class EducationEntry(BaseModel):
    education_detail: str     # e.g., “M.S. in Computer Science”, “B.Tech in ECE – XYZ University”

class ComprehensiveAnalysisData(BaseModel):
    skills_analysis: List[SkillProficiency] = Field(default_factory=list)
    recommended_roles: List[str] = Field(default_factory=list)  # Suggest 3-4 relevant roles based on skills and experience.
    languages: List[LanguageEntry] = Field(default_factory=list)
    education: List[EducationEntry] = Field(default_factory=list) # List all distinct education entries.
    work_experience: List[UIDetailedWorkExperienceEntry] = Field(default_factory=list) # List all significant work experiences.
    projects: List[UIProjectEntry] = Field(default_factory=list) # List all significant projects.
    name: Optional[str] = None
    email: Optional[str] = None
    contact: Optional[str] = None
    predicted_field: Optional[str] = None  # MUST be inferred from the resume
```

Input:
- Raw Resume Text:
```text
{extracted_resume_text}
```
- Basic Extracted Info (Name, Email, Contact – use these if provided, otherwise extract):
```json
{basic_info_json}
```

Instructions:
1. Name, Email, Contact: Populate from `basic_info_json`; if missing, extract from `extracted_resume_text`.
2. Predicted Field:
   - Examine the resume’s skills, projects, job titles, and domain-specific keywords.
   - Infer the candidate’s primary professional field (e.g., “Software Engineering”, “Data Science”, “Mechanical Engineering”, “Digital Marketing”, “Finance”, “Product Management”, etc.).
   - If the field is ambiguous, choose the closest match and append “(inferred)”.
3. Skills Analysis:
   - Identify the top 5-7 key technical and/or soft skills.
   - Assign `percentage` (0-100) based on frequency, context, and depth.
   - If the resume lists very few skills, infer common ones for the predicted field and tag with “(inferred)”.
4. Recommended Roles:
   - Suggest 3-4 job titles aligned with the inferred field, skills, and experience level.
5. Languages:
   - Extract all languages and proficiency levels.
   - If none are provided, add “English (Professional) (inferred)”.
6. Education:
   - List each distinct qualification.
   - If absent, infer a typical qualification for the predicted field and tag “(inferred)”.
7. Work Experience:
   - For every significant experience, populate `role`, `company_and_duration`, and 2-5 concise bullet points.
8. Projects:
   - For each project, extract `title`, `technologies_used`, and `description`.
   - If no projects are mentioned, create 1-2 typical projects for the predicted field and mark “(inferred)”.
9. General Inference Rule:
   - Always prefer direct extraction.
   - Any inferred value must have “(inferred)” appended.
10. Output:
   - Return ONLY a single JSON object that successfully instantiates `ComprehensiveAnalysisData(...)`.
   - Use empty lists for missing list-type data and null for optional scalars when truly unavailable.
"""


format_analyse_prompt = PromptTemplate(
    input_variables=[
        "extracted_resume_text",
        "basic_info_json",
    ],
    template=format_analyse_prompt_template_str,
)

format_analyse_chain = format_analyse_prompt | llm
