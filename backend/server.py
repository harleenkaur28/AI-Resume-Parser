from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
import json
from pydantic import BaseModel, Field
import zipfile
import pickle
import re
import spacy
import nltk
from nltk.corpus import stopwords
from PyPDF2 import PdfReader
import os
from typing import List, Optional, Dict
import shutil
from datetime import datetime, timezone 
import uvicorn

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate

from pydantic import BaseModel, Field, ValidationError 

from dotenv import load_dotenv

load_dotenv()


app = FastAPI()


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
        print("Warning: GOOGLE_API_KEY not found in .env. LLM functionality will be disabled.")
    else:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-lite", 
            google_api_key=google_api_key, 
            temperature=0.1,
        )

except Exception as e:
    print(f"Error initializing Google Generative AI: {e}. LLM functionality will be disabled.")

# Define structured Pydantic models for WorkExperience and Projects
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
    input_variables=["resume_json", "extracted_resume_text"],
    template=prompt_template_str,
)

# llm_chain = None
# if llm:
#     llm_chain = LLMChain(llm=llm, prompt=langchain_prompt)


# Pydantic models for comprehensive UI analysis
class SkillProficiency(BaseModel):
    skill_name: str
    percentage: int # e.g., 90 for 90%

class UIDetailedWorkExperienceEntry(BaseModel):
    role: str
    company_and_duration: str # e.g., "Tech Corp | 2020 - Present"
    bullet_points: List[str]

class UIProjectEntry(BaseModel):
    title: str
    technologies_used: List[str] = Field(default_factory=list)
    description: str

class LanguageEntry(BaseModel):
    language: str 

class EducationEntry(BaseModel):
    education_detail: str # e.g., "Master's in Computer Science"

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

# Pydantic models for tips
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
    input_variables=["extracted_resume_text", "predicted_category", "basic_info_json"],
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

tips_generator_prompt = PromptTemplate(
    input_variables=["job_category", "skills_list_str"],
    template=tips_generator_prompt_template_str,
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


# app.add_event_handler(
#     "startup",
#     connect_to_db,
# )
# app.add_event_handler(
#     "startup",
#     lambda: init_skills_pg(),
# )
# app.add_event_handler(
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
        text += page.extract_text()
    return text


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
    project_section_keywords = ["PROJECTS", "PERSONAL PROJECTS", "ACADEMIC PROJECTS", "PROJECT EXPERIENCE"]
    section_end_keywords = ["EXPERIENCE", "EDUCATION", "SKILLS", "CERTIFICATIONS", "AWARDS"] 

    lines = text.splitlines()
    for line in lines:
        stripped_line = line.strip()
        if not stripped_line:
            continue

        is_project_header = any(re.search(r'\b' + keyword + r'\b', stripped_line, re.IGNORECASE) for keyword in project_section_keywords)
        is_section_ender = any(re.search(r'\b' + keyword + r'\b', stripped_line, re.IGNORECASE) for keyword in section_end_keywords)

        if is_project_header:
            in_project_section = True

            continue
        
        if in_project_section:
            if is_section_ender and not is_project_header: 
                in_project_section = False
                break 
            projects_info.append(stripped_line)
            

    if not projects_info:
        project_line_keywords = ["developed", "implemented", "created", "designed", "project on", "built a", "application for"]
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

    extract_to_dir = os.path.join(__file__, "uploads", "extracted_files",)
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
    "Civil Engineering",
    "Structural Analysis",
    "AutoCAD",
    "Construction Management",
    "Surveying",
    "Legal Research",
    "Case Management",
    "Client Consultation",
    "Litigation",
]


# Pydantic models
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
        default_factory=lambda: datetime.now(timezone.utc)
    )


class ResumeUploadResponse(BaseModel):
    """Response model for resume analysis"""
    success: bool = True
    message: str = "Resume analyzed successfully"
    data: ResumeAnalysis


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


