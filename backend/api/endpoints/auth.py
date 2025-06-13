from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any

from schemas.user import (
    UserCreate,
    UserPublic,
    Token,
)
from security.auth import (
    create_access_token,
    get_password_hash,
    verify_password,
)


from db.session import get_db_connection
import asyncpg
import uuid
from datetime import timedelta

router = APIRouter()


@router.post("/register", response_model=UserPublic)
async def register_user(
    user_data: UserCreate, conn: asyncpg.Connection = Depends(get_db_connection)
):

    existing_user = await conn.fetchrow(
        'SELECT email FROM auth."user" WHERE email = $1', user_data.email
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    role_record = await conn.fetchrow(
        "SELECT id FROM auth.role WHERE name = $1",
        user_data.role_name,
    )

    if not role_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{user_data.role_name}' not found.",
        )

    role_id = role_record["id"]

    hashed_password = get_password_hash(user_data.password)

    try:
        new_user_id = await conn.fetchval(
            """INSERT INTO auth."user" (email, hashed_password, role_id) 
               VALUES ($1, $2, $3) RETURNING id""",
            user_data.email,
            hashed_password,
            role_id,
        )

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
        form_data.username,
    )
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user["is_verified"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email not verified"
        )

    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={
            "sub": user["email"],
            "id": str(user["id"]),
        },
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
