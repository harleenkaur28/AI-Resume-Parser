from langchain.prompts import PromptTemplate
from app.core.llm import llm


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


cold_main_generator_chain = cold_mail_prompt | llm
