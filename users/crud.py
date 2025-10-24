import jwt
from typing import Annotated
from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
# from jwt.exceptions import InvalidTokenError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select

from base.crud import BaseCRUD
from database import async_session_maker
from users.schemas import UserRead, UserInDB, TokenData, Token
from users.models import User

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "3cacfa6b67696f9e22462087a41f6a1f8d9647dd6fbe97e7b963c7eb0601a1ea"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120


class UserCRUD(BaseCRUD):
    model = User

    @classmethod
    async def register(cls, user):
        async with async_session_maker() as session:
            if user.password != user.password2:
                raise HTTPException(status_code=400, detail="Passwords don't match")
            query = select(cls.model).filter_by(username=user.username)
            result = await session.execute(query)
            plain_result = result.scalar_one_or_none()
            if plain_result:
                raise HTTPException(status_code=400, detail="Username is occupied")
            hashed_password = get_password_hash(user.password)
            new_instance = User(
                username=user.username,
                full_name=user.full_name,
                hashed_password=hashed_password,
                email=user.email,
                disabled=True)
            session.add(new_instance)
            try:
                await session.commit()
            except SQLAlchemyError as e:
                await session.rollback()
                raise e
            return new_instance

    @classmethod
    async def create_superuser(cls, user):
        async with async_session_maker() as session:
            hashed_password = get_password_hash(user.password)
            new_instance = User(
                username=user.username,
                full_name=user.full_name,
                hashed_password=hashed_password,
                email=user.email,
                disabled=False,
                is_admin=True)
            session.add(new_instance)
            try:
                await session.commit()
            except SQLAlchemyError as e:
                await session.rollback()
                raise e
            return new_instance

    @classmethod
    async def get_token(cls, username, password):
        user = await authenticate_user(username, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if user.disabled:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is disabled",
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "is_admin": user.is_admin}, expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


async def get_user(username: str):
    async with async_session_maker() as session:
        query = select(User).filter_by(username=username)
        result = await session.execute(query)
        plain_result = result.scalar_one_or_none()
        return plain_result


async def authenticate_user(username: str, password: str):
    user = await get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=120)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.InvalidTokenError:
        raise credentials_exception
    user = await get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[UserRead, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_active_admin(
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="User is not admin")
    return current_user