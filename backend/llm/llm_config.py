from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import LLMChain
from core.config import settings

from llm.prompts import (
    langchain_prompt,
    comprehensive_analysis_prompt,
    tips_generator_prompt,
)

llm = None

if settings.GOOGLE_API_KEY:
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.1,
        )

        print("Google Generative AI initialized successfully.")

    except Exception as e:

        print(
            f"Error initializing Google Generative AI: {e}. LLM functionality will be disabled."
        )

else:
    print(
        "Warning: GOOGLE_API_KEY not found. LLM functionality will be disabled.",
    )

basic_resume_parser_chain = None
comprehensive_analyzer_chain = None
tips_generator_chain = None

if llm:

    basic_resume_parser_chain = LLMChain(
        llm=llm,
        prompt=langchain_prompt,
    )

    comprehensive_analyzer_chain = LLMChain(
        llm=llm,
        prompt=comprehensive_analysis_prompt,
    )

    tips_generator_chain = LLMChain(
        llm=llm,
        prompt=tips_generator_prompt,
    )

    print(
        "LLM chains initialized.",
    )

else:
    print(
        "LLM chains not initialized as LLM is not available.",
    )
