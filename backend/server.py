from fastapi import (
    FastAPI,
    File,
    UploadFile,
    HTTPException,
    Query,
    Form,
    APIRouter,
)
from fastapi.middleware.cors import CORSMiddleware

import json
from pydantic import BaseModel, Field
import zipfile
import pickle
import re
import requests
import spacy
import nltk
from nltk.corpus import stopwords

from PyPDF2 import PdfReader
import os
from typing import (
    List,
    Optional,
    Dict,
)

import io
from datetime import datetime, timezone
import uvicorn
from docx import Document

from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    GoogleGenerativeAI,
)
from langchain.prompts import PromptTemplate

from pydantic import (
    BaseModel,
    Field,
    ValidationError,
)

from dotenv import load_dotenv

load_dotenv()


app = FastAPI(
    title="Resume Analysis API",
    description="API for analyzing resumes, extracting structured data, and providing tips for improvement.",
    version="1.4.3",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


llm = None
try:
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key:
        print(
            "Warning: GOOGLE_API_KEY not found in .env. LLM functionality will be disabled."
        )
    else:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=google_api_key,
            temperature=0.1,
        )

except Exception as e:
    print(
        f"Error initializing Google Generative AI: {e}. LLM functionality will be disabled."
    )


class WorkExperienceEntry(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None


class ProjectEntry(BaseModel):
    title: Optional[str] = None
    technologies_used: Optional[List[str]] = Field(default_factory=list)
    description: Optional[str] = None


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

class ResumeAnalysis(BaseModel):
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
    input_variables=[
        "resume_json",
        "extracted_resume_text",
    ],
    template=prompt_template_str,
)


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


class ComprehensiveAnalysisResponse(BaseModel):
    success: bool = True
    message: str = "Comprehensive analysis successful"
    data: ComprehensiveAnalysisData


class Tip(BaseModel):
    category: str
    advice: str


class TipsData(BaseModel):
    resume_tips: List[Tip] = Field(default_factory=list)
    interview_tips: List[Tip] = Field(default_factory=list)


class TipsResponse(BaseModel):
    success: bool = True
    message: str = "Tips retrieved successfully"
    data: TipsData


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
    input_variables=[
        "extracted_resume_text",
        "predicted_category",
        "basic_info_json",
    ],
    template=comprehensive_analysis_prompt_template_str,
)

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


comprehensive_analysis_prompt = PromptTemplate(
    input_variables=[
        "extracted_resume_text",
        "predicted_category",
        "basic_info_json",
    ],
    template=comprehensive_analysis_prompt_template_str,
)


comprehensive_analysis_prompt_template_str_v2 = """
You are an expert resume analyzer. Your task is to extract and structure information from the provided resume text to populate a JSON object conforming to the Pydantic models below. The goal is to generate data that can be used to render a UI similar to the provided example.

Pydantic Models:
```python
from typing import List, Optional
from pydantic import BaseModel, Field

class SkillProficiency(BaseModel):
    skill_name: str
    percentage: int  # e.g., 90 for 90 %. Infer this based on experience, project mentions, and skill prominence. Max 5-7 skills.

class UIDetailedWorkExperienceEntry(BaseModel):
    role: str
    company_and_duration: str  # Format “Company Name | Start Year – End Year” or “Company Name | Start Year – Present”
    bullet_points: List[str] # Each bullet point as a separate string

class UIProjectEntry(BaseModel):
    title: str
    technologies_used: List[str] = Field(default_factory=list)
    description: str

class LanguageEntry(BaseModel):
    language: str  # e.g., “English (Native)”, “Spanish (Professional)”

class EducationEntry(BaseModel):
    education_detail: str  # e.g., “M.S. in Computer Science”, “B.Tech in ECE – XYZ University”

class ComprehensiveAnalysisData(BaseModel):
    skills_analysis: List[SkillProficiency] = Field(default_factory=list)
    recommended_roles: List[str] = Field(default_factory=list)  # Suggest 3-4 relevant roles based on skills and experience.
    languages: List[LanguageEntry] = Field(default_factory=list)
    education: List[EducationEntry] = Field(default_factory=list)
    work_experience: List[UIDetailedWorkExperienceEntry] = Field(default_factory=list)
    projects: List[UIProjectEntry] = Field(default_factory=list)
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


comprehensive_analysis_prompt_v2 = PromptTemplate(
    input_variables=[
        "extracted_resume_text",
        "basic_info_json",
    ],
    template=comprehensive_analysis_prompt_template_str_v2,
)


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
    company_and_duration: str # “Company | YYYY-YYYY” or “Company | YYYY-Present”
    bullet_points: List[str]

class UIProjectEntry(BaseModel):
    title: str
    technologies_used: List[str] = Field(default_factory=list)
    description: str

class LanguageEntry(BaseModel):
    language: str             # e.g., “English (Native)”

class EducationEntry(BaseModel):
    education_detail: str     # e.g., “B.Tech in ECE – XYZ University”

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
    predicted_field: Optional[str] = None   # MUST be inferred from resume content
```

Input
- Raw Resume Text (messy):
```
{raw_resume_text}
```
- Basic Extracted Info (may be empty):
```json
{basic_info_json}
```

Instructions
1. Produce a cleaned, well-structured resume (“cleaned_text”) per Phase 1 guidelines.  
2. From the cleaned text:
   - Populate name, email, and contact (use basic_info_json if present, else extract).  
   - Infer predicted_field (e.g., “Software Engineering”, “Digital Marketing”). If ambiguous, choose the closest match and append “(inferred)”.  
   - Build skills_analysis (5-7 key skills, each with proficiency percentage). If skills are sparse, infer common skills and tag with “(inferred)”.  
   - Suggest 3-4 recommended_roles that fit the candidate’s background.  
   - Extract languages spoken; if none, add “English (Professional) (inferred)”.  
   - List education; if none, infer a typical qualification and tag “(inferred)”.  
   - Detail each significant work experience (role, company_and_duration, 2-5 bullets).  
   - List projects (title, technologies_used, description); if absent, infer 1-2 typical projects and tag “(inferred)”.  
3. Apply the general inference rule: prefer direct extraction, mark every inferred value with “(inferred)”.  
4. OUTPUT: Return ONLY one JSON object with exactly these two top-level keys:

{
  "cleaned_text": "<the full cleaned resume as plain text>",
  "analysis": { …Contents that instantiate ComprehensiveAnalysisData… }
}

Do not add any other keys, commentary, markdown, or code fences.
"""

format_analyse_prompt = PromptTemplate(
    input_variables=[
        "raw_resume_text",
        "basic_info_json",
    ],
    template=format_analyse_prompt_template_str,
)

# DATABASE_URL = os.getenv(
#     "DATABASE_URL", "postgresql://user:password@localhost:5432/resume_db_pg"
# )
# pool: Optional[asyncpg.Pool] = None


# async def connect_to_db():
#     global pool
#     pool = await asyncpg.create_pool(DATABASE_URL)
#     async with pool.acquire() as connection:
#         # Create skills table
#         await connection.execute(
#             """
#             CREATE TABLE IF NOT EXISTS skills (
#                 id SERIAL PRIMARY KEY,
#                 skills_data JSONB NOT NULL
#             );
#         """
#         )
#         # Create resumes table
#         await connection.execute(
#             """
#             CREATE TABLE IF NOT EXISTS resumes (
#                 id SERIAL PRIMARY KEY,
#                 name TEXT NOT NULL,
#                 email TEXT NOT NULL,
#                 contact TEXT,
#                 predicted_field TEXT NOT NULL,
#                 college TEXT,
#                 work_experience TEXT,
#                 skills TEXT[],
#                 upload_date TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
#             );
#         """
#         )


# async def close_db_connection():
#     global pool
#     if pool:
#         await pool.close()


# v1_router.add_event_handler(
#     "startup",
#     connect_to_db,
# )
# v1_router.add_event_handler(
#     "startup",
#     lambda: init_skills_pg(),
# )
# v1_router.add_event_handler(
#     "shutdown",
#     close_db_connection,
# )


NLTK_DATA_PATH = os.path.join(
    os.path.dirname(__file__),
    "model",
    "nltk_data",
)

if not os.path.exists(NLTK_DATA_PATH):
    os.makedirs(NLTK_DATA_PATH)

nltk.data.path.append(NLTK_DATA_PATH)


# async def init_skills_pg():
#     global pool
#     if not pool:
#         # This might happen if called before pool is initialized, ensure connect_to_db runs first
#         # Or handle by acquiring a new connection if pool is not ready, though startup events should manage order.
#         # For simplicity, assuming pool is ready from connect_to_db.
#         await connect_to_db()

#     async with pool.acquire() as connection:
#         count = await connection.fetchval("SELECT COUNT(*) FROM skills;")
#         if count == 0:
#             # Store skills_list as a JSON array in a single row
#             await connection.execute(
#                 "INSERT INTO skills (skills_data) VALUES ($1);",
#                 json.dumps(skills_list),
#             )


