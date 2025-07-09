from app.services import utils


async def parse_jd(jd_text: str):
    required_skills = [s.strip() for s in jd_text.split(",") if s.strip()]
    optional_skills = []
    return {
        "required_skills": required_skills,
        "optional_skills": optional_skills,
    }, None


async def parse_resume(resume_text: str):
    cleaned = utils.clean_resume(resume_text)
    name, email = utils.extract_name_and_email(resume_text)
    phone = utils.extract_contact_number_from_resume(resume_text)
    college = utils.extract_college_name(resume_text)
    education = utils.extract_education_info(resume_text)
    work_experience = utils.extract_work_experience(resume_text)
    projects = utils.extract_projects(resume_text)
    skills = []
    x = [0.0]
    feats = {
        "name": name,
        "email": email,
        "phone": phone,
        "college": college,
        "education": education,
        "experience": work_experience,
        "projects": projects,
        "skills": skills,
        "x": x,
    }
    return feats, None
