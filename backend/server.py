from fastapi import FastAPI, File, UploadFile, HTTPException
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
from typing import List, Optional
import shutil
from datetime import datetime
import uvicorn


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

    if not text:  # If no text is extracted, skip
        return False

    # Resume-specific keywords
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


def extract_work_experience(text):
    """Extract work experience from the resume text."""
    work_experience_keywords = [
        r"\b(intern|manager|developer|engineer|analyst|lead|consultant|specialist|director|officer|administrator|associate|scientist|technician|programmer|designer|researcher|trainee|staff)\b",
        r"\b(Senior|Junior|Lead|Principal|Entry|Mid-level|Experienced)\s+\w+\b",
    ]
    pattern = re.compile("|".join(work_experience_keywords), re.IGNORECASE)

    work_experience_info = []
    for line in text.splitlines():
        if pattern.search(line):
            work_experience_info.append(line.strip())

    return " | ".join(work_experience_info) if work_experience_info else "N/A"


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
    # Create a temporary directory for extracted files
    extract_to_dir = "extracted_files"
    os.makedirs(extract_to_dir, exist_ok=True)
    extracted_files = []

    try:
        with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
            zip_ref.extractall(extract_to_dir)  # Extract to temp directory
            for file in zip_ref.namelist():
                # Skip unwanted system files or directories
                if "__MACOSX" in file or file.endswith("/"):
                    continue

                full_path = os.path.join(extract_to_dir, file)

                # Check if it's a valid file
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
    work_experience: Optional[str] = None  
    skills: List[str] = []
    upload_date: datetime = Field(
        default_factory=datetime.utcnow
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


# Helper functions (reuse your existing functions)
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

        # Create temporary file
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
        extracted_skills = extract_skills_from_resume(
            resume_text, skills_list
        )  # Use current_skills_list
        college = extract_college_name(resume_text)

        cleaned_resume = clean_resume(resume_text)
        predicted_category = predict_category(cleaned_resume)

        analysis_data = ResumeAnalysis(
            name=name,
            email=email,
            contact=contact,
            predicted_field=predicted_category,
            college=college,
            work_experience=work_experience,
            skills=extracted_skills,
            # upload_date is handled by Pydantic model default or DB default
        )

        # Save to PostgreSQL
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

    except Exception as e:
        # Log the exception for debugging
        print(f"Error in /analyze-resume/: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=ErrorResponse(
                message="Failed to analyze resume",
                error_detail=str(e)
            ).dict()
        )


@app.get("/resumes/", response_model=ResumeListResponse)
async def get_resumes():
    global pool
    async with pool.acquire() as connection:
        rows = await connection.fetch(
            "SELECT id, name, email, contact, predicted_field, college, work_experience, skills, upload_date FROM resumes;"
        )
        # Convert rows to list of ResumeAnalysis models
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
        # Convert rows to list of ResumeAnalysis models
        resumes = [ResumeAnalysis(**dict(row)) for row in rows]
        return ResumeCategoryResponse(data=resumes, count=len(resumes), category=category)


if __name__ == "__main__":

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[os.path.dirname(__file__)],
    )