# async def get_skills_list_pg():
#     global pool
#     async with pool.acquire() as connection:
#         skills_json = await connection.fetchval(
#             "SELECT skills_data FROM skills LIMIT 1;"
#         )
#         if skills_json:
#             return json.loads(skills_json)
#     return []


nlp = spacy.load("en_core_web_sm")
nltk.download(
    "punkt",
    download_dir=NLTK_DATA_PATH,
)
nltk.download(
    "stopwords",
    download_dir=NLTK_DATA_PATH,
)
stop_words = set(stopwords.words("english"))


clf = pickle.load(
    open(
        os.path.join(
            os.path.dirname(__file__),
            "model",
            "best_model.pkl",
        ),
        "rb",
    )
)
tfidf_vectorizer = pickle.load(
    open(
        os.path.join(
            os.path.dirname(__file__),
            "model",
            "tfidf.pkl",
        ),
        "rb",
    )
)


def clean_resume(txt):
    """Clean the resume text by removing unwanted characters and lemmatizing."""
    cleantxt = re.sub(r"https\\S+", "", txt)
    cleantxt = re.sub(r"@\\S+|#\\S+", "", cleantxt)
    cleantxt = re.sub(r"[^\w\s]", "", cleantxt)

    doc = nlp(cleantxt)
    tokens = [
        token.lemma_.lower() for token in doc if token.text.lower() not in stop_words
    ]

    return " ".join(tokens)


def extract_text_from_pdf(uploaded_file):
    """Extract text from a PDF file."""

    pdf_reader = PdfReader(uploaded_file)
    text = ""

    for page in pdf_reader.pages:
        text += page.extract_text() or ""

    return text


def process_document(file_bytes, file_name):
    """Extracts text from uploaded TXT, MD, PDF, or DOCX file."""
    file_extension = os.path.splitext(file_name)[1].lower()
    raw_text = ""
    try:
        if file_extension == ".txt" or file_extension == ".md":
            raw_text = file_bytes.decode()

        elif file_extension == ".pdf":
            pdf_reader = PdfReader(io.BytesIO(file_bytes))
            for page in pdf_reader.pages:
                raw_text += page.extract_text() or ""

        elif file_extension == ".docx":
            doc = Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                raw_text += para.text + "\\n"

        else:
            print(
                f"Unsupported file type: {file_extension}. Please upload TXT, MD, PDF, or DOCX."
            )
            return None

    except Exception as e:
        print(f"Error processing file {file_name}: {e}")
        return None

    return raw_text


def format_resume_text_with_llm(
    raw_text,
    model_provider="Google",
    model_name="gemini-2.0-flash",
    api_keys_dict={
        "Google": google_api_key,
    },
):
    """Formats the extracted resume text using an LLM."""

    if not raw_text.strip():
        return ""

    llm = None

    try:
        if model_provider == "Google":
            if not api_keys_dict.get("Google"):
                raise ValueError("Google API Key not provided for resume formatting.")

            llm = GoogleGenerativeAI(
                model=model_name,
                temperature=0.1,
                google_api_key=api_keys_dict["Google"],
            )
            # elif model_provider == "OpenAI":
            #     if not api_keys_dict.get("OpenAI"):
            #         raise ValueError("OpenAI API Key not provided for resume formatting.")
            #     llm = ChatOpenAI(
            #         model_name=model_name,
            #         temperature=0.1,
            #         openai_api_key=api_keys_dict["OpenAI"],
            #     )
            # elif model_provider == "Claude":
            #     if not api_keys_dict.get("Claude"):
            #         raise ValueError(
            #             "Anthropic API Key not provided for resume formatting."
            #         )
            #     llm = ChatAnthropic(
            #         model=model_name,
            #         temperature=0.1,
            #         anthropic_api_key=api_keys_dict["Claude"],
            #     )
        else:
            raise ValueError(
                f"Unsupported model provider for resume formatting: {model_provider}"
            )

        template = """
        You are an expert resume text processing assistant.
        The following text was extracted from a resume file. It may contain:
        - Formatting errors (e.g., inconsistent spacing, broken lines)
        - Unnecessary characters or artifacts from the extraction process (e.g., page numbers, headers/footers not part of content)
        - Poor structure or illogical flow of information.

        Your task is to meticulously clean and reformat this text into a professional, clear, and well-structured resume format.

        Key objectives:
        1.  **Preserve all key information**: Ensure that all substantive content related to experience, education, skills, projects, contact information, and other relevant resume sections is retained.
        2.  **Logical Presentation**: Organize the information logically. Common resume sections (e.g., Contact Info, Summary/Objective, Experience, Education, Skills, Projects) should be clearly delineated if present in the original text. Use consistent formatting for headings and bullet points.
        3.  **Clarity and Readability**: Improve readability by correcting formatting issues, ensuring consistent spacing, and using clear language.
        4.  **Remove Artifacts**: Eliminate any text or characters that are clearly not part of the resume's content (e.g., "Page 1 of 2", file paths, extraction tool watermarks).
        5.  **Conciseness**: While preserving all information, aim for concise phrasing where appropriate, without altering the meaning.
        6.  **Plain Text Output**: The output should be ONLY the cleaned and formatted resume text, suitable for further processing or display. Do not include any of your own commentary, preamble, or markdown formatting like ```.

        ---
        Raw Resume Text:
        ```
        {raw_resume_text}
        ```
        ---
        Cleaned and Formatted Resume Text (plain text only):
        """
        prompt = PromptTemplate(
            input_variables=["raw_resume_text"],
            template=template,
        )

        chain = prompt | llm
        result = chain.invoke({"raw_resume_text": raw_text})
        formatted_text = (
            result if isinstance(result, str) else getattr(result, "content", "")
        )
        return formatted_text.strip()

    except ValueError as ve:
        error_msg = str(ve)
        provider_help = {
            "Google": "Verify your Google API key at https://aistudio.google.com/app/apikey",
            "OpenAI": "Verify your OpenAI API key at https://platform.openai.com/api-keys",
            "Claude": "Verify your Anthropic API key at https://console.anthropic.com/",
        }
        return raw_text

    except Exception as e:
        error_msg = f"Error formatting resume text: {str(e)}"

        if "rate limit" in str(e).lower():
            error_msg += "\n💡 You may have hit API rate limits. Using original text."

        elif "authentication" in str(e).lower() or "unauthorized" in str(e).lower():
            error_msg += "\n💡 API authentication issue. Using original text."

        return raw_text


def is_valid_resume(text):
    """Check if the PDF is a valid resume based on text content."""

    if not text:
        return False

    resume_keywords = [
        "Experience",
        "Education",
        "Skills",
        "Profile",
        "Work History",
        "Projects",
        "Certifications",
    ]

    if any(re.search(keyword, text, re.I) for keyword in resume_keywords):
        return True

    return False


def extract_name_and_email(text):
    """Extract the name and email from the resume text."""
    email_regex = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    emails = re.findall(email_regex, text)

    lines = text.splitlines()
    name = lines[0].strip() if lines else "N/A"
    email = emails[0] if emails else "N/A"

    return name, email


def extract_contact_number_from_resume(text):
    contact_number = None

    pattern = r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"
    match = re.search(pattern, text)
    if match:
        contact_number = match.group()

    return contact_number


def extract_college_name(text):
    lines = text.split("\n")
    college_pattern = r"(?i).*(college|university|institute).*"
    for line in lines:
        if re.match(college_pattern, line):
            college_name = line.strip()
            max_length = 128
            return college_name[:max_length]
    return ""


def extract_education_info(text):
    pattern = r"(?i)(?:(?:Bachelor|B\.S\.|B\.A\.|Master|M\.S\.|M\.A\.|Ph\.D\.)\s(?:[A-Za-z]+\s)*[A-Za-z]+)"
    matches = re.findall(pattern, text)

    education = [match.strip() for match in matches]
    education_text = ", ".join(education) if education else " "

    return education_text


def extract_work_experience(text: str) -> List[str]:
    """Extract work experience from the resume text as a list of strings."""
    work_experience_keywords = [
        r"\b(intern|manager|developer|engineer|analyst|lead|consultant|specialist|director|officer|administrator|associate|scientist|technician|programmer|designer|researcher|trainee|staff)\b",
        r"\b(Senior|Junior|Lead|Principal|Entry|Mid-level|Experienced)\s+\w+\b",
    ]
    pattern = re.compile("|".join(work_experience_keywords), re.IGNORECASE)

    work_experience_info = []
    for line in text.splitlines():
        if pattern.search(line):
            work_experience_info.append(line.strip())

    return work_experience_info if work_experience_info else []


