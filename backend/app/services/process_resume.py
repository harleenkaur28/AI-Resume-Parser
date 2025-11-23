import os
import fitz
import pymupdf4llm
import re
from app.core.llm import MODEL_NAME


def _fallback_convert_to_text(file_bytes: bytes) -> str:
    """Fallback method to convert document bytes to plain text."""
    from google import genai
    from google.genai import types
    from dotenv import load_dotenv

    load_dotenv()

    client = genai.Client()

    prompt = (
        "Youn are a document conversion AI. Convert the following document to plain text.\n",
        "You don't talk about the conversion process, just provide the plain text output.\n",
        "MIND IT YOU ARE JUST SUPPOSED TO RETURN THE PLAIN OUTPUT.\n",
    )
    response = client.models.generate_content(
        model=MODEL_NAME + "-lite",
        contents=[
            types.Part.from_bytes(
                data=file_bytes,
                mime_type="application/pdf",
            ),
            "".join(prompt),
        ],
    )
    cleaned_output = response.text

    return str(cleaned_output)


def _convert_document_to_markdown(file_bytes: bytes, filetype: str) -> str:
    """Render document bytes to Markdown using PyMuPDF for consistent parsing."""
    with fitz.open(stream=file_bytes, filetype=filetype) as doc:
        return pymupdf4llm.to_markdown(
            doc,
            force_text=True,
            ignore_images=False,
            ignore_graphics=False,
            page_separators=False,
        )


def process_document(file_bytes, file_name):
    file_extension = os.path.splitext(file_name)[1].lower()
    try:
        if file_extension in {".txt", ".md"}:
            return file_bytes.decode()

        if file_extension in {".pdf", ".doc", ".docx"}:
            filetype = file_extension.lstrip(".")
            processed_txt = _convert_document_to_markdown(file_bytes, filetype)

            if not processed_txt.strip() and file_extension == ".pdf":
                return _fallback_convert_to_text(file_bytes)

            return processed_txt

        print(
            f"Unsupported file type: {file_extension}. Please upload TXT, MD, PDF, or DOCX."
        )
        return None

    except Exception as e:
        print(f"Error processing file {file_name}: {e}")
        return None


def is_valid_resume(text):
    if not text:
        return False
    resume_keywords = [
        "Experience",
        "Education",
        "Skills",
        "Profile",
        "Work History",
        "Projects",
        "Certifications",
    ]

    if any(re.search(keyword, text, re.I) for keyword in resume_keywords):
        return True

    return False


if __name__ == "__main__":
    # Example usage
    with open(
        "/Users/taf/Projects/TalentSync/TalentSync-Normies/backend/app/services/Tashif Ahmad Khan Resume.pdf",
        "rb",
    ) as f:
        file_bytes = f.read()
    text = process_document(file_bytes, "Tashif Ahmad Khan Resume.pdf")
    print(text)
