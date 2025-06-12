# /Users/taf/Projects/Resume Portal/backend/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any

from schemas.user import (
    UserCreate,
    UserPublic,
    Token,
)  # Assuming these are in schemas.user
from security.auth import (
    create_access_token,
    get_password_hash,
    verify_password,
)  # Assuming these are in security.auth

# You'll need CRUD operations for users, e.g., from a db.crud_user module
# from db.crud_user import get_user_by_email, create_user_db
from db.session import get_db_connection  # For database operations
import asyncpg
import uuid
from datetime import timedelta

router = APIRouter()


@router.post("/register", response_model=UserPublic)
async def register_user(
    user_data: UserCreate, conn: asyncpg.Connection = Depends(get_db_connection)
):
    # Check if user already exists
    existing_user = await conn.fetchrow(
        'SELECT email FROM auth."user" WHERE email = $1', user_data.email
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Get role_id for the given role_name
    role_record = await conn.fetchrow(
        "SELECT id FROM auth.role WHERE name = $1", user_data.role_name
    )
    if not role_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{user_data.role_name}' not found.",
        )
    role_id = role_record["id"]

    hashed_password = get_password_hash(user_data.password)

    # Create user
    try:
        new_user_id = await conn.fetchval(
            """INSERT INTO auth."user" (email, hashed_password, role_id) 
               VALUES ($1, $2, $3) RETURNING id""",
            user_data.email,
            hashed_password,
            role_id,
        )

        # Fetch the created user to return UserPublic model (including role info)
        # This requires a join or a subsequent query for the role name
        created_user_record = await conn.fetchrow(
            """SELECT u.id, u.email, u.role_id, u.is_verified, u.created_at, u.updated_at, r.name as role_name 
               FROM auth."user" u JOIN auth.role r ON u.role_id = r.id 
               WHERE u.id = $1""",
            new_user_id,
        )
        if not created_user_record:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create user",
            )

        return UserPublic(
            id=created_user_record["id"],
            email=created_user_record["email"],
            role_id=created_user_record["role_id"],
            is_verified=created_user_record["is_verified"],
            created_at=created_user_record["created_at"],
            updated_at=created_user_record["updated_at"],
            role={
                "id": created_user_record["role_id"],
                "name": created_user_record["role_name"],
            },
        )

    except asyncpg.UniqueViolationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered (race condition).",
        )
    except Exception as e:
        # Log the error e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user",
        )


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    user = await conn.fetchrow(
        'SELECT id, email, hashed_password, role_id, is_verified FROM auth."user" WHERE email = $1',
        form_data.username,  # OAuth2PasswordRequestForm uses 'username' for the email field
    )
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Add more checks if needed, e.g., if user.is_verified == False
    # if not user['is_verified']:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Email not verified"
    #     )

    access_token_expires = timedelta(minutes=30)  # Or from config
    access_token = create_access_token(
        data={
            "sub": user["email"],
            "id": str(user["id"]),
        },  # Store email in 'sub', user_id in 'id'
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


# You would add more endpoints here, e.g., for password recovery, email verification, etc.
