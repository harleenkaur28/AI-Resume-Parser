import streamlit as st
import zipfile
import pickle
import re
import pandas as pd
import nltk
import spacy
import mysql.connector 
from nltk.corpus import stopwords
from PyPDF2 import PdfReader
import os

nlp = spacy.load('en_core_web_sm')
nltk.download('punkt')
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

clf = pickle.load(open('best_model.pkl', 'rb'))
tfidf_vectorizer = pickle.load(open('tfidf.pkl', 'rb'))

def clean_resume(txt):
    """Clean the resume text by removing unwanted characters and lemmatizing."""
    cleantxt = re.sub('https\S+', '', txt)
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
connection = mysql.connector.connect(
   host='localhost', user='root', password='', port=3307, database='SRA'
)
cursor = connection.cursor()

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

def main():
    st.title("Resume Analyzer")
    st.markdown("""
        <style>
        .center-table {
            display: flex;
            justify-content: center;
        }
        </style>
    """, unsafe_allow_html=True)

    st.subheader("Upload Your Resume or a ZIP File Containing Multiple Resumes")
    uploaded_files = st.file_uploader('Upload Resume or ZIP File', type=['txt', 'pdf', 'zip'], accept_multiple_files=True)

    DB_table_name = 'user_data'
    drop_table_sql = f"DROP TABLE IF EXISTS {DB_table_name};"
    cursor.execute(drop_table_sql)

    create_table_sql = f"""
    CREATE TABLE {DB_table_name} (
    ID INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email_ID VARCHAR(50) NOT NULL,
    Contact VARCHAR(15),
    Predicted_Field VARCHAR(25) NOT NULL,
    College VARCHAR(200),
    Work_Experience TEXT,  
    PRIMARY KEY (ID)
);
    """
    cursor.execute(create_table_sql)

    if uploaded_files:
        results = []
        for uploaded_file in uploaded_files:
            if uploaded_file.type == 'application/zip':  
                with open(uploaded_file.name, "wb") as f:
                    f.write(uploaded_file.getbuffer())

                zip_files = extract_files_from_zip(uploaded_file.name)
                for zip_file in zip_files:
                    if zip_file.endswith('.pdf'):
                        resume_text = extract_text_from_pdf(zip_file)
                    else:
                        with open(zip_file, 'r', encoding='utf-8', errors='ignore') as file:
                            resume_text = file.read()

                    if not is_valid_resume(resume_text):
                        st.warning(f"Resume Could Not Be Parsed:\n{zip_file}")
                    else:
                        name, email = extract_name_and_email(resume_text)
                        contact = extract_contact_number_from_resume(resume_text)
                        work_experience_info = extract_work_experience(resume_text)
                        extracted_skills = extract_skills_from_resume(resume_text, skills_list)
                        skills_text = ', '.join(extracted_skills)
                        college_name = extract_college_name(resume_text)

                        st.header("**Resume Analysis**")
                        st.success(f"Hello {name}")
                        st.subheader("**Your Basic Info**")
                        st.text(f'Name: {name}')
                        st.text(f'Email: {email}')
                        st.text(f'Phone no: {str(contact)}')
                        st.text(f'College: {college_name}')
                        st.text(f'Skills: {skills_text}')
                        st.text(f'Work Experience: {work_experience_info}')

                        cleaned_resume = clean_resume(resume_text)
                        predicted_category = predict_category(cleaned_resume)

                        st.text(f'Predicted Category: {predicted_category}')

                        insert_sql = f"""
                        INSERT INTO {DB_table_name} (Name, Email_ID,Contact, Predicted_Field, Work_Experience, College)
                        VALUES (%s, %s, %s, %s, %s, %s);
                        """
                        cursor.execute(insert_sql, (name, email,contact, predicted_category,  work_experience_info, college_name))
                        results.append({
                            'File Name': zip_file,
                            'Name': name,
                            'Email': email,
                            'Contact': contact,
                            'Predicted Category': predicted_category,
                            'College': college_name
                        })

                os.remove(uploaded_file.name)  # Remove the uploaded ZIP after extraction

            else:  
                with open(uploaded_file.name, "wb") as f:
                    f.write(uploaded_file.getbuffer())

                if uploaded_file.type == 'application/pdf':
                    resume_text = extract_text_from_pdf(uploaded_file.name)
                    print(resume_text)
                else:
                    with open(uploaded_file.name, 'r', encoding='utf-8', errors='ignore') as file:
                        resume_text = file.read()
                if not is_valid_resume(resume_text):
                    st.warning(f"Resume Could Not Be Parsed:\n{uploaded_file.name}")
                else:
                    name, email = extract_name_and_email(resume_text)
                    contact = extract_contact_number_from_resume(resume_text)
                    work_experience_info = extract_work_experience(resume_text)
                    extracted_skills = extract_skills_from_resume(resume_text, skills_list)
                    skills_text = ', '.join(extracted_skills)
                    college_name = extract_college_name(resume_text)

                    st.header("**Resume Analysis**")
                    st.success(f"Hello {name}")
                    st.subheader("**Your Basic Info**")
                    st.text(f'Name: {name}')
                    st.text(f'Email: {email}')
                    st.text(f'Phone no: {str(contact)}')
                    st.text(f'College: {college_name}')
                    st.text(f'Skills: {skills_text}')
                    st.text(f'Work Experience: {work_experience_info}')

                cleaned_resume = clean_resume(resume_text)
                if not is_valid_resume(cleaned_resume):
                    pass
                else:
                    predicted_category = predict_category(cleaned_resume)

                    st.text(f'Predicted Category: {predicted_category}')
                    insert_sql = f"""
                    INSERT INTO {DB_table_name} (Name, Email_ID, Contact,Predicted_Field,  Work_Experience, College)
                    VALUES (%s, %s, %s, %s, %s, %s);
                    """
                    cursor.execute(insert_sql, (name, email, contact, predicted_category,  work_experience_info, college_name))
                    results.append({
                        'File Name': uploaded_file.name,
                        'Name': name,
                        'Email': email,
                        'Contact': contact,
                        'Predicted Category': predicted_category,
                        'College': college_name
                    })

                os.remove(uploaded_file.name) 

        if results:
            st.subheader("Uploaded Resumes and Analysis Results")
            df = pd.DataFrame(results)
            st.table(df)

    connection.commit()
    cursor.close()
    connection.close()

if __name__ == "__main__":
    main()