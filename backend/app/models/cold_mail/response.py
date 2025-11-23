from typing import Optional
from pydantic import BaseModel


class ColdMailResponse(BaseModel):
    success: bool = True
    message: str = "Cold email content generated successfully."
    subject: str
    body: str
