from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
import zipfile
import pickle
import re
import spacy
import nltk
from nltk.corpus import stopwords
from PyPDF2 import PdfReader
import os
from typing import List
import shutil
from datetime import datetime
import uvicorn

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URL)
db = client.resume_db
resume_collection = db.resumes
skills_collection = db.skills

# Initialize skills in MongoDB (run this once)
async def init_skills():
    if await skills_collection.count_documents({}) == 0:
        await skills_collection.insert_one({"skills": skills_list})

# Update the skills list retrieval
async def get_skills_list():
    skills_doc = await skills_collection.find_one({})
    return skills_doc["skills"] if skills_doc else []

nlp = spacy.load('en_core_web_sm')
nltk.download('punkt')
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

clf = pickle.load(open('best_model.pkl', 'rb'))
tfidf_vectorizer = pickle.load(open('tfidf.pkl', 'rb'))

def clean_resume(txt):
    """Clean the resume text by removing unwanted characters and lemmatizing."""
    cleantxt = re.sub(r'https\S+', '', txt)
    cleantxt = re.sub(r'@\S+|#\S+', '', cleantxt)
    cleantxt = re.sub(r'[^\w\s]', '', cleantxt)

    doc = nlp(cleantxt)
    tokens = [token.lemma_.lower() for token in doc if token.text.lower() not in stop_words]

    return ' '.join(tokens)

def extract_text_from_pdf(uploaded_file):
    """Extract text from a PDF file."""
    pdf_reader = PdfReader(uploaded_file)
    text = ''
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text 

def is_valid_resume(text):
    """Check if the PDF is a valid resume based on text content."""
    
    if not text:  # If no text is extracted, skip
        return False
    
    # Resume-specific keywords 
    resume_keywords = ['Experience', 'Education', 'Skills', 'Profile', 'Work History','Projects','Certifications']
    if any(re.search(keyword, text, re.I) for keyword in resume_keywords):
        return True
    return False

def extract_name_and_email(text):
    """Extract the name and email from the resume text."""
    email_regex = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
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
    lines = text.split('\n')
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
    education_text = ', '.join(education) if education else " "
    
    return education_text

    

def extract_work_experience(text):
    """Extract work experience from the resume text."""
    work_experience_keywords = [
        r'\b(intern|manager|developer|engineer|analyst|lead|consultant|specialist|director|officer|administrator|associate|scientist|technician|programmer|designer|researcher|trainee|staff)\b',
        r'\b(Senior|Junior|Lead|Principal|Entry|Mid-level|Experienced)\s+\w+\b'
    ]
    pattern = re.compile('|'.join(work_experience_keywords), re.IGNORECASE)

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
        15: "Java Developer", 23: "Testing", 8: "DevOps Engineer", 20: "Python Developer",
        24: "Web Designing", 12: "HR", 13: "Hadoop", 3: "Blockchain", 10: "ETL Developer",
        18: "Operations Manager", 6: "Data Science", 22: "Sales", 16: "Mechanical Engineer",
        1: "Arts", 7: "Database", 11: "Electrical Engineering", 14: "Health and fitness",
        19: "PMO", 4: "Business Analyst", 9: "DotNet Developer", 2: "Automation Testing",
        17: "Network Security Engineer", 21: "SAP Developer", 5: "Civil Engineer", 0: "Advocate",
    }

    return category_mapping.get(prediction_id, "Unknown")