def clean_resume(txt):
    cleantxt = re.sub(r"https\\S+", "", txt)
    cleantxt = re.sub(r"@\\S+|#\\S+", "", cleantxt)
    cleantxt = re.sub(r"[^\w\s]", "", cleantxt)
    doc = nlp(cleantxt)
    tokens = [
        token.lemma_.lower() for token in doc if token.text.lower() not in stop_words
    ]
    return " ".join(tokens)


# routes
@app.post("/analyze-resume/", response_model=ResumeUploadResponse)
async def analyze_resume(file: UploadFile = File(...)):
    # global pool
    try:
        # Ensure skills are initialized (handled by startup, but good to get the list)
        # current_skills_list = await get_skills_list_pg()

        uploads_dir = os.path.join(
            os.path.dirname(__file__),
            "uploads",
        ) 
        os.makedirs(uploads_dir, exist_ok=True)

        temp_file = os.path.join(uploads_dir, f"temp_{file.filename}")
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if file.filename.endswith(".pdf"):
            resume_text = extract_text_from_pdf(temp_file)
        else:
            with open(temp_file, "r", encoding="utf-8", errors="ignore") as f:
                resume_text = f.read()

        os.remove(temp_file)

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
            "upload_date": datetime.now(timezone.utc).isoformat() 
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
                        error_detail=str(e.errors())
                    ).model_dump()
                )
        else:

            formatted_prompt = langchain_prompt.format_prompt(
                resume_json=initial_resume_json_str,
                extracted_resume_text=resume_text
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
                        message="LLM invocation failed",
                        error_detail=str(e)
                    ).model_dump()
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
                            error_detail=error_detail_str
                        ).model_dump()
                    )
                
                analysis_data = ResumeAnalysis(**cleaned_data_dict)

            except json.JSONDecodeError:
                print(f"LLM output was not valid JSON: {llm_response_content}")
                raise HTTPException(
                    status_code=500,
                    detail=ErrorResponse(
                        message="Failed to parse LLM response as JSON",
                        error_detail="LLM did not return valid JSON."
                    ).model_dump()
                )
            except ValidationError as e: 
                print(f"Pydantic validation error after LLM processing: {e.errors()}")
                raise HTTPException(
                    status_code=400,
                    detail=ErrorResponse(
                        message="Validation error after LLM processing",
                        error_detail=str(e.errors()) 
                    ).model_dump()
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
                if not proj.title: null_or_empty_count += 1
                if not proj.technologies_used: null_or_empty_count += 1 # Empty list counts as unpopulated
                if not proj.description: null_or_empty_count += 1
                
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

        return ResumeUploadResponse(data=analysis_data)

    except HTTPException: 
        raise

    except Exception as e:

        print(f"Error in /analyze-resume/: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                message="Failed to analyze resume",
                error_detail=str(e)
            ).model_dump() 
        )


@app.get("/resumes/", response_model=ResumeListResponse)
async def get_resumes():
    global pool
    async with pool.acquire() as connection:
        rows = await connection.fetch(
            "SELECT id, name, email, contact, predicted_field, college, work_experience, skills, upload_date FROM resumes;"
        )

        resumes = [ResumeAnalysis(**dict(row)) for row in rows]
        return ResumeListResponse(data=resumes, count=len(resumes))


@app.get("/resumes/{category}", response_model=ResumeCategoryResponse)
async def get_resumes_by_category(category: str):
    global pool
    async with pool.acquire() as connection:
        rows = await connection.fetch(
            "SELECT id, name, email, contact, predicted_field, college, work_experience, skills, upload_date FROM resumes WHERE predicted_field = $1;",
            category,
        )

        resumes = [ResumeAnalysis(**dict(row)) for row in rows]
        return ResumeCategoryResponse(data=resumes, count=len(resumes), category=category)


