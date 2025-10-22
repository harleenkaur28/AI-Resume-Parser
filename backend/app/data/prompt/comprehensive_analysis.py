from langchain_core.prompts import PromptTemplate
from app.core.llm import llm


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
    live_link: Optional[str] = None
    repo_link: Optional[str] = None
    description: str

class UIPublicationEntry(BaseModel):
    title: str
    authors: Optional[str] = None
    journal_conference: Optional[str] = None
    year: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None

class UIPositionOfResponsibilityEntry(BaseModel):
    title: str
    organization: str
    duration: Optional[str] = None
    description: Optional[str] = None

class UICertificationEntry(BaseModel):
    name: str
    issuing_organization: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    url: Optional[str] = None

class UIAchievementEntry(BaseModel):
    title: str
    description: Optional[str] = None
    year: Optional[str] = None
    category: Optional[str] = None # e.g., "Academic", "Professional", "Competition", "Award"

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
    publications: List[UIPublicationEntry] = Field(default_factory=list) # List all research papers and publications.
    positions_of_responsibility: List[UIPositionOfResponsibilityEntry] = Field(default_factory=list) # List all co-curricular activities and leadership roles.
    certifications: List[UICertificationEntry] = Field(default_factory=list) # List all professional certifications.
    achievements: List[UIAchievementEntry] = Field(default_factory=list) # List all awards, honors, and achievements.
    name: Optional[str] = None
    email: Optional[str] = None
    contact: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    blog: Optional[str] = None
    portfolio: Optional[str] = Field(None, alias="personal_website, or any other link")
    predicted_field: Optional[str] = None
```

Input:
- Raw Resume Text:
```text
{extracted_resume_text}
```

Instructions:
1.  Extarct these fields accurately:
    - name
    - email
    - contact
    - linkedin
    - github
    - blog - (optional) if present else null
    - portfolio (personal_website, or any other link)
    - predicted_field: Based on the resume content, predict the most suitable job role or field for the candidate (e.g., "Data Scientist", "Frontend Developer", "Marketing Manager", etc.).
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
        *   Extract `live_link` and `repo_link` if available.
        *   Identify `technologies_used` as a list of technologies, frameworks, or tools used.
        *   Extract project `description` with key details about what was built/accomplished.
    *   If no projects are explicitly mentioned, infer 1-2 typical projects for the `predicted_category` and append `'(inferred)'` to the `title`.
8.  **Publications**:
    *   For each research paper, publication, or academic work mentioned:
        *   Extract publication `title`.
        *   Include `authors` if mentioned.
        *   Include `journal_conference` name if available.
        *   Include `year` of publication.
        *   Include `doi` or `url` if available.
    *   Look for research papers, journal articles, conference papers, book chapters, etc.
9.  **Positions of Responsibility**:
    *   For each leadership role, co-curricular activity, or position of responsibility:
        *   Extract `title` of the position.
        *   Include `organization` where the role was held.
        *   Include `duration` if mentioned.
        *   Include `description` of responsibilities if available.
    *   Look for student council positions, club leadership, event organization, etc.
10. **Certifications**:
    *   For each professional certification mentioned:
        *   Extract certification `name`.
        *   Include `issuing_organization`.
        *   Include `issue_date` and `expiry_date` if available.
        *   Include `credential_id` if available.
        *   Include `url` if available.
    *   Look for professional certifications, online courses, training programs, etc.
11. **Achievements**:
    *   For each award, honor, or achievement mentioned:
        *   Extract achievement `title`.
        *   Include `description` if available.
        *   Include `year` if mentioned.
        *   Categorize as `category` (Academic, Professional, Competition, Award, etc.).
    *   Look for academic awards, competition wins, honors, scholarships, etc.

12. **General Inference Rule**: Prioritize direct extraction. When inferring missing fields, use statistical averages for the `predicted_category` and clearly mark all inferred values by appending `"(inferred)"`.

Output:
Return ONLY a single JSON object that would successfully instantiate `ComprehensiveAnalysisData(...)`. Ensure all fields are populated as accurately as possible. If a section is not present, use an empty list for list-based fields or null for optional fields.
"""

comprehensive_analysis_prompt = PromptTemplate(
    input_variables=[
        "extracted_resume_text",
    ],
    template=comprehensive_analysis_prompt_template_str,
)

comprensive_analysis_chain = comprehensive_analysis_prompt | llm