def extract_files_from_zip(zip_file_path):
    # Create a temporary directory for extracted files
    extract_to_dir = "extracted_files"
    os.makedirs(extract_to_dir, exist_ok=True)
    extracted_files = []

    try:
        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to_dir)  # Extract to temp directory
            for file in zip_ref.namelist():
                # Skip unwanted system files or directories
                if '__MACOSX' in file or file.endswith('/'):
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
    "Java", "Spring Boot", "J2EE", "Hibernate", "Microservices", "RESTful APIs", "Git", "Maven", "JUnit",
    "Manual Testing", "Automation Testing", "Selenium", "JIRA", "Postman", "TestNG", "LoadRunner", "API Testing",
    "AWS", "Docker", "Kubernetes", "CI/CD", "Jenkins", "Ansible", "Terraform", "Linux", "Python",
    "Django", "Flask", "Pandas", "NumPy", "Machine Learning", "APIs", "SQL",
    "HTML", "CSS", "JavaScript", "Responsive Design", "UI/UX", "Adobe XD", "Figma", "Bootstrap", "React", "jQuery",
    "Recruitment", "Employee Relations", "Payroll", "HR Policies", "Performance Management", "Training & Development", "Onboarding",
    "Hadoop", "MapReduce", "Hive", "Pig", "HDFS", "Big Data", "Spark", "YARN", "HBase",
    "Blockchain", "Ethereum", "Smart Contracts", "Solidity", "Cryptography", "Decentralized Apps", "Hyperledger",
    "ETL", "Informatica", "Data Warehousing", "Data Modeling", "SSIS", "Data Integration", "Oracle",
    "Project Management", "Operations", "Lean Management", "Supply Chain", "Six Sigma", "Process Improvement", "Leadership",
    "R", "Data Visualization", "Scikit-Learn", "Statistics",
    "Sales Strategy", "Negotiation", "CRM", "Lead Generation", "Customer Service", "Cold Calling", "Presentation Skills",
    "CAD", "SolidWorks", "Thermodynamics", "Mechanics", "Manufacturing", "Material Science",
    "Creative Thinking", "Visual Arts", "Adobe Photoshop", "Illustration", "Graphic Design", "Painting", "Sculpture",
    "Database Management", "SQL Server", "MongoDB", "Oracle DB", "Database Design",
    "Electrical Circuit Design", "Power Systems", "Control Systems", "Electrical Safety", "PLC Programming",
    "Health and Wellness", "Nutrition", "Exercise Science", "Personal Training", "Physical Therapy",
    "Project Management Office", "Portfolio Management", "Stakeholder Management", "Risk Assessment",
    "Data Analysis", "Excel", "Business Intelligence", "Tableau", "Power BI",
    "C#", ".NET Framework", "ASP.NET", "MVC", "Entity Framework", "LINQ", "WPF",
    "Test Automation", "Scripting", "Load Testing", "UFT", "Quality Assurance",
    "Network Security", "Cybersecurity", "Firewalls", "VPN", "Intrusion Detection", "Risk Management",
    "SAP ERP", "SAP HANA", "SAP MM", "SAP SD", "SAP FICO",
    "Civil Engineering", "Structural Analysis", "AutoCAD", "Construction Management", "Surveying",
    "Legal Research", "Case Management", "Client Consultation", "Litigation"
]


# Pydantic models
class ResumeAnalysis(BaseModel):
    name: str
    email: str
    contact: str = None
    predicted_field: str
    college: str = None
    work_experience: str = None
    skills: List[str] = []
    upload_date: datetime = datetime.now()

# Helper functions (reuse your existing functions)
def clean_resume(txt):
    cleantxt = re.sub('https\S+', '', txt)
    cleantxt = re.sub(r'@\S+|#\S+', '', cleantxt)
    cleantxt = re.sub(r'[^\w\s]', '', cleantxt)
    doc = nlp(cleantxt)
    tokens = [token.lemma_.lower() for token in doc if token.text.lower() not in stop_words]
    return ' '.join(tokens)

# Include all your other helper functions here (extract_text_from_pdf, is_valid_resume, etc.)
# Just copy them from your original code

@app.post("/analyze-resume/")
async def analyze_resume(file: UploadFile = File(...)):
    try:
        # Ensure skills are initialized
        await init_skills()
        skills_list = await get_skills_list()
        
        # Create temporary file
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if file.filename.endswith('.pdf'):
            resume_text = extract_text_from_pdf(temp_file)
        else:
            with open(temp_file, 'r', encoding='utf-8', errors='ignore') as f:
                resume_text = f.read()

        # Remove temporary file
        os.remove(temp_file)

        if not is_valid_resume(resume_text):
            raise HTTPException(status_code=400, detail="Invalid resume format")

        # Extract information
        name, email = extract_name_and_email(resume_text)
        contact = extract_contact_number_from_resume(resume_text)
        work_experience = extract_work_experience(resume_text)
        skills = extract_skills_from_resume(resume_text, skills_list)
        college = extract_college_name(resume_text)

        # Predict category
        cleaned_resume = clean_resume(resume_text)
        predicted_category = predict_category(cleaned_resume)

        # Create analysis result
        analysis = ResumeAnalysis(
            name=name,
            email=email,
            contact=contact,
            predicted_field=predicted_category,
            college=college,
            work_experience=work_experience,
            skills=skills
        )

        # Save to MongoDB
        await resume_collection.insert_one(analysis.dict())

        return analysis

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/resumes/")
async def get_resumes():
    resumes = await resume_collection.find().to_list(1000)
    return resumes

@app.get("/resumes/{category}")
async def get_resumes_by_category(category: str):
    resumes = await resume_collection.find({"predicted_field": category}).to_list(1000)
    return resumes

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
