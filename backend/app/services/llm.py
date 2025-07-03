from time import process_time_ns
from nltk import pr
from app.core.config import google_api_key
from app.core.llm import llm
from app.data.ai.txt_processor import text_formater_chain
from app.data.ai.json_extractor import josn_formatter_chain
from app.data.ai.comprehensive_analysis import comprensive_analysis_chain
from app.data.ai.format_analyse import format_analyse_chain
from app.data.ai.ats_analysis import ats_analysis_chain
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
        # print(formatted_text)
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
            loaded = json.loads(result)

            if not isinstance(loaded, dict):
                return {}

            return loaded

        elif result.strip().startswith("{"):
            result = result.strip()
            loaded = json.loads(result)

            if not isinstance(loaded, dict):
                return {}

            return loaded

        else:
            result = result.strip()
            start_index = result.find("{")
            end_index = result.rfind("}") + 1
            result = result[start_index:end_index]
            error_flag = len(result) < 0

            try:
                loaded = json.loads(result)
                if not isinstance(loaded, dict):
                    return {}
                return loaded

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
) -> dict | None:
    """Performs a comprehensive analysis of the resume using LLM."""

    if not resume_text:
        return {}

    basic_info_json_str = json.dumps(basic_info)
    # print("hello")

    result = comprensive_analysis_chain.invoke(
        {
            "extracted_resume_text": resume_text,
            "basic_info_json": basic_info_json_str,
            "predicted_category": predicted_category,
        }
    )
    if isinstance(result, dict):
        formatted_json = result
        # print("i am the one 11111\n\n\n", formatted_json)

    else:
        raw_responce = str(result.content)
        if raw_responce.strip().startswith("```json"):
            result = (
                raw_responce.strip().removeprefix("```json").removesuffix("```").strip()
            )
            try:
                formatted_json = json.loads(result)
                # print(formatted_json)

            except json.JSONDecodeError:
                formatted_json = {}

        elif raw_responce.strip().startswith("{"):
            result = raw_responce.strip()
            try:
                formatted_json = json.loads(result)
                # print(formatted_json)

            except json.JSONDecodeError:
                formatted_json = {}

        else:
            result = raw_responce.strip()
            start_index = result.find("{")
            end_index = result.rfind("}") + 1
            result = result[start_index:end_index]
            try:
                formatted_json = json.loads(result)

            except json.JSONDecodeError:
                formatted_json = {}

        if formatted_json is None or not isinstance(formatted_json, dict):
            return {}

        return formatted_json

    if (
        not formatted_json
        and isinstance(result, str)
        and result.strip().startswith("```json")
    ):
        try:
            json_str = (
                result.strip().removeprefix("```json").removesuffix("```").strip()
            )
            formatted_json = json.loads(json_str)
            # print("tum sab chutiye mai tha \n\n\n", formatted_json)

        except Exception:
            formatted_json = {}


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
        raw_responce = str(result.content)
        if raw_responce.strip().startswith("```json"):
            result = (
                raw_responce.strip().removeprefix("```json").removesuffix("```").strip()
            )
            try:
                formatted_json = json.loads(result)

            except json.JSONDecodeError:
                formatted_json = {}

        elif raw_responce.strip().startswith("{"):
            result = raw_responce.strip()
            try:
                formatted_json = json.loads(result)

            except json.JSONDecodeError:
                formatted_json = {}

        else:
            result = raw_responce.strip()
            start_index = result.find("{")
            end_index = result.rfind("}") + 1
            result = result[start_index:end_index]
            try:
                formatted_json = json.loads(result)

            except json.JSONDecodeError:
                formatted_json = {}

        if formatted_json is None or not isinstance(formatted_json, dict):
            return {}

        return formatted_json

    if (
        not formatted_json
        and isinstance(result, str)
        and result.strip().startswith("```json")
    ):
        try:
            json_str = (
                result.strip().removeprefix("```json").removesuffix("```").strip()
            )
            formatted_json = json.loads(json_str)

        except Exception:
            formatted_json = {}

    if formatted_json is None or not isinstance(formatted_json, dict):
        return {}

    return formatted_json


def ats_analysis_llm(resume_text: str, jd_text: str) -> dict:
    """Performs ATS scoring and analysis using LLM."""
    if not resume_text.strip() or not jd_text.strip():
        return {}
    result = ats_analysis_chain.invoke(
        {
            "resume_text": resume_text,
            "jd_text": jd_text,
        }
    )
    if isinstance(result, dict):
        return result
    raw_response = str(result.content) if hasattr(result, "content") else str(result)
    if raw_response.strip().startswith("```json"):
        raw_response = raw_response.strip().removeprefix("```json").removesuffix("```")
    try:
        parsed = json.loads(raw_response)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass
    # fallback: try to extract JSON substring
    start = raw_response.find("{")
    end = raw_response.rfind("}") + 1
    if start != -1 and end != -1:
        try:
            parsed = json.loads(raw_response[start:end])
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass
    return {}