def extract_projects(text: str) -> List[str]:
    """Extract project information from the resume text as a list of strings."""
    projects_info = []
    in_project_section = False
    project_section_keywords = [
        "PROJECTS",
        "PERSONAL PROJECTS",
        "ACADEMIC PROJECTS",
        "PROJECT EXPERIENCE",
    ]
    section_end_keywords = [
        "EXPERIENCE",
        "EDUCATION",
        "SKILLS",
        "CERTIFICATIONS",
        "AWARDS",
    ]

    lines = text.splitlines()
    for line in lines:
        stripped_line = line.strip()
        if not stripped_line:
            continue

        is_project_header = any(
            re.search(r"\b" + keyword + r"\b", stripped_line, re.IGNORECASE)
            for keyword in project_section_keywords
        )
        is_section_ender = any(
            re.search(r"\b" + keyword + r"\b", stripped_line, re.IGNORECASE)
            for keyword in section_end_keywords
        )

        if is_project_header:
            in_project_section = True

            continue

        if in_project_section:
            if is_section_ender and not is_project_header:
                in_project_section = False
                break
            projects_info.append(stripped_line)

    if not projects_info:
        project_line_keywords = [
            "developed",
            "implemented",
            "created",
            "designed",
            "project on",
            "built a",
            "application for",
        ]
        for line in lines:
            if any(keyword in line.lower() for keyword in project_line_keywords):

                if len(line.strip()) > 20:
                    projects_info.append(line.strip())
                    if len(projects_info) >= 10:
                        break
    return projects_info


def extract_skills_from_resume(text, skills_list):
    skills = []

    for skill in skills_list:
        pattern = r"\b{}\b".format(re.escape(skill))
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            skills.append(skill)

    return skills


def predict_category(cleaned_resume):
    """Predict the category of the cleaned resume text."""
    input_features = tfidf_vectorizer.transform([cleaned_resume])
    prediction_id = clf.predict(input_features)[0]

    category_mapping = {
        15: "Java Developer",
        23: "Testing",
        8: "DevOps Engineer",
        20: "Python Developer",
        24: "Web Designing",
        12: "HR",
        13: "Hadoop",
        3: "Blockchain",
        10: "ETL Developer",
        18: "Operations Manager",
        6: "Data Science",
        22: "Sales",
        16: "Mechanical Engineer",
        1: "Arts",
        7: "Database",
        11: "Electrical Engineering",
        14: "Health and fitness",
        19: "PMO",
        4: "Business Analyst",
        9: "DotNet Developer",
        2: "Automation Testing",
        17: "Network Security Engineer",
        21: "SAP Developer",
        5: "Civil Engineer",
        0: "Advocate",
    }

    return category_mapping.get(prediction_id, "Unknown")


def extract_files_from_zip(zip_file_path):

    extract_to_dir = os.path.join(
        __file__,
        "uploads",
        "extracted_files",
    )
    os.makedirs(extract_to_dir, exist_ok=True)
    extracted_files = []

    try:
        with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
            zip_ref.extractall(extract_to_dir)
            for file in zip_ref.namelist():

                if "__MACOSX" in file or file.endswith("/"):
                    continue

                full_path = os.path.join(extract_to_dir, file)

                if os.path.isfile(full_path):
                    print(f"Processing file: {full_path}")
                    extracted_files.append(full_path)

    except zipfile.BadZipFile:
        print("Error: Invalid ZIP file.")

    except Exception as e:
        print(f"Unexpected error: {e}")

    return extracted_files


def get_company_research(company_name: str, url: str) -> str:
    """Gets basic company research information."""
    try:
        if not url or not url.startswith(("http://", "https://")):
            return f"Research about {company_name}: Invalid or no URL provided for company research."

        response = requests.get("https://r.jina.ai/" + url, timeout=10)
        response.raise_for_status()

        if not response.text.strip():
            return (
                f"Research about {company_name}: No content found at the provided URL."
            )

        max_research_length = 20_000
        research_text = response.text.strip()
        if len(research_text) > max_research_length:
            research_text = research_text[:max_research_length] + "..."

        if not company_name.strip():
            return f"The website content: {research_text}"

        return f"Research about {company_name}: {research_text}"

    except requests.exceptions.RequestException as e:
        return f"Research about {company_name}: Error fetching data from URL: {e}"

    except Exception as e:
        return f"Research about {company_name}: An unexpected error occurred during company research: {e}"


cold_mail_prompt_template_str = """
You are an expert career advisor and professional communication assistant.
Your task is to draft a compelling, personalized, and concise cold email based
on the provided information, following the style and structure of this fictional example:


My name is Priya Desai, and I’m in my final year of B.Tech in Software Engineering at 
IIT Bombay. I have a deep interest in cybersecurity and cloud computing—particularly in 
autonomous intrusion detection and secure DevOps pipelines. Given SecureCloud Inc.’s 
lead in developing self-healing network security solutions, I’m reaching out to express 
my interest in contributing as a Security Engineering Intern.
Previously, I interned at Google Cloud as a Security Analyst Intern, where I focused on 
vulnerability assessment, incident response simulations, and automating security audits. 
I’m also co-authoring a research paper on threat modeling for containerized environments, 
currently under peer review. My personal projects include an open-source real-time anomaly
detection tool built with Python, Flask, Docker, and Kubernetes. I’m proficient in Python, 
Go, and familiar with AWS, Azure, Terraform, and security frameworks like MITRE ATT&CK. 
With this tech stack and my theoretical background, I am confident in my ability to 
quickly adapt to your workflows and contribute meaningfully to your security initiatives.
As an aspiring security professional, I’m eager to learn from experienced engineers and 
grow within a pioneering organization like SecureCloud Inc. I’ve attached my resume for 
your review—please let me know if you need any further information.
Thank you for your time and consideration.

**Candidate's Resume (Markdown):**
```
{resume_text}
```

**Email Details:**
- Recipient Name: {recipient_name}
- Recipient Designation: {recipient_designation}
- Company Name: {company_name}
- Sender Name: {sender_name}
- Sender Goal/Role: {sender_role_or_goal}
- Key Points to Highlight:
  {key_points_to_include}
- Additional Context/Notes:
  {additional_info_for_llm}
- Company Research Insights (if any):
  {company_research}

Instructions for Email Generation:

1. Subject Line (8–12 words):
   • Clear, concise, and engaging.
   • Reflects your role/goal, name, and company.
   • Example: "Security Intern Candidate | Priya Desai – Joining SecureCloud"

2. Email Body (180–220 words):
   a. Salutation:
      • "Dear Mr./Ms. [Last Name],"" or "Dear [Full Name],"
   b. Paragraph 1 – Introduction:
      • State who you are, your current status/study, and your goal.
      • Mention why you chose *this* recipient/company.
   c. Paragraph 2 – Relevant Experience & Skills:
      • Highlight 2–3 achievements or projects from the resume.
      • Include internship, research, publications, personal projects.
      • Cite specific technologies or frameworks.
   d. Paragraph 3 – Fit & Value:
      • Connect your skills/interests to the company’s work or values.
      • Refer to any {company_research} details.
   e. Paragraph 4 – Call to Action & Closing:
      • Request consideration for internship/opportunity or a short chat.
      • Offer to share more details or schedule a call.
      • Thank them for their time.
   f. Signature:
      • "Sincerely," or "Best regards,"
      • {sender_name}
      • Optionally: contact info or “Resume attached.”

3. Tone & Style:
   • Professional, respectful, enthusiastic.
   • Concise paragraphs, varied sentence structure.
   • Mirror the example’s clarity and flow.
   • Avoid jargon overload; focus on impact and fit.

4. Formatting:
   • Short subject line.
   • 4 paragraphs max.
   • Mention attachment: "I’ve attached my resume for reference."

**Output:**
Return only a JSON object with "subject" and "body" keys:
```json
{{
  "subject": "Generated Subject Line",
  "body": "Generated Email Body..."
}}
```
"""

cold_mail_prompt = PromptTemplate(
    input_variables=[
        "resume_text",
        "recipient_name",
        "recipient_designation",
        "company_name",
        "sender_name",
        "sender_role_or_goal",
        "key_points_to_include",
        "additional_info_for_llm",
        "company_research",
    ],
    template=cold_mail_prompt_template_str,
)


