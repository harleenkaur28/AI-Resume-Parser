import os
import tempfile
from typing import Tuple, Optional
from PyPDF2 import PdfReader
from docx import Document
import io
from fastapi import UploadFile


def get_file_extension(filename: Optional[str]) -> str:
    """Get file extension from filename."""
    if not filename:
        return ""
    return os.path.splitext(filename)[1].lower()


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file."""
    pdf_file = io.BytesIO(file_content)
    pdf_reader = PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file."""
    docx_file = io.BytesIO(file_content)
    doc = Document(docx_file)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text


def process_document(file: UploadFile) -> Tuple[str, str]:
    """Process uploaded document and return its text content and file extension."""
    file_content = file.file.read()
    file_extension = get_file_extension(file.filename)

    if file_extension == ".pdf":
        text = extract_text_from_pdf(file_content)
    elif file_extension == ".docx":
        text = extract_text_from_docx(file_content)
    elif file_extension in [".txt", ".md"]:
        text = file_content.decode("utf-8")
    else:
        raise ValueError(f"Unsupported file format: {file_extension}")

    return text, file_extension


def extract_files_from_zip(zip_file_path: str) -> list:
    """Extract files from a ZIP archive."""
    import zipfile

    extracted_files = []

    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        # Create a temporary directory for extraction
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_ref.extractall(temp_dir)

            # Process each extracted file
            for root, _, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    if file.lower().endswith((".pdf", ".docx")):
                        with open(file_path, "rb") as f:
                            file_content = f.read()
                            extracted_files.append((file, file_content))

    return extracted_files
