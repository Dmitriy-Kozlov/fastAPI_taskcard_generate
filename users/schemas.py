from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserBase(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None


class UserRead(UserBase):
    id: int

    class Config:
        from_attributes = True


class UserInDB(UserRead):
    hashed_password: str


class UserCreate(UserBase):
    password: str
    password2: str
