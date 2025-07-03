from app.core.config import google_api_key
from app.core.llm import llm
from app.data.ai.txt_processor import text_formater_chain
from app.data.ai.json_extractor import josn_formatter_chain
from app.data.ai.comprehensive_analysis import comprensive_analysis_chain
from app.data.ai.format_analyse import format_analyse_chain
import json


class LLMNotFoundError(Exception):
    """Exception raised when the specified LLM provider or model is not found."""

    def __init__(self, message="LLM provider or model not found"):
        super().__init__(message)


def format_resume_text_with_llm(
    raw_text: str,
) -> str:
    """Formats the extracted resume text using an LLM."""

    if not raw_text.strip():
        return ""

    try:
        result = text_formater_chain.invoke(
            {
                "raw_resume_text": raw_text,
            }
        )
        try:
            formatted_text = (
                result if isinstance(result, str) else getattr(result, "content", "")
            )
        except:
            formatted_text = str(result.content)

        return formatted_text.strip()

    except ValueError as ve:
        error_msg = str(ve)
        return raw_text

    except Exception as e:
        error_msg = f"Error formatting resume text: {str(e)}"

        if "rate limit" in str(e).lower():
            error_msg += "\nYou may have hit API rate limits. Using original text."

        elif "authentication" in str(e).lower() or "unauthorized" in str(e).lower():
            error_msg += "\nAPI authentication issue. Using original text."

        return raw_text


def format_resume_json_with_llm(
    resume_json: dict,
    extracted_resume_text: str,
) -> dict | None:
    """Formats the extracted resume JSON using an LLM."""

    if not resume_json or not extracted_resume_text.strip():
        return {}

    try:
        result = josn_formatter_chain.invoke(
            {
                "resume_json": resume_json,
                "extracted_resume_text": extracted_resume_text,
            }
        )
        result = str(result.content)

        if result.strip().startswith("```json"):
            result = result.strip().removeprefix("```json").removesuffix("```").strip()

            return json.loads(result)

        elif result.strip().startswith("{"):
            result = result.strip()

            return json.loads(result)

        else:
            result = result.strip()

            start_index = result.find("{")
            end_index = result.rfind("}") + 1

            result = result[start_index:end_index]

            error_flag = len(result) < 0

            try:
                return (json.loads(result))

            except json.JSONDecodeError:
                error_flag = True

            if error_flag:
                print(
                    "Error formatting resume JSON: Invalid JSON format in LLM response."
                )
                return {}

    except ValueError as ve:
        error_msg = str(ve)
        print(f"ValueError in format_resume_json_with_llm: {error_msg}")
        return {}

    except Exception as e:
        error_msg = f"Error formatting resume JSON: {str(e)}"
        print(f"Exception in format_resume_json_with_llm: {error_msg}")
        return {}


def comprehensive_analysis_llm(
    resume_text: str,
    predicted_category: str,
    basic_info: dict,
) -> dict:
    """Performs a comprehensive analysis of the resume using LLM."""

    if not resume_text:
        return {}

    basic_info_json_str = json.dumps(basic_info)

    result = comprensive_analysis_chain.invoke(
        {
            "extracted_resume_text": resume_text,
            "basic_info_json": basic_info_json_str,
            "predicted_category": predicted_category,
        }
    )
    try:
        if isinstance(result, dict):
            formatted_json = result
        else:
            raw_responce = getattr(result, "content", {})
            formatted_json = raw_responce
        if (
            not formatted_json
            and isinstance(raw_responce, str)
            and raw_responce.strip().startswith("```json")
        ):
            try:
                json_str = (
                    raw_responce.strip().removeprefix("```json").removesuffix("```").strip()
                )
                formatted_json = json.loads(json_str)

            except Exception:
                formatted_json = {}

    if formatted_json is None:
        return {}
    
    return formatted_json


def format_and_analyse_resumes(
    raw_text: str,
    basic_info: dict,
) -> dict:
    """Formats and analyses the resume text and JSON using LLM."""

    if not raw_text.strip():
        return {}

    result = format_analyse_chain.invoke(
        {
            "extracted_resume_text": raw_text,
            "basic_info_json": json.dumps(basic_info),
        }
    )
    if isinstance(result, dict):
        formatted_json = result
    else:
        raw_responce = getattr(result, "content", {})
        formatted_json = raw_responce
    if (
        not formatted_json
        and isinstance(raw_responce, str)
        and raw_responce.strip().startswith("```json")
    ):
        try:
            json_str = (
                raw_responce.strip().removeprefix("```json").removesuffix("```").strip()
            )
            formatted_json = json.loads(json_str)

        except Exception:
            formatted_json = {}

    return formatted_json