def generate_cold_mail_content(
    resume_text: str,
    recipient_name: str,
    recipient_designation: str,
    company_name: str,
    sender_name: str,
    sender_role_or_goal: str,
    key_points_to_include: str,
    additional_info_for_llm: str,
    company_research: str,
    model_provider="Google",
    model_name="gemini-2.0-flash",
    api_keys_dict={"Google": google_api_key},
):
    """Generates cold email content using LLM."""
    if not llm:
        raise ValueError("LLM service is not available or not initialized.")

    current_llm = llm
    if not current_llm:
        try:
            if model_provider == "Google":
                if not api_keys_dict.get("Google"):
                    raise ValueError("Google API Key not provided.")
                current_llm = ChatGoogleGenerativeAI(
                    model=model_name,
                    temperature=0.4,
                    google_api_key=api_keys_dict["Google"],
                )
            else:
                raise ValueError(f"Unsupported model provider: {model_provider}")

        except Exception as e:
            raise ValueError(f"Error initializing LLM for cold mail: {e}")

    formatted_prompt_str = cold_mail_prompt.format(
        resume_text=resume_text,
        recipient_name=recipient_name,
        recipient_designation=recipient_designation,
        company_name=company_name,
        sender_name=sender_name,
        sender_role_or_goal=sender_role_or_goal,
        key_points_to_include=key_points_to_include,
        additional_info_for_llm=additional_info_for_llm,
        company_research=company_research,
    )

    try:
        response = current_llm.invoke(formatted_prompt_str)
        response_content = (
            response.content if hasattr(response, "content") else str(response)
        )

        if response_content.strip().startswith("```json"):
            response_content = response_content.strip()[7:]

        if response_content.strip().endswith("```"):
            response_content = response_content.strip()[:-3]

        email_data = json.loads(response_content)
        if (
            not isinstance(email_data, dict)
            or "subject" not in email_data
            or "body" not in email_data
        ):
            raise ValueError(
                "LLM did not return the expected JSON structure with 'subject' and 'body'."
            )
        return email_data

    except json.JSONDecodeError:
        print(f"LLM output (cold mail) was not valid JSON: {response_content}")

        return {
            "subject": "Error: Could not parse LLM response",
            "body": "Failed to generate email content due to parsing error. Raw LLM output: "
            + response_content[:500]
            + "...",
        }

    except Exception as e:
        print(f"Error during LLM invocation for cold mail: {e}")
        raise


skills_list = [
    "Java",
    "Spring Boot",
    "J2EE",
    "Hibernate",
    "Microservices",
    "RESTful APIs",
    "Git",
    "Maven",
    "JUnit",
    "Manual Testing",
    "Automation Testing",
    "Selenium",
    "JIRA",
    "Postman",
    "TestNG",
    "LoadRunner",
    "API Testing",
    "AWS",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Jenkins",
    "Ansible",
    "Terraform",
    "Linux",
    "Python",
    "Django",
    "Flask",
    "Pandas",
    "NumPy",
    "Machine Learning",
    "APIs",
    "SQL",
    "HTML",
    "CSS",
    "JavaScript",
    "Responsive Design",
    "UI/UX",
    "Adobe XD",
    "Figma",
    "Bootstrap",
    "React",
    "jQuery",
    "Recruitment",
    "Employee Relations",
    "Payroll",
    "HR Policies",
    "Performance Management",
    "Training & Development",
    "Onboarding",
    "Hadoop",
    "MapReduce",
    "Hive",
    "Pig",
    "HDFS",
    "Big Data",
    "Spark",
    "YARN",
    "HBase",
    "Blockchain",
    "Ethereum",
    "Smart Contracts",
    "Solidity",
    "Cryptography",
    "Decentralized Apps",
    "Hyperledger",
    "ETL",
    "Informatica",
    "Data Warehousing",
    "Data Modeling",
    "SSIS",
    "Data Integration",
    "Oracle",
    "Project Management",
    "Operations",
    "Lean Management",
    "Supply Chain",
    "Six Sigma",
    "Process Improvement",
    "Leadership",
    "Data Visualization",
    "Scikit-Learn",
    "Statistics",
    "Sales Strategy",
    "Negotiation",
    "CRM",
    "Lead Generation",
    "Customer Service",
    "Cold Calling",
    "Presentation Skills",
    "CAD",
    "SolidWorks",
    "Thermodynamics",
    "Mechanics",
    "Manufacturing",
    "Material Science",
    "Creative Thinking",
    "Visual Arts",
    "Adobe Photoshop",
    "Illustration",
    "Graphic Design",
    "Painting",
    "Sculpture",
    "Database Management",
    "SQL Server",
    "MongoDB",
    "Oracle DB",
    "Database Design",
    "Electrical Circuit Design",
    "Power Systems",
    "Control Systems",
    "Electrical Safety",
    "PLC Programming",
    "Health and Wellness",
    "Nutrition",
    "Exercise Science",
    "Personal Training",
    "Physical Therapy",
    "Project Management Office",
    "Portfolio Management",
    "Stakeholder Management",
    "Risk Assessment",
    "Data Analysis",
    "Excel",
    "Business Intelligence",
    "Tableau",
    "Power BI",
    "C#",
    ".NET Framework",
    "ASP.NET",
    "MVC",
    "Entity Framework",
    "LINQ",
    "WPF",
    "Test Automation",
    "Scripting",
    "Load Testing",
    "UFT",
    "Quality Assurance",
    "Network Security",
    "Cybersecurity",
    "Firewalls",
    "VPN",
    "Intrusion Detection",
    "Risk Management",
    "SAP ERP",
    "SAP HANA",
    "SAP MM",
    "SAP SD",
    "SAP FICO",
    "Civil Engineer",
    "Structural Analysis",
    "AutoCAD",
    "Construction Management",
    "Surveying",
    "Legal Research",
    "Case Management",
    "Client Consultation",
    "Litigation",
]


def generate_answers_for_geting_hired(
    resume_text,
    role,
    company,
    questions_list,
    word_limit,
    model_provider="Google",
    model_name="gemini-2.0-flash",
    api_keys_dict={
        "Google": google_api_key,
    },
    user_company_knowledge="",
    company_research="",
):
    """Generates answers to interview questions based on the resume and inputs."""
    if not questions_list:
        return []

    llm = None
    try:
        if model_provider == "Google":
            if not api_keys_dict.get("Google"):
                raise ValueError("Google API Key not provided.")
            llm = GoogleGenerativeAI(
                model=model_name,
                temperature=0.3,
                google_api_key=api_keys_dict["Google"],
            )
            # elif model_provider == "OpenAI":
            #     if not api_keys_dict.get("OpenAI"):
            #         raise ValueError("OpenAI API Key not provided.")
            #     llm = ChatOpenAI(
            #         model_name=model_name,
            #         temperature=0.3,
            #         openai_api_key=api_keys_dict["OpenAI"],
            #     )
            # elif model_provider == "Claude":
            #     if not api_keys_dict.get("Claude"):
            #         raise ValueError("Anthropic API Key not provided.")
            #     llm = ChatAnthropic(
            #         model=model_name,
            #         temperature=0.3,
            #         anthropic_api_key=api_keys_dict["Claude"],
            #     )
        else:
            raise ValueError(f"Unsupported model provider: {model_provider}")

    except ValueError as ve:
        error_msg = str(ve)
        provider_help = {
            "Google": "Verify your Google API key at https://aistudio.google.com/app/apikey",
            "OpenAI": "Verify your OpenAI API key at https://platform.openai.com/api-keys",
            "Claude": "Verify your Anthropic API key at https://console.anthropic.com/",
        }

        for provider, help_text in provider_help.items():
            if provider in error_msg:
                error_msg += f"\n💡 {help_text}"
                break

        return [
            {"question": q, "answer": f"Configuration Error: {error_msg}"}
            for q in questions_list
        ]

    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        if "rate limit" in str(e).lower():
            error_msg += (
                "\nYou may have hit API rate limits. Try again in a few moments."
            )
        elif "authentication" in str(e).lower() or "unauthorized" in str(e).lower():
            error_msg += (
                "\nPlease check your API key is valid and has sufficient credits."
            )
        elif "connection" in str(e).lower() or "network" in str(e).lower():
            error_msg += (
                "\nNetwork connection issue. Please check your internet connection."
            )

        return [
            {
                "question": q,
                "answer": f"Error: {error_msg}",
            }
            for q in questions_list
        ]

    company_context = ""
    if user_company_knowledge.strip():
        company_context += f"\n\nAdditional information about {company}:\n{user_company_knowledge.strip()}"

    if company_research.strip():
        company_context += (
            f"\n\nResearch findings about {company}:\n{company_research.strip()}"
        )

    template = """
    You are an expert interview coach and career advisor.

    Below is the candidate’s résumé (Markdown):
    ```
    {resume}
    ```

    They are applying for the role of **{role}** at **{company}**{company_context}.

    Your task: craft a clear, concise answer (≤ {word_limit} words) to the interview question below.

    Question:
    {question}

    Formatting guidelines:
    1. Start with a one-sentence summary of why this candidate is a great fit.
    2. Then use 3–4 bullet points that each:
    • Reference a specific skill or achievement from the résumé  
    • Include metrics or outcomes whenever possible  
    • Tie back to the company’s mission, values or culture  
    3. Maintain a professional, confident tone.
    4. If no {company_context} is provided, skip references to company culture.

    Answer:
    """

    prompt = PromptTemplate(
        input_variables=[
            "resume",
            "role",
            "company",
            "company_context",
            "question",
            "word_limit",
        ],
        template=template,
    )
    chain = prompt | llm

    results = []
    for q in questions_list:

        try:
            response_content = chain.invoke(
                {
                    "resume": resume_text,
                    "role": role,
                    "company": company,
                    "company_context": company_context,
                    "question": q,
                    "word_limit": word_limit,
                }
            )
            answer = (
                response_content
                if isinstance(response_content, str)
                else getattr(response_content, "content", "")
            )

            results.append(
                {
                    "question": q,
                    "answer": answer.strip(),
                }
            )

        except Exception as e:
            results.append(
                {
                    "question": q,
                    "answer": f"Error generating answer: {e}",
                }
            )

    return results


