# /Users/taf/Projects/Resume Portal/backend/llm/llm_config.py
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import LLMChain
from core.config import settings  # Import the settings object
from llm.prompts import (  # Assuming prompts.py is in the same 'llm' directory
    langchain_prompt,
    comprehensive_analysis_prompt,
    tips_generator_prompt,
)

llm = None
if settings.GOOGLE_API_KEY:  # Use settings object
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",  # Updated model name
            google_api_key=settings.GOOGLE_API_KEY,  # Use settings object
            temperature=0.1,  # example temperature
        )
        print("Google Generative AI initialized successfully.")
    except Exception as e:
        print(
            f"Error initializing Google Generative AI: {e}. LLM functionality will be disabled."
        )
else:
    print("Warning: GOOGLE_API_KEY not found. LLM functionality will be disabled.")

# Initialize chains - they can be imported from here by other modules
basic_resume_parser_chain = None
comprehensive_analyzer_chain = None
tips_generator_chain = None

if llm:
    basic_resume_parser_chain = LLMChain(llm=llm, prompt=langchain_prompt)
    comprehensive_analyzer_chain = LLMChain(
        llm=llm, prompt=comprehensive_analysis_prompt
    )
    tips_generator_chain = LLMChain(llm=llm, prompt=tips_generator_prompt)
    print("LLM chains initialized.")
else:
    print("LLM chains not initialized as LLM is not available.")

# You might want to add functions here to easily invoke these chains if needed,
# or services that use these chains can import them directly.
