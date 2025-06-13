import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RoleDB(BaseModel):
    id: uuid.UUID
    name: str

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    role_name: str = "user"


class UserInDBBase(UserBase):
    id: uuid.UUID
    role_id: uuid.UUID
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class UserInDB(UserInDBBase):
    hashed_password: str


class UserPublic(UserInDBBase):
    role: RoleDB


class EmailVerificationDB(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    token: str
    expires_at: datetime
    created_at: datetime
    confirmed_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# --- Token Models ---
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[EmailStr] = None
    user_id: Optional[str] = None