# pydaantic
class ResumeAnalysis(BaseModel):
    name: str
    email: str
    contact: Optional[str] = None
    predicted_field: str
    college: Optional[str] = None
    work_experience: Optional[List[WorkExperienceEntry]] = Field(default_factory=list)
    projects: Optional[List[ProjectEntry]] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    upload_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )


class ResumeUploadResponse(BaseModel):
    """Response model for resume analysis"""

    success: bool = True
    message: str = "Resume analyzed successfully"
    data: ResumeAnalysis
    cleaned_data_dict: Optional[dict] = None


class ResumeListResponse(BaseModel):
    """Response model for getting list of resumes"""

    success: bool = True
    message: str = "Resumes retrieved successfully"
    data: List[ResumeAnalysis]
    count: int


class ResumeCategoryResponse(BaseModel):
    """Response model for getting resumes by category"""

    success: bool = True
    message: str = "Resumes retrieved successfully"
    data: List[ResumeAnalysis]
    count: int
    category: str


class ErrorResponse(BaseModel):
    """Error response model"""

    success: bool = False
    message: str
    error_detail: Optional[str] = None


class HiringAssistantRequest(BaseModel):
    role: str = Field(
        ..., min_length=1, description="The role the candidate is applying for."
    )
    questions: List[str] = Field(
        ..., min_items=1, description="List of interview questions."
    )
    company_name: str = Field(..., min_length=1, description="Name of the company.")
    user_knowledge: Optional[str] = Field(
        "", description="What the user already knows about the company/role."
    )
    company_url: Optional[str] = Field(
        None, description="URL of the company for research."
    )
    word_limit: Optional[int] = Field(
        150, ge=50, le=500, description="Word limit for each answer."
    )


class HiringAssistantResponse(BaseModel):
    success: bool = True
    message: str = "Answers generated successfully."
    data: Dict[str, str]


class ColdMailRequest(BaseModel):
    recipient_name: str = Field(
        ..., min_length=1, description="Name of the person being emailed."
    )
    recipient_designation: str = Field(
        ..., min_length=1, description="Designation of the recipient."
    )
    company_name: str = Field(
        ..., min_length=1, description="Company the recipient works for."
    )
    sender_name: str = Field(..., min_length=1, description="Your name (sender).")
    sender_role_or_goal: str = Field(
        ..., min_length=1, description="Your primary goal or role you're interested in."
    )
    key_points_to_include: str = Field(
        ..., min_length=10, description="Key points or achievements to highlight."
    )
    additional_info_for_llm: Optional[str] = Field(
        "", description="Any other context for the LLM."
    )
    company_url: Optional[str] = Field(
        None, description="URL of the company for research (optional)."
    )


class ColdMailResponse(BaseModel):
    success: bool = True
    message: str = "Cold email content generated successfully."
    subject: str
    body: str


def clean_resume(txt):
    cleantxt = re.sub(r"https\\S+", "", txt)
    cleantxt = re.sub(r"@\\S+|#\\S+", "", cleantxt)
    cleantxt = re.sub(r"[^\w\s]", "", cleantxt)
    doc = nlp(cleantxt)
    tokens = [
        token.lemma_.lower() for token in doc if token.text.lower() not in stop_words
    ]
    return " ".join(tokens)


# routers

v1_router = APIRouter(
    prefix="/v1",
    responses={
        404: {
            "description": "Not found",
        },
    },
)

v2_router = APIRouter(
    prefix="/v2",
    responses={
        404: {
            "description": "Not found",
        },
    },
    tags=[
        "V2",
    ],
)


# routes
""" Router V1 """


@v1_router.post(
    "/resume/analysis",
    summary="Analyze Resume",
    response_model=ResumeUploadResponse,
    tags=[
        "V1",
    ],
)
async def analyze_resume(file: UploadFile = File(...)):
    # global pool
    cleaned_data_dict = None  # Initialize to store LLM response
    try:
        # Ensure skills are initialized (handled by startup, but good to get the list)
        # current_skills_list = await get_skills_list_pg()

        uploads_dir = os.path.join(
            os.path.dirname(__file__),
            "uploads",
        )
        os.makedirs(uploads_dir, exist_ok=True)

        temp_file_path = os.path.join(uploads_dir, f"temp_{file.filename}")
        file_bytes = await file.read()  # Read file content as bytes
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_bytes)

        resume_text = process_document(
            file_bytes,
            file.filename,
        )

        if resume_text is None:
            os.remove(temp_file_path)
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type or error processing file: {file.filename}",
            )

        file_extension = os.path.splitext(file.filename)[1].lower()
        if resume_text.strip() and file_extension not in [".md", ".txt"]:
            resume_text = format_resume_text_with_llm(resume_text)

        os.remove(temp_file_path)

        if not is_valid_resume(resume_text):
            raise HTTPException(status_code=400, detail="Invalid resume format")

        name, email = extract_name_and_email(resume_text)
        contact = extract_contact_number_from_resume(resume_text)
        work_experience = extract_work_experience(resume_text)
        extracted_skills = extract_skills_from_resume(resume_text, skills_list)
        college = extract_college_name(resume_text)
        projects = extract_projects(resume_text)

        cleaned_resume_for_prediction = clean_resume(resume_text)
        predicted_category = predict_category(cleaned_resume_for_prediction)

        initial_resume_data = {
            "name": name,
            "email": email,
            "contact": contact,
            "predicted_field": predicted_category,
            "college": college,
            "work_experience": work_experience,
            "skills": extracted_skills,
            "projects": projects,
            "upload_date": datetime.now(timezone.utc).isoformat(),
        }
        initial_resume_json_str = json.dumps(initial_resume_data)

        if not llm:
            print("Warning: LLM not available, skipping LLM processing step.")

            try:
                analysis_data = ResumeAnalysis(**initial_resume_data)

            except ValidationError as e:
                raise HTTPException(
                    status_code=400,
                    detail=ErrorResponse(
                        message="Validation error for extracted data (LLM unavailable)",
                        error_detail=str(e.errors()),
                    ).model_dump(),
                )
        else:

            formatted_prompt = langchain_prompt.format_prompt(
                resume_json=initial_resume_json_str,
                extracted_resume_text=resume_text,
            ).to_string()

            llm_response_content = ""
            try:
                response = llm.invoke(formatted_prompt)
                llm_response_content = response.content

            except Exception as e:
                print(f"Error during LLM invocation: {e}")
                raise HTTPException(
                    status_code=500,
                    detail=ErrorResponse(
                        message="LLM invocation failed", error_detail=str(e)
                    ).model_dump(),
                )

            try:
                if llm_response_content.strip().startswith("```json"):
                    llm_response_content = llm_response_content.strip()[7:]
                if llm_response_content.strip().endswith("```"):
                    llm_response_content = llm_response_content.strip()[:-3]

                cleaned_data_dict = json.loads(llm_response_content)

                if "errors" in cleaned_data_dict:
                    error_detail_str = json.dumps(cleaned_data_dict["errors"])
                    raise HTTPException(
                        status_code=400,
                        detail=ErrorResponse(
                            message="LLM reported validation errors",
                            error_detail=error_detail_str,
                        ).model_dump(),
                    )

                analysis_data = ResumeAnalysis(**cleaned_data_dict)

            except json.JSONDecodeError:
                print(f"LLM output was not valid JSON: {llm_response_content}")
                raise HTTPException(
                    status_code=500,
                    detail=ErrorResponse(
                        message="Failed to parse LLM response as JSON",
                        error_detail="LLM did not return valid JSON.",
                    ).model_dump(),
                )

            except ValidationError as e:
                print(f"Pydantic validation error after LLM processing: {e.errors()}")
                raise HTTPException(
                    status_code=400,
                    detail=ErrorResponse(
                        message="Validation error after LLM processing",
                        error_detail=str(e.errors()),
                    ).model_dump(),
                )

        if analysis_data.work_experience:

            filtered_work_experience = []
            for exp in analysis_data.work_experience:
                null_or_empty_count = 0
                please_remove = False

                if not exp.role:
                    null_or_empty_count += 1
                    if not exp.duration:
                        please_remove = True

                if not exp.company:
                    null_or_empty_count += 1

                if not exp.duration:
                    null_or_empty_count += 1

                if not exp.description:
                    null_or_empty_count += 1

                if null_or_empty_count <= 2 and not please_remove:
                    filtered_work_experience.append(exp)

            analysis_data.work_experience = filtered_work_experience

        if analysis_data.projects:
            filtered_projects = []
            for proj in analysis_data.projects:
                null_or_empty_count = 0
                if not proj.title:
                    null_or_empty_count += 1
                if not proj.technologies_used:
                    null_or_empty_count += 1
                if not proj.description:
                    null_or_empty_count += 1

                if null_or_empty_count < 2:
                    filtered_projects.append(proj)
            analysis_data.projects = filtered_projects

        # Save to PostgreSQL (This part remains commented out as per original)
        # async with pool.acquire() as connection:
        #     await connection.execute(
        #         """
        #         INSERT INTO resumes (name, email, contact, predicted_field, college, work_experience, skills, upload_date)
        #         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        #         """,
        #         analysis_data.name,
        #         analysis_data.email,
        #         analysis_data.contact,
        #         analysis_data.predicted_field,
        #         analysis_data.college,
        #         analysis_data.work_experience,
        #         analysis_data.skills,  # This should be a list of strings, matching TEXT[] in PG
        #         analysis_data.upload_date,
        #     )

        return ResumeUploadResponse(
            data=analysis_data,
            cleaned_data_dict=cleaned_data_dict,
        )

    except HTTPException:
        raise

    except Exception as e:

        print(f"Error in /analyze-resume/: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to analyze resume", error_detail=str(e)
            ).model_dump(),
        )


