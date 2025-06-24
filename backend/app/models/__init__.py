from .resume import (
    WorkExperienceEntry,
    ProjectEntry,
    ResumeAnalysis,
    ResumeUploadResponse,
    ResumeListResponse,
    ResumeCategoryResponse,
)

from .analysis import (
    SkillProficiency,
    UIDetailedWorkExperienceEntry,
    UIProjectEntry,
    LanguageEntry,
    EducationEntry,
    ComprehensiveAnalysisData,
    ComprehensiveAnalysisResponse,
    FormattedAndAnalyzedResumeResponse,
)

from .hiring import (
    HiringAssistantRequest,
    HiringAssistantResponse,
    ColdMailRequest,
    ColdMailResponse,
)

from .tips import (
    Tip,
    TipsData,
    TipsResponse,
    TipsRequest,
)

from .error import ErrorResponse

__all__ = [
    # Resume models
    "WorkExperienceEntry",
    "ProjectEntry",
    "ResumeAnalysis",
    "ResumeUploadResponse",
    "ResumeListResponse",
    "ResumeCategoryResponse",
    # Analysis models
    "SkillProficiency",
    "UIDetailedWorkExperienceEntry",
    "UIProjectEntry",
    "LanguageEntry",
    "EducationEntry",
    "ComprehensiveAnalysisData",
    "ComprehensiveAnalysisResponse",
    "FormattedAndAnalyzedResumeResponse",
    # Hiring models
    "HiringAssistantRequest",
    "HiringAssistantResponse",
    "ColdMailRequest",
    "ColdMailResponse",
    # Tips models
    "Tip",
    "TipsData",
    "TipsResponse",
    "TipsRequest",
    # Error model
    "ErrorResponse",
]
