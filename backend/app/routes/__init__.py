from fastapi import APIRouter
from .resume import router as resume_router
from .hiring import router as hiring_router
from .cold_mail import router as cold_mail_router
from .tips import router as tips_router

# Create versioned routers
v1_router = APIRouter(prefix="/v1")
v2_router = APIRouter(prefix="/v2")

# Include all routers in v1
v1_router.include_router(resume_router)
v1_router.include_router(hiring_router)
v1_router.include_router(cold_mail_router)
v1_router.include_router(tips_router)

# Include all routers in v2
v2_router.include_router(resume_router)
v2_router.include_router(hiring_router)
v2_router.include_router(cold_mail_router)
v2_router.include_router(tips_router)

# Create main router
router = APIRouter()
router.include_router(v1_router)
router.include_router(v2_router)

__all__ = ["router", "v1_router", "v2_router"]