@v1_router.post(
    "/hiring-assistant/",
    description="Generates answers to interview questions based on the provided resume and inputs.",
    response_model=HiringAssistantResponse,
    tags=[
        "V1",
    ],
)
async def hiring_assistant(
    file: UploadFile = File(...),
    role: str = Form(...),
    questions: str = Form(...),  # JSON string: '["q1", "q2"]'
    company_name: str = Form(...),
    user_knowledge: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
    word_limit: Optional[int] = Form(150),
):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(
                message="LLM service is not available.",
            ).model_dump(),
        )

    try:

        try:
            questions_list = json.loads(questions)
            if (
                not isinstance(questions_list, list)
                or not all(isinstance(q, str) for q in questions_list)
                or not questions_list
            ):
                raise ValueError("Questions must be a non-empty list of strings.")
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(
                status_code=422,
                detail=ErrorResponse(
                    message="Invalid format for questions. Expected a JSON string representing a non-empty list of strings.",
                    error_detail=str(e),
                ).model_dump(),
            )

        uploads_dir = os.path.join(
            os.path.dirname(__file__),
            "uploads",
        )
        os.makedirs(uploads_dir, exist_ok=True)

        temp_file_path = os.path.join(
            uploads_dir,
            f"temp_hr_assist_{file.filename}",
        )

        file_bytes = await file.read()
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_bytes)

        resume_text = process_document(file_bytes, file.filename)
        if resume_text is None:
            os.remove(temp_file_path)
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message=f"Unsupported file type or error processing file: {file.filename}"
                ).model_dump(),
            )

        file_extension = os.path.splitext(file.filename)[1].lower()

        if resume_text.strip() and file_extension not in [".md", ".txt"]:
            resume_text = format_resume_text_with_llm(resume_text)

        os.remove(temp_file_path)

        if not is_valid_resume(resume_text):
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message="Invalid resume format or content."
                ).model_dump(),
            )

        company_research_info = ""
        if company_url:
            company_research_info = get_company_research(company_name, company_url)

        generated_answers_list = generate_answers_for_geting_hired(
            resume_text=resume_text,
            role=role,
            company=company_name,
            questions_list=questions_list,
            word_limit=word_limit,
            user_company_knowledge=user_knowledge,
            company_research=company_research_info,
        )

        answers_data = {}
        for item in generated_answers_list:
            if "Error:" in item["answer"] or "Configuration Error:" in item["answer"]:
                raise HTTPException(
                    status_code=500,
                    detail=ErrorResponse(
                        message="Failed to generate one or more answers due to an internal error.",
                        error_detail=item["answer"],
                    ).model_dump(),
                )
            answers_data[item["question"]] = item["answer"]

        if not answers_data:
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(message="No answers were generated.").model_dump(),
            )

        return HiringAssistantResponse(data=answers_data)

    except HTTPException:
        raise

    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                message="Input validation error.", error_detail=str(e.errors())
            ).model_dump(),
        )

    except ValueError as ve:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                message="Invalid input value.", error_detail=str(ve)
            ).model_dump(),
        )

    except Exception as e:
        print(f"Error in /hiring-assistant/: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate hiring assistance.", error_detail=str(e)
            ).model_dump(),
        )


@v1_router.post(
    "/cold-mail/generator/",
    response_model=ColdMailResponse,
    description="Generates a cold email based on the provided resume and user inputs.",
    tags=[
        "V1",
    ],
)
async def cold_mail_generator(
    file: UploadFile = File(...),
    recipient_name: str = Form(...),
    recipient_designation: str = Form(...),
    company_name: str = Form(...),
    sender_name: str = Form(...),
    sender_role_or_goal: str = Form(...),
    key_points_to_include: str = Form(...),
    additional_info_for_llm: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(message="LLM service is not available.").model_dump(),
        )

    try:
        uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        temp_file_path = os.path.join(uploads_dir, f"temp_cold_mail_{file.filename}")
        file_bytes = await file.read()
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_bytes)

        resume_text = process_document(file_bytes, file.filename)
        if resume_text is None:
            os.remove(temp_file_path)
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message=f"Unsupported file type or error processing file: {file.filename}"
                ).model_dump(),
            )

        file_extension = os.path.splitext(file.filename)[1].lower()
        if resume_text.strip() and file_extension not in [".md", ".txt"]:
            resume_text = format_resume_text_with_llm(resume_text)

        os.remove(temp_file_path)

        if not is_valid_resume(resume_text):
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message="Invalid resume format or content."
                ).model_dump(),
            )

        company_research_info = ""
        if company_url:
            company_research_info = get_company_research(company_name, company_url)

        email_content = generate_cold_mail_content(
            resume_text=resume_text,
            recipient_name=recipient_name,
            recipient_designation=recipient_designation,
            company_name=company_name,
            sender_name=sender_name,
            sender_role_or_goal=sender_role_or_goal,
            key_points_to_include=key_points_to_include,
            additional_info_for_llm=additional_info_for_llm,
            company_research=company_research_info,
        )

        if "Error:" in email_content["subject"] or "Error:" in email_content["body"]:
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="Failed to generate email content due to an LLM or parsing error.",
                    error_detail=f"Subject: {email_content['subject']}, Body: {email_content['body'][:200]}...",
                ).model_dump(),
            )

        return ColdMailResponse(
            subject=email_content["subject"], body=email_content["body"]
        )

    except HTTPException:
        raise

    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                message="Input validation error.", error_detail=str(e.errors())
            ).model_dump(),
        )

    except ValueError as ve:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Configuration or internal error.", error_detail=str(ve)
            ).model_dump(),
        )

    except Exception as e:
        print(f"Error in /cold-mail-generator/: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate cold mail content.", error_detail=str(e)
            ).model_dump(),
        )


@v1_router.get(
    "/resumes/",
    response_model=ResumeListResponse,
    description="Fetch all resumes from the database.",
    tags=[
        "V1",
    ],
)
async def get_resumes():
    ...
    return {
        "success": True,
        "message": "underconstruction",
    }
    # global pool
    # async with pool.acquire() as connection:
    #     rows = await connection.fetch(
    #         "SELECT id, name, email, contact, predicted_field, college, work_experience, skills, upload_date FROM resumes;"
    #     )

    #     resumes = [ResumeAnalysis(**dict(row)) for row in rows]
    #     return ResumeListResponse(
    #         data=resumes,
    #         count=len(resumes),
    #     )


@v1_router.get(
    "/resumes/{category}",
    response_model=ResumeCategoryResponse,
    description="Fetch resumes by category. The category is the predicted field from the resume analysis.",
    tags=[
        "V1",
    ],
)
async def get_resumes_by_category(category: str):
    ...
    return {
        "success": True,
        "message": "underconstruction",
    }
    # global pool
    # async with pool.acquire() as connection:
    #     rows = await connection.fetch(
    #         "SELECT id, name, email, contact, predicted_field, college, work_experience, skills, upload_date FROM resumes WHERE predicted_field = $1;",
    #         category,
    #     )

    #     resumes = [ResumeAnalysis(**dict(row)) for row in rows]
    #     return ResumeCategoryResponse(
    #         data=resumes,
    #         count=len(resumes),
    #         category=category,
    #     )


