import re
from typing import List, Optional, Dict
import spacy
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from ..config import settings

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Download if not available
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Download NLTK resources
try:
    stop_words = set(stopwords.words("english"))
except LookupError:
    import nltk

    nltk.download("stopwords")
    nltk.download("punkt")
    stop_words = set(stopwords.words("english"))


def clean_resume(text: str) -> str:
    """Clean the resume text by removing unwanted characters and lemmatizing."""
    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    # Remove email addresses
    text = re.sub(r"\S+@\S+", "", text)
    # Remove special characters and extra whitespace
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    # Lemmatize
    doc = nlp(text)
    text = " ".join([token.lemma_ for token in doc])
    return text.strip()


def extract_name_and_email(text: str) -> Dict[str, Optional[str]]:
    """Extract name and email from resume text."""
    # Extract email
    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
    email_match = re.search(email_pattern, text)
    email = email_match.group(0) if email_match else None

    # Extract name (simple heuristic - first line without email)
    lines = text.split("\n")
    name = None
    for line in lines:
        line = line.strip()
        if line and not re.search(email_pattern, line):
            name = line
            break

    return {"name": name, "email": email}


def extract_contact_number(text: str) -> Optional[str]:
    """Extract contact number from resume text."""
    # Common phone number patterns
    patterns = [
        r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",  # 123-456-7890
        r"\b\+\d{1,3}[-.]?\d{3}[-.]?\d{3}[-.]?\d{4}\b",  # +1-123-456-7890
        r"\b\(\d{3}\)[-.]?\d{3}[-.]?\d{4}\b",  # (123)456-7890
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return None


def extract_skills(text: str) -> List[str]:
    """Extract skills from resume text."""
    # Clean and tokenize text
    cleaned_text = clean_resume(text)
    tokens = word_tokenize(cleaned_text.lower())

    # Remove stopwords and short words
    tokens = [token for token in tokens if token not in stop_words and len(token) > 2]

    # Match against skills list
    found_skills = []
    for skill in settings.SKILLS_LIST:
        if skill.lower() in tokens or skill.lower() in cleaned_text.lower():
            found_skills.append(skill)

    return list(set(found_skills))  # Remove duplicates


def extract_education(text: str) -> List[str]:
    """Extract education information from resume text."""
    education_keywords = [
        "university",
        "college",
        "institute",
        "school",
        "bachelor",
        "master",
        "phd",
        "degree",
        "diploma",
    ]

    lines = text.split("\n")
    education_lines = []

    for line in lines:
        line = line.lower()
        if any(keyword in line for keyword in education_keywords):
            education_lines.append(line.strip())

    return education_lines


def extract_work_experience(text: str) -> List[str]:
    """Extract work experience from resume text."""
    experience_keywords = [
        "experience",
        "work",
        "employment",
        "job",
        "intern",
        "internship",
        "position",
        "role",
    ]

    lines = text.split("\n")
    experience_lines = []
    in_experience_section = False

    for line in lines:
        line = line.lower()
        if any(keyword in line for keyword in experience_keywords):
            in_experience_section = True
        elif in_experience_section and line.strip():
            experience_lines.append(line.strip())
        elif in_experience_section and not line.strip():
            in_experience_section = False

    return experience_lines


def extract_projects(text: str) -> List[str]:
    """Extract projects from resume text."""
    project_keywords = [
        "project",
        "portfolio",
        "work",
        "development",
        "built",
        "created",
        "developed",
        "implemented",
    ]

    lines = text.split("\n")
    project_lines = []
    in_project_section = False

    for line in lines:
        line = line.lower()
        if any(keyword in line for keyword in project_keywords):
            in_project_section = True
        elif in_project_section and line.strip():
            project_lines.append(line.strip())
        elif in_project_section and not line.strip():
            in_project_section = False

    return project_lines


def is_valid_resume(text: str) -> bool:
    """Check if the text is a valid resume."""
    # Basic validation checks
    if not text or len(text) < 100:  # Minimum length check
        return False

    # Check for common resume sections
    required_sections = ["experience", "education", "skills"]
    text_lower = text.lower()

    return any(section in text_lower for section in required_sections)
