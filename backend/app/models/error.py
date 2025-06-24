from typing import Optional
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_detail: Optional[str] = None