@v1_router.post(
    "/resume/comprehensive/analysis/",
    response_model=ComprehensiveAnalysisResponse,
    description="Performs a comprehensive analysis of the uploaded resume using LLM.",
    tags=[
        "V1",
    ],
)
async def comprehensive_resume_analysis(file: UploadFile = File(...)):
    if not llm:
        raise HTTPException(status_code=503, detail="LLM service is not available.")

    try:
        uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        file_bytes = await file.read()

        temp_file_path = os.path.join(uploads_dir, f"temp_comp_{file.filename}")
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_bytes)

        resume_text = process_document(file_bytes, file.filename)
        if resume_text is None:
            os.remove(temp_file_path)
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type or error processing file: {file.filename}",
            )

        if resume_text.strip():
            resume_text = format_resume_text_with_llm(resume_text)

        os.remove(temp_file_path)

        if not is_valid_resume(resume_text):
            raise HTTPException(
                status_code=400, detail="Invalid resume format or content."
            )

        name, email = extract_name_and_email(resume_text)
        contact = extract_contact_number_from_resume(resume_text)
        cleaned_resume_for_prediction = clean_resume(resume_text)
        predicted_category = predict_category(cleaned_resume_for_prediction)

        basic_info = {
            "name": name,
            "email": email,
            "contact": contact,
        }
        basic_info_json_str = json.dumps(basic_info)

        formatted_prompt = comprehensive_analysis_prompt.format_prompt(
            extracted_resume_text=resume_text,
            predicted_category=predicted_category,
            basic_info_json=basic_info_json_str,
        ).to_string()

        llm_response_content = ""
        try:
            response = llm.invoke(formatted_prompt)
            llm_response_content = response.content
        except Exception as e:
            print(f"Error during LLM invocation for comprehensive analysis: {e}")
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="LLM invocation failed", error_detail=str(e)
                ).model_dump(),
            )

        try:
            if llm_response_content.strip().startswith("```json"):
                llm_response_content = llm_response_content.strip()[7:]
            if llm_response_content.strip().endswith("```"):
                llm_response_content = llm_response_content.strip()[:-3]

            analysis_dict = json.loads(llm_response_content)

            if (
                "predicted_field" not in analysis_dict
                or not analysis_dict["predicted_field"]
            ):
                analysis_dict["predicted_field"] = predicted_category
            if "name" not in analysis_dict or not analysis_dict["name"]:
                analysis_dict["name"] = name
            if "email" not in analysis_dict or not analysis_dict["email"]:
                analysis_dict["email"] = email
            if "contact" not in analysis_dict and contact:
                analysis_dict["contact"] = contact

            comprehensive_data = ComprehensiveAnalysisData(**analysis_dict)
            return ComprehensiveAnalysisResponse(data=comprehensive_data)

        except json.JSONDecodeError:
            print(
                f"LLM output (comprehensive) was not valid JSON: {llm_response_content}"
            )
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="Failed to parse LLM response as JSON",
                    error_detail="LLM did not return valid JSON.",
                ).model_dump(),
            )
        except ValidationError as e:
            print(f"Pydantic validation error (comprehensive): {e.errors()}")
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message="Validation error for LLM comprehensive data",
                    error_detail=str(e.errors()),
                ).model_dump(),
            )

    except HTTPException:
        raise

    except Exception as e:
        print(f"Error in /comprehensive-analysis/: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to perform comprehensive analysis", error_detail=str(e)
            ).model_dump(),
        )


class TipsRequest(BaseModel):
    job_category: Optional[str] = None
    skills: Optional[str] = None


@v1_router.get(
    "/generate/tips/",
    response_model=TipsResponse,
    description="Generates career & resume tips based on job category and skills.",
    tags=[
        "V1",
    ],
)
async def get_career_tips(
    job_category: Optional[str] = Query(
        None,
        description="Job category for tailored tips",
    ),
    skills: Optional[str] = Query(
        None,
        description="Comma-separated skills for tailored tips",
    ),
):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail="LLM service is not available.",
        )

    if job_category:
        job_category = job_category.strip().lower()
        if not job_category:
            job_category = "general"

    else:
        job_category = "general"

    if skills:
        skills = [skill.strip() for skill in skills.split(",") if skill.strip()]

    else:
        skills = []

    skills_list_str = skills if skills else ""
    category_str = job_category if job_category else "general"

    try:
        formatted_prompt = tips_generator_prompt.format_prompt(
            job_category=category_str,
            skills_list_str=skills_list_str,
        ).to_string()

        llm_response_content = ""
        try:
            response = llm.invoke(formatted_prompt)
            llm_response_content = response.content

        except Exception as e:
            print(f"Error during LLM invocation for tips: {e}")
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="LLM invocation for tips failed", error_detail=str(e)
                ).model_dump(),
            )

        try:
            if llm_response_content.strip().startswith("```json"):
                llm_response_content = llm_response_content.strip()[7:]
            if llm_response_content.strip().endswith("```"):
                llm_response_content = llm_response_content.strip()[:-3]

            tips_dict = json.loads(llm_response_content)
            tips_data = TipsData(**tips_dict)
            return TipsResponse(data=tips_data)

        except json.JSONDecodeError:
            print(f"LLM output (tips) was not valid JSON: {llm_response_content}")
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="Failed to parse LLM tips response as JSON",
                    error_detail="LLM did not return valid JSON for tips.",
                ).model_dump(),
            )

        except ValidationError as e:
            print(f"Pydantic validation error (tips): {e.errors()}")
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message="Validation error for LLM tips data",
                    error_detail=str(e.errors()),
                ).model_dump(),
            )

    except HTTPException:
        raise

    except Exception as e:
        print(f"Error in /tips/: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to retrieve tips", error_detail=str(e)
            ).model_dump(),
        )


""" Router V2 """


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


class FormattedAndAnalyzedResumeResponse(BaseModel):
    success: bool = True
    message: str = "Resume formatted and analyzed successfully"
    cleaned_text: str
    analysis: ComprehensiveAnalysisData


@v2_router.post(
    "/resume/format-and-analyze",
    summary="Format, Clean, and Analyze Resume from File (V2)",
    response_model=FormattedAndAnalyzedResumeResponse,
    tags=[
        "V2",
    ],
)
async def format_and_analyze_resume_v2(file: UploadFile = File(...)):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(message="LLM service is not available.").model_dump(),
        )

    try:
        uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        file_bytes = await file.read()
        temp_file_path = os.path.join(
            uploads_dir, f"temp_format_analyze_{file.filename}"
        )
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_bytes)

        raw_resume_text = process_document(file_bytes, file.filename)
        os.remove(temp_file_path)

        if raw_resume_text is None:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type or error processing file: {file.filename}",
            )

        name, email = extract_name_and_email(raw_resume_text)
        contact = extract_contact_number_from_resume(raw_resume_text)
        basic_info = {
            "name": name,
            "email": email,
            "contact": contact,
        }
        basic_info_json_str = json.dumps(basic_info)

        formatted_prompt_str = format_analyse_prompt.format_prompt(
            raw_resume_text=raw_resume_text,
            basic_info_json=basic_info_json_str,
        ).to_string()

        llm_response_content = ""
        try:
            response = llm.invoke(formatted_prompt_str)
            llm_response_content = response.content

        except Exception as e:
            print(f"Error during LLM invocation for format-and-analyze: {e}")
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="LLM invocation failed for format-and-analyze",
                    error_detail=str(e),
                ).model_dump(),
            )

        try:
            if llm_response_content.strip().startswith("```json"):
                llm_response_content = llm_response_content.strip()[7:]
            if llm_response_content.strip().endswith("```"):
                llm_response_content = llm_response_content.strip()[:-3]

            parsed_llm_output = json.loads(llm_response_content)

            cleaned_text_from_llm = parsed_llm_output.get("cleaned_text")
            analysis_dict_from_llm = parsed_llm_output.get("analysis")

            if cleaned_text_from_llm is None or analysis_dict_from_llm is None:
                raise HTTPException(
                    status_code=500,
                    detail=ErrorResponse(
                        message="LLM response did not contain expected 'cleaned_text' or 'analysis' keys.",
                        error_detail=f"LLM Output Preview: {llm_response_content[:500]}",
                    ).model_dump(),
                )

            # Validate the analysis part
            analysis_data = ComprehensiveAnalysisData(**analysis_dict_from_llm)

            return FormattedAndAnalyzedResumeResponse(
                cleaned_text=cleaned_text_from_llm, analysis=analysis_data
            )

        except json.JSONDecodeError:
            print(
                f"LLM output (format-and-analyze) was not valid JSON: {llm_response_content}"
            )
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="Failed to parse LLM response for format-and-analyze as JSON.",
                    error_detail=f"LLM Output Preview: {llm_response_content[:500]}",
                ).model_dump(),
            )

        except ValidationError as e:
            print(f"Pydantic validation error (format-and-analyze): {e.errors()}")
            error_detail_extended = {
                "pydantic_errors": e.errors(),
                "llm_response_preview": llm_response_content[:500],
            }
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message="Validation error for LLM format-and-analyze data.",
                    error_detail=json.dumps(error_detail_extended),
                ).model_dump(),
            )

    except HTTPException:
        raise

    except Exception as e:
        print(f"Unexpected error in /resume/format-and-analyze/: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to format and analyze resume due to an unexpected error.",
                error_detail=str(e),
            ).model_dump(),
        )


