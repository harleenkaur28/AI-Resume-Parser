# /Users/taf/Projects/Resume Portal/backend/llm/prompts.py
from langchain.prompts import PromptTemplate
from schemas.common import (
    WorkExperienceEntry,
    ProjectEntry,
)  # Assuming common schemas are in schemas/
from schemas.resume import (
    ResumeAnalysisPrompt,
    ComprehensiveAnalysisData,
    TipsData,
)  # Assuming resume schemas

# Prompt for initial resume parsing and validation
prompt_template_str = """
You are a JSON‐validation assistant.
Your job is to read an arbitrary JSON object and transform it so that it conforms exactly to this Pydantic model:

```python
from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field

class WorkExperienceEntry(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None

class ProjectEntry(BaseModel):
    title: Optional[str] = None
    technologies_used: Optional[List[str]] = Field(default_factory=list)
    description: Optional[str] = None

class ResumeAnalysis(BaseModel): # This should be ResumeAnalysisPrompt for consistency
    name: str
    email: str
    contact: Optional[str] = None
    predicted_field: str
    college: Optional[str] = None
    work_experience: Optional[List[WorkExperienceEntry]] = Field(default_factory=list)
    projects: Optional[List[ProjectEntry]] = Field(default_factory=list)
    skills: List[str] = []
    upload_date: datetime = Field(default_factory=datetime.utcnow)
```

1.  Input

- JSON (raw):
  ```json
  {resume_json}
  ```
- Text Extract (raw):
  ```text
  {extracted_resume_text}
  ```

2.  Transformation & Validation Rules:

    - name: extract the actual person’s name (“TASHIF AHMAD KHAN”), discard tooling tags and contact info.
    - email: ensure a single valid RFC-5322 address (lowercase, no trailing text).
    - contact: normalize as a string, digits only or “+<country code><number>”.
    - predicted_field: keep as is.
    - college: trim trailing punctuation (no “-”). Just the college name or address, no other text.
    - work_experience: Extract relevant work experiences as a list of dictionaries, each conforming to `WorkExperienceEntry`. Populate `role`, `company`, `duration`, and `description` for each entry. Only include the most relevant text and have this section to be detailed. If two or more fields (role, company, duration, description) for a single work experience entry are null or cannot be reliably populated from the text, omit that entire entry from the list.
    - projects: Extract project details as a list of dictionaries, each conforming to `ProjectEntry`. Populate `title`, `technologies_used` (as a list of strings), and `description` for each entry. If two or more fields (title, technologies_used, description) for a single project entry are null or cannot be reliably populated, omit that entire entry from the list. For `technologies_used`, consider it unpopulated if the list would be empty.
    - skills: dedupe, normalize casing (e.g. all title-case), output as a JSON array of strings. Keep all the languages and framworks mensioned in skills only you may refer to the raw data.
    - upload_date: parse into ISO-8601 / RFC-3339 format.

3.  Output:
    – Return ONLY a JSON object (no commentary) that would successfully instantiate `ResumeAnalysis(...)`.
    – If any field fails validation, include an `"errors"` key mapping field names to error messages instead of the cleaned output.
    - Omit details in the fields and modify those based on the raw text also.

Now, process the raw JSON and emit the cleaned, validated JSON.
"""

langchain_prompt = PromptTemplate(
    input_variables=["resume_json", "extracted_resume_text"],
    template=prompt_template_str,
    # Ensure the Pydantic model used in the prompt string matches ResumeAnalysisPrompt
    # This might require adjusting the prompt string or the model name if they differ.
)

# Prompt for comprehensive UI analysis
comprehensive_analysis_prompt_template_str = """
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
    *   If the resume is very sparse in skills, infer 1-2 common skills for the `predicted_category` using industry statistical averages (e.g., average top skills), and append `'(inferred)'` to the `skill_name`.
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
    input_variables=["extracted_resume_text", "predicted_category", "basic_info_json"],
    template=comprehensive_analysis_prompt_template_str,
)

# Prompt for generating tips
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
