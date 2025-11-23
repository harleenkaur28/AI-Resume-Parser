"""cold_mail package exposing request/response models.

This package mirrors the previous location of ColdMailRequest and ColdMailResponse
which were defined in `app.models.schemas`. Import paths in other modules may
expect to import from `app.models.cold_mail.request` or from
`app.models.cold_mail`; we expose the original names for backward compatibility.
"""

from . import types, request, response

# re-export the model classes at package level for backward compatibility
from .request import ColdMailRequest
from .response import ColdMailResponse

__all__ = [
    "types",
    "request",
    "response",
    "ColdMailRequest",
    "ColdMailResponse",
]
