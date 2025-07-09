from langchain.prompts import PromptTemplate
from app.core.llm import llm


hiring_assistant_prompt_template_str = """
You are an expert interview coach and career advisor.

Below is the candidate's résumé (Markdown):
```
{resume}
```

They are applying for the role of **{role}** at **{company}**{company_context}.

Your task: craft a clear, concise answer (≤ {word_limit} words) to the interview question below.

Note: always use the first person to answer the question. act as the candidate. also use the resume supplemented with your own knowledge.

Question:
{question}

Formatting guidelines:
1. Start with a one-sentence summary of why this candidate is a great fit.
2. Then use 3–4 bullet points that each:
    - Reference a specific skill or achievement from the résumé  
    - Include metrics or outcomes whenever possible  
    - Tie back to the company's mission, values or culture  
3. Maintain a professional, confident tone.
4. If no {company_context} is provided, skip references to company culture.

Answer:
"""

hiring_assistant_prompt_template = PromptTemplate(
    input_variables=[
        "resume",
        "role",
        "company",
        "company_context",
        "question",
        "word_limit",
    ],
    template=hiring_assistant_prompt_template_str,
)

hiring_assistant_chain = hiring_assistant_prompt_template | llm
