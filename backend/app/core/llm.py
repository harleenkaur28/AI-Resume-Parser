from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import google_api_key

MODEL_PROVIDER = "google"

llm = None
MODEL_NAME = "gemini-2.0-flash"

faster_llm = None
FASTER_MODEL_NAME = "gemini-2.0-flash-lite"


try:
    if not google_api_key:
        print(
            "Warning: GOOGLE_API_KEY not found in .env. LLM functionality will be disabled."
        )
    else:
        llm = ChatGoogleGenerativeAI(
            model=MODEL_NAME,
            google_api_key=google_api_key,
            temperature=0.1,
        )
        faster_llm = ChatGoogleGenerativeAI(
            model=FASTER_MODEL_NAME,
            google_api_key=google_api_key,
            temperature=0.1,
        )

except Exception as e:
    print(
        f"Error initializing Google Generative AI: {e}. LLM functionality will be disabled."
    )

# Place prompt templates here as needed, e.g.:
# langchain_prompt = PromptTemplate(...)
