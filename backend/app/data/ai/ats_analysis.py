from langchain_core.prompts import PromptTemplate
from app.core.llm import llm

ats_analysis_prompt_template_str = """
You are an expert ATS (Applicant Tracking System) and resume analysis assistant.
Given a candidate's resume and a job description, analyze the resume for:
- Required and optional keyword coverage
- Contact information completeness
- Content quality and structure
- ATS compatibility (fields present, formatting, etc.)
- Recommendations for improvement

**Job Description:**
{jd_text}

**Candidate Resume (Markdown):**
```
{resume_text}
```

Instructions:
1. Extract and list found and missing required/optional keywords from the JD.
2. Score the resume (0-1) for:
   - ATS compatibility (fields: name, email, phone, education, experience, skills)
   - Contact info (valid email, phone, LinkedIn)
   - Content quality (clarity, achievements, metrics)
   - Structure/formatting (sections, order, readability)
   - Required/optional keyword coverage
   - Keyword density (keywords per 100 words)
3. Provide a composite score (0-100) blending the above.
4. List strengths and areas for improvement.
5. Suggest actionable recommendations (title, description, category, priority, impact).
6. Output a summary sentence.

**Output:**
Return only a JSON object with these keys:
- composite (float, 0-100)
- semantic (float, 0-1, semantic similarity to JD)
- compatibility (float, 0-1)
- contact (float, 0-1)
- content (float, 0-1)
- req_keyword_cov (float, 0-1)
- opt_keyword_cov (float, 0-1)
- formatting (float, 0-1)
- keyword_density (float)
- found_keywords (list of str)
- missing_keywords (list of str)
- recommended_keywords (list of str)
- recommendations (list of objects: id, title, description, category, priority, impact)
- strengths (list of str)
- areas_for_improvement (list of str)
- industry_average (float)
- percentile (int)
- summary (str)
"""

ats_analysis_prompt = PromptTemplate(
    input_variables=[
        "resume_text",
        "jd_text",
    ],
    template=ats_analysis_prompt_template_str,
)

ats_analysis_chain = ats_analysis_prompt | llm
