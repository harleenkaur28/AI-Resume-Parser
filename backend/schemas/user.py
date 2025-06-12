# /Users/taf/Projects/Resume Portal/backend/schemas/user.py
import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# --- Pydantic Models for DB Schema ---


class RoleDB(BaseModel):
    id: uuid.UUID
    name: str

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str
    role_name: str = "user"  # Default role


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


class UserPublic(UserInDBBase):  # For sending user data to client (without password)
    role: RoleDB  # This will require a join or a separate query to populate


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
    email: Optional[EmailStr] = None  # Changed from str to EmailStr for validation
    user_id: Optional[str] = None  # Store user_id as string from UUID
