from langchain_core.prompts import PromptTemplate
from app.core.llm import llm


formatting_template_str = """
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

formatting_template = PromptTemplate(
    input_variables=[
        "resume_json",
        "extracted_resume_text",
    ],
    template=formatting_template_str,
)

josn_formatter_chain = formatting_template | llm

# to be used in analuse resume
