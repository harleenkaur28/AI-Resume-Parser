from core.config import google_api_key
from core.llm import llm
from data.ai.txt_processor import text_formater_chain as chain


def format_resume_text_with_llm(
    raw_text: str,
    model_provider="Google",
    model_name="gemini-2.0-flash",
    api_keys_dict={
        "Google": google_api_key,
    },
) -> str:
    """Formats the extracted resume text using an LLM."""

    if not raw_text.strip():
        return ""

    try:
        result = chain.invoke(
            {
                "raw_resume_text": raw_text,
            }
        )
        formatted_text = (
            result if isinstance(result, str) else getattr(result, "content", "")
        )
        return formatted_text.strip()

    except ValueError as ve:
        error_msg = str(ve)
        provider_help = {
            "Google": "Verify your Google API key at https://aistudio.google.com/app/apikey",
            "OpenAI": "Verify your OpenAI API key at https://platform.openai.com/api-keys",
            "Claude": "Verify your Anthropic API key at https://console.anthropic.com/",
        }
        return raw_text

    except Exception as e:
        error_msg = f"Error formatting resume text: {str(e)}"

        if "rate limit" in str(e).lower():
            error_msg += "\n💡 You may have hit API rate limits. Using original text."

        elif "authentication" in str(e).lower() or "unauthorized" in str(e).lower():
            error_msg += "\n💡 API authentication issue. Using original text."

        return raw_text
