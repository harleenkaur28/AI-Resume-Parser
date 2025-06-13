from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status

from core.config import settings
from schemas.user import TokenData

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token",
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta

    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update(
        {
            "exp": expire,
        },
    )

    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )

        email: Optional[str] = payload.get("sub")
        user_id: Optional[str] = payload.get("id")

        if email is None or user_id is None:
            raise credentials_exception

        token_data = TokenData(email=email, user_id=user_id)

    except JWTError:
        raise credentials_exception

    user = await get_user_by_email(email=token_data.email)

    if user is None:
        raise credentials_exception

    return token_data