@v2_router.post(
    "/resume/analysis",
    summary="Analyze Resume (V2)",
    response_model=ComprehensiveAnalysisData,
    tags=[
        "V2",
    ],
)
async def analyze_resume(
    formated_resume: str = Form(
        ...,
        description="Formatted resume text",
    ),
):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail="LLM service is not available.",
        )

    cleaned_resume_dict_from_llm = None

    try:
        if not formated_resume.strip():
            raise HTTPException(
                status_code=400, detail="Formatted resume text cannot be empty."
            )

        name, email = extract_name_and_email(formated_resume)
        contact = extract_contact_number_from_resume(formated_resume)

        cleaned_resume_for_prediction = clean_resume(formated_resume)

        predicted_category = predict_category(cleaned_resume_for_prediction)

        basic_info = {
            "name": name,
            "email": email,
            "contact": contact,
        }
        basic_info_json_str = json.dumps(basic_info)

        formatted_prompt_v2 = comprehensive_analysis_prompt.format_prompt(
            extracted_resume_text=formated_resume,
            predicted_category=predicted_category,
            basic_info_json=basic_info_json_str,
        ).to_string()

        llm_response_content = ""

        try:
            response = llm.invoke(formatted_prompt_v2)
            llm_response_content = response.content

        except Exception as e:
            print(f"Error during LLM invocation for V2 resume analysis: {e}")
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="LLM invocation failed for V2 analysis", error_detail=str(e)
                ).model_dump(),
            )

        try:

            raw_llm_json = llm_response_content

            if raw_llm_json.strip().startswith("```json"):
                raw_llm_json = raw_llm_json.strip()[7:]

            if raw_llm_json.strip().endswith("```"):
                raw_llm_json = raw_llm_json.strip()[:-3]

            analysis_dict_from_llm = json.loads(raw_llm_json)
            cleaned_resume_dict_from_llm = analysis_dict_from_llm

            if (
                "predicted_field" not in analysis_dict_from_llm
                or not analysis_dict_from_llm["predicted_field"]
            ):
                analysis_dict_from_llm["predicted_field"] = predicted_category

            if (
                "name" not in analysis_dict_from_llm
                or not analysis_dict_from_llm["name"]
            ):
                analysis_dict_from_llm["name"] = name

            if (
                "email" not in analysis_dict_from_llm
                or not analysis_dict_from_llm["email"]
            ):
                analysis_dict_from_llm["email"] = email

            if "contact" not in analysis_dict_from_llm and contact:
                analysis_dict_from_llm["contact"] = contact

            analysis_dict_from_llm["cleaned_resume_dict"] = cleaned_resume_dict_from_llm

            comprehensive_data = ComprehensiveAnalysisData(
                **analysis_dict_from_llm,
            )

            return comprehensive_data

        except json.JSONDecodeError:
            print(
                f"LLM output (V2 resume analysis) was not valid JSON: {llm_response_content}"
            )
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="Failed to parse LLM response for V2 analysis as JSON",
                    error_detail="LLM did not return valid JSON.",
                ).model_dump(),
            )

        except ValidationError as e:
            print(f"Pydantic validation error (V2 resume analysis): {e.errors()}")

            error_detail_extended = {
                "pydantic_errors": e.errors(),
                "llm_response_preview": llm_response_content[:500],
            }
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message="Validation error for LLM V2 analysis data",
                    error_detail=json.dumps(error_detail_extended),
                ).model_dump(),
            )

    except HTTPException:
        raise

    except Exception as e:
        print(f"Unexpected error in V2 /resume/analysis/: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to perform V2 resume analysis due to an unexpected error",
                error_detail=str(e),
            ).model_dump(),
        )


@v2_router.post(
    "/hiring-assistant/",
    description="Generates answers to interview questions based on the provided resume text and inputs.",
    response_model=HiringAssistantResponse,
)
async def hiring_assistant2(
    resume_text: str = Form(...),
    role: str = Form(...),
    questions: str = Form(...),  # JSON string: '["q1", "q2"]'
    company_name: str = Form(...),
    user_knowledge: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
    word_limit: Optional[int] = Form(150),
):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(
                message="LLM service is not available.",
            ).model_dump(),
        )

    try:
        try:
            questions_list = json.loads(questions)
            if (
                not isinstance(questions_list, list)
                or not all(isinstance(q, str) for q in questions_list)
                or not questions_list
            ):
                raise ValueError("Questions must be a non-empty list of strings.")
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(
                status_code=422,
                detail=ErrorResponse(
                    message="Invalid format for questions. Expected a JSON string representing a non-empty list of strings.",
                    error_detail=str(e),
                ).model_dump(),
            )

        # The resume_text is now a direct input, so we can validate it immediately.
        if not is_valid_resume(resume_text):
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message="Invalid resume format or content. Text seems too short."
                ).model_dump(),
            )

        company_research_info = ""
        if company_url:
            company_research_info = get_company_research(company_name, company_url)

        generated_answers_list = generate_answers_for_geting_hired(
            resume_text=resume_text,
            role=role,
            company=company_name,
            questions_list=questions_list,
            word_limit=word_limit,
            user_company_knowledge=user_knowledge,
            company_research=company_research_info,
        )

        answers_data = {}
        for item in generated_answers_list:
            if "Error:" in item["answer"] or "Configuration Error:" in item["answer"]:
                raise HTTPException(
                    status_code=500,
                    detail=ErrorResponse(
                        message="Failed to generate one or more answers due to an internal error.",
                        error_detail=item["answer"],
                    ).model_dump(),
                )
            answers_data[item["question"]] = item["answer"]

        if not answers_data:
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(message="No answers were generated.").model_dump(),
            )

        return HiringAssistantResponse(data=answers_data)

    except HTTPException:
        raise

    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                message="Input validation error.", error_detail=str(e.errors())
            ).model_dump(),
        )

    except Exception as e:
        print(f"Error in /hiring-assistant/: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate hiring assistance.",
                error_detail=str(e),
            ).model_dump(),
        )


@v2_router.post(
    "/cold-mail/generator/",
    response_model=ColdMailResponse,
    description="Generates a cold email based on the provided resume text and user inputs.",
)
async def cold_mail_generator_v2(
    resume_text: str = Form(...),
    recipient_name: str = Form(...),
    recipient_designation: str = Form(...),
    company_name: str = Form(...),
    sender_name: str = Form(...),
    sender_role_or_goal: str = Form(...),
    key_points_to_include: str = Form(...),
    additional_info_for_llm: Optional[str] = Form(""),
    company_url: Optional[str] = Form(None),
):
    if not llm:
        raise HTTPException(
            status_code=503,
            detail=ErrorResponse(message="LLM service is not available.").model_dump(),
        )

    try:
        # The resume_text is now a direct input, so we can validate it immediately.
        if not is_valid_resume(resume_text):
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    message="Invalid resume content. Text seems too short or malformed."
                ).model_dump(),
            )

        company_research_info = ""
        if company_url:
            company_research_info = get_company_research(company_name, company_url)

        email_content = generate_cold_mail_content(
            resume_text=resume_text,
            recipient_name=recipient_name,
            recipient_designation=recipient_designation,
            company_name=company_name,
            sender_name=sender_name,
            sender_role_or_goal=sender_role_or_goal,
            key_points_to_include=key_points_to_include,
            additional_info_for_llm=additional_info_for_llm,
            company_research=company_research_info,
        )

        if "Error:" in email_content["subject"] or "Error:" in email_content["body"]:
            raise HTTPException(
                status_code=500,
                detail=ErrorResponse(
                    message="Failed to generate email content due to an LLM or parsing error.",
                    error_detail=f"Subject: {email_content['subject']}, Body: {email_content['body'][:200]}...",
                ).model_dump(),
            )

        return ColdMailResponse(
            subject=email_content["subject"], body=email_content["body"]
        )

    except HTTPException:
        raise

    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                message="Input validation error.", error_detail=str(e.errors())
            ).model_dump(),
        )

    except Exception as e:
        print(f"Error in /cold-mail-generator/: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to generate cold mail content.",
                error_detail=str(e),
            ).model_dump(),
        )


# comprehesive route inclusion
app.include_router(
    v1_router,
    prefix="/api",
    responses={
        404: {
            "description": "Not found",
        },
    },
)

app.include_router(
    v2_router,
    prefix="/api",
    responses={
        404: {
            "description": "Not found",
        },
    },
)


if __name__ == "__main__":

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[os.path.dirname(__file__)],
    )
