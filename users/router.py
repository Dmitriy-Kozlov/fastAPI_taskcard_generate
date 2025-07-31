from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends, APIRouter, Body
from pydantic import Field

from users.crud import get_current_active_user
from users.schemas import UserRead, UserCreate, Token
from users.crud import UserCRUD


router = APIRouter(
    prefix="/users",
    tags=["users"]
)


@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    token = await UserCRUD.get_token(form_data.username, form_data.password)
    return token


@router.get("/me", response_model=UserRead)
async def read_users_me(
    current_user: Annotated[UserRead, Depends(get_current_active_user)],
):
    return current_user


@router.post("/register", response_model=UserRead)
async def register_user(user: UserCreate):
    user = await UserCRUD.register(user)
    return user


@router.post("/login")
async def login(username: str = Body(...), password: str = Body(...)):
    token = await UserCRUD.get_token(username, password)
    return token


@router.get("/all", response_model=list[UserRead])
async def get_all_users(user=Depends(get_current_active_user)):
    users = await UserCRUD.find_all()
    return [UserRead.from_orm(user) for user in users]


@router.put("/edit", response_model=UserRead)
async def edit_user(user_edit: UserRead, user=Depends(get_current_active_user)):
    result = await UserCRUD.edit(**user_edit.dict())
    return result


@router.get("/{id}", response_model=UserRead)
async def get_user_by_id(id: int, user=Depends(get_current_active_user)):
    result = await UserCRUD.find_one_or_none_by_id(id)
    return result


@router.delete("/{id}/delete")
async def delete_user_by_id(id: int, user=Depends(get_current_active_user)):
    result = await UserCRUD.delete(id)
    return result
