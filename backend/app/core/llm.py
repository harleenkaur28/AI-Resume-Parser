import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from app.core.config import google_api_key

llm = None
try:
    if not google_api_key:
        print(
            "Warning: GOOGLE_API_KEY not found in .env. LLM functionality will be disabled."
        )
    else:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=google_api_key,
            temperature=0.1,
        )

except Exception as e:
    print(
        f"Error initializing Google Generative AI: {e}. LLM functionality will be disabled."
    )

# Place prompt templates here as needed, e.g.:
# langchain_prompt = PromptTemplate(...)
