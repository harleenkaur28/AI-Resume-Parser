from typing import Dict, List, Optional, Union
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from ..config import settings


def format_resume_text_with_llm(
    raw_text: str,
    model_provider: str = "Google",
    model_name: str = "gemini-2.0-flash",
    api_keys_dict: Dict[str, str] = None,
) -> str:
    """Format resume text using LLM."""
    if model_provider == "Google":
        llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_keys_dict.get("Google"),
            temperature=0.1,
        )

        prompt = PromptTemplate(
            input_variables=["text"],
            template="""
            Please format and clean the following resume text. Remove any unnecessary formatting,
            standardize the structure, and ensure it's well-organized. Keep all important information
            but make it more readable and professional.
            
            Resume text:
            {text}
            
            Formatted resume:
            """,
        )

        formatted_text = llm.predict(prompt.format(text=raw_text))
        return formatted_text

    return raw_text


def predict_category(cleaned_resume: str) -> str:
    """Predict the job category from resume text."""
    # This is a placeholder - in a real implementation, you would use an LLM or ML model
    # to predict the category based on the resume content
    categories = [
        "Software Development",
        "Data Science",
        "Product Management",
        "Design",
        "Marketing",
        "Sales",
        "Finance",
        "Human Resources",
        "Operations",
        "Other",
    ]

    # For now, return a default category
    return "Software Development"


def get_company_research(company_name: str, url: str) -> str:
    """Get research information about a company."""
    # This is a placeholder - in a real implementation, you would:
    # 1. Scrape the company website
    # 2. Use an API to get company information
    # 3. Use an LLM to summarize the information
    return f"Research information about {company_name}"


def get_llm_response(
    prompt: str,
    model_provider: str = "Google",
    model_name: str = "gemini-2.0-flash",
    temperature: float = 0.1,
) -> str:
    """Get response from LLM."""
    if model_provider == "Google":
        llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            google_api_key=settings.GOOGLE_API_KEY,
        )
        response = llm.invoke(prompt)
        if isinstance(response, list):
            return response[0] if response else ""
        return str(response)
    else:
        raise ValueError(f"Unsupported model provider: {model_provider}")


def parse_llm_json_response(response_content: str) -> Dict:
    """Parse LLM response that contains JSON."""
    if not isinstance(response_content, str):
        response_content = str(response_content)

    # Remove markdown code block if present
    if response_content.strip().startswith("```json"):
        response_content = response_content.strip()[7:]
    if response_content.strip().endswith("```"):
        response_content = response_content.strip()[:-3]

    try:
        return json.loads(response_content)
    except json.JSONDecodeError:
        return {
            "error": "Failed to parse LLM response",
            "raw_content": response_content[:500] + "...",
        }


def generate_cold_mail_content(
    resume_text: str,
    recipient_name: str,
    recipient_designation: str,
    company_name: str,
    sender_name: str,
    sender_role_or_goal: str,
    key_points_to_include: str,
    additional_info_for_llm: str = "",
    company_research: str = "",
    model_provider: str = "Google",
    model_name: str = "gemini-2.0-flash",
) -> Dict[str, str]:
    """Generate cold email content."""
    prompt = PromptTemplate.from_template(
        """Generate a professional cold email based on the following information:
        Resume: {resume_text}
        Recipient Name: {recipient_name}
        Recipient Designation: {recipient_designation}
        Company: {company_name}
        Sender Name: {sender_name}
        Sender Role/Goal: {sender_role_or_goal}
        Key Points to Include: {key_points}
        Additional Context: {additional_info}
        Company Research: {company_research}
        
        Provide response in JSON format:
        {{
            "subject": "email subject",
            "body": "email body"
        }}
        """
    )

    formatted_prompt = prompt.format(
        resume_text=resume_text,
        recipient_name=recipient_name,
        recipient_designation=recipient_designation,
        company_name=company_name,
        sender_name=sender_name,
        sender_role_or_goal=sender_role_or_goal,
        key_points=key_points_to_include,
        additional_info=additional_info_for_llm,
        company_research=company_research,
    )

    response = get_llm_response(formatted_prompt, model_provider, model_name)
    return parse_llm_json_response(response)


def generate_cold_mail_edit_content(
    resume_text: str,
    recipient_name: str,
    recipient_designation: str,
    company_name: str,
    sender_name: str,
    sender_role_or_goal: str,
    key_points_to_include: str,
    additional_info_for_llm: str = "",
    company_research: str = "",
    previous_email_subject: str = "",
    previous_email_body: str = "",
    edit_instructions: str = "",
    model_provider: str = "Google",
    model_name: str = "gemini-2.0-flash",
) -> Dict[str, str]:
    """Edit existing cold email content."""
    prompt = PromptTemplate.from_template(
        """Edit the following cold email based on the instructions:
        Resume: {resume_text}
        Recipient Name: {recipient_name}
        Recipient Designation: {recipient_designation}
        Company: {company_name}
        Sender Name: {sender_name}
        Sender Role/Goal: {sender_role_or_goal}
        Key Points to Include: {key_points}
        Additional Context: {additional_info}
        Company Research: {company_research}
        Previous Email Subject: {previous_subject}
        Previous Email Body: {previous_body}
        Edit Instructions: {edit_instructions}
        
        Provide response in JSON format:
        {{
            "subject": "edited email subject",
            "body": "edited email body"
        }}
        """
    )

    formatted_prompt = prompt.format(
        resume_text=resume_text,
        recipient_name=recipient_name,
        recipient_designation=recipient_designation,
        company_name=company_name,
        sender_name=sender_name,
        sender_role_or_goal=sender_role_or_goal,
        key_points=key_points_to_include,
        additional_info=additional_info_for_llm,
        company_research=company_research,
        previous_subject=previous_email_subject,
        previous_body=previous_email_body,
        edit_instructions=edit_instructions,
    )

    response = get_llm_response(formatted_prompt, model_provider, model_name)
    return parse_llm_json_response(response)


def generate_answers_for_geting_hired(
    resume_text: str,
    role: str,
    company: str,
    questions_list: List[str],
    word_limit: int = 150,
    model_provider: str = "Google",
    model_name: str = "gemini-2.0-flash",
    user_company_knowledge: str = "",
    company_research: str = "",
) -> Dict[str, str]:
    """Generate answers for interview questions."""
    prompt = PromptTemplate.from_template(
        """Based on the following resume and context, provide concise answers to the interview questions.
        Resume: {resume_text}
        Role: {role}
        Company: {company}
        Company Research: {company_research}
        User's Company Knowledge: {user_knowledge}
        Questions: {questions}
        Word Limit per Answer: {word_limit}
        
        Provide answers in JSON format:
        {{
            "question1": "answer1",
            "question2": "answer2",
            ...
        }}
        """
    )

    formatted_prompt = prompt.format(
        resume_text=resume_text,
        role=role,
        company=company,
        company_research=company_research,
        user_knowledge=user_company_knowledge,
        questions=json.dumps(questions_list),
        word_limit=word_limit,
    )

    response = get_llm_response(formatted_prompt, model_provider, model_name)
    return parse_llm_json_response(response)