@app.post("/comprehensive-analysis/", response_model=ComprehensiveAnalysisResponse)
async def comprehensive_resume_analysis(file: UploadFile = File(...)):
    if not llm:
        raise HTTPException(status_code=503, detail="LLM service is not available.")

    try:
        uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        temp_file = os.path.join(uploads_dir, f"temp_comp_{file.filename}")
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        resume_text = ""
        if file.filename.endswith(".pdf"):
            resume_text = extract_text_from_pdf(temp_file)
        else:
            with open(temp_file, "r", encoding="utf-8", errors="ignore") as f:
                resume_text = f.read()
        os.remove(temp_file)

        if not is_valid_resume(resume_text):
            raise HTTPException(status_code=400, detail="Invalid resume format or content.")

        # Basic info extraction
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
            basic_info_json=basic_info_json_str
        ).to_string()

        llm_response_content = ""
        try:
            response = llm.invoke(formatted_prompt)
            llm_response_content = response.content
        except Exception as e:
            print(f"Error during LLM invocation for comprehensive analysis: {e}")
            raise HTTPException(status_code=500, detail=ErrorResponse(message="LLM invocation failed", error_detail=str(e)).model_dump())

        try:
            if llm_response_content.strip().startswith("```json"):
                llm_response_content = llm_response_content.strip()[7:]
            if llm_response_content.strip().endswith("```"):
                llm_response_content = llm_response_content.strip()[:-3]
            
            analysis_dict = json.loads(llm_response_content)
            
            # Ensure predicted_field is correctly passed or set
            if 'predicted_field' not in analysis_dict or not analysis_dict['predicted_field']:
                analysis_dict['predicted_field'] = predicted_category
            if 'name' not in analysis_dict or not analysis_dict['name']:
                 analysis_dict['name'] = name
            if 'email' not in analysis_dict or not analysis_dict['email']:
                 analysis_dict['email'] = email
            if 'contact' not in analysis_dict and contact: # only add if contact was found
                 analysis_dict['contact'] = contact


            comprehensive_data = ComprehensiveAnalysisData(**analysis_dict)
            return ComprehensiveAnalysisResponse(data=comprehensive_data)

        except json.JSONDecodeError:
            print(f"LLM output (comprehensive) was not valid JSON: {llm_response_content}")
            raise HTTPException(status_code=500, detail=ErrorResponse(message="Failed to parse LLM response as JSON", error_detail="LLM did not return valid JSON.").model_dump())
        except ValidationError as e:
            print(f"Pydantic validation error (comprehensive): {e.errors()}")
            raise HTTPException(status_code=400, detail=ErrorResponse(message="Validation error for LLM comprehensive data", error_detail=str(e.errors())).model_dump())

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /comprehensive-analysis/: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=ErrorResponse(message="Failed to perform comprehensive analysis", error_detail=str(e)).model_dump())


class TipsRequest(BaseModel):
    job_category: Optional[str] = None
    skills: Optional[str] = None

@app.get("/tips/", response_model=TipsResponse)
async def get_career_tips(
    job_category: Optional[str] = Query(None, description="Job category for tailored tips"),
    skills: Optional[str] = Query(None, description="Comma-separated skills for tailored tips"),
):
    if not llm:
        raise HTTPException(status_code=503, detail="LLM service is not available.")

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
            skills_list_str=skills_list_str
        ).to_string()

        llm_response_content = ""
        try:
            response = llm.invoke(formatted_prompt)
            llm_response_content = response.content
        except Exception as e:
            print(f"Error during LLM invocation for tips: {e}")
            raise HTTPException(status_code=500, detail=ErrorResponse(message="LLM invocation for tips failed", error_detail=str(e)).model_dump())

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
            raise HTTPException(status_code=500, detail=ErrorResponse(message="Failed to parse LLM tips response as JSON", error_detail="LLM did not return valid JSON for tips.").model_dump())
        except ValidationError as e:
            print(f"Pydantic validation error (tips): {e.errors()}")
            raise HTTPException(status_code=400, detail=ErrorResponse(message="Validation error for LLM tips data", error_detail=str(e.errors())).model_dump())
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /tips/: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=ErrorResponse(message="Failed to retrieve tips", error_detail=str(e)).model_dump())


if __name__ == "__main__":

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[os.path.dirname(__file__)],
    )
