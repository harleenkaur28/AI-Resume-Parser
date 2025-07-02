from langchain.prompts import PromptTemplate
from app.core.llm import llm

text_formater_template_str = """
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

text_formater_template = PromptTemplate(
    input_variables=["raw_resume_text"],
    template=text_formater_template_str,
)

text_formater_chain = text_formater_template | llm
