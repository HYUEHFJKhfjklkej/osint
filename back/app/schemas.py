from datetime import datetime

from pydantic import BaseModel, ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: str


class GreetingCreate(BaseModel):
    name: str


class GreetingOut(BaseModel):
    id: int
    name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HelloResponse(BaseModel):
    message: str


class LoginRequest(BaseModel):
    username: str
    password: str


class PersonCreate(BaseModel):
    full_name: str
    telegram: str | None = None
    photo_url: str | None = None
    note: str | None = None


class PersonOut(BaseModel):
    id: int
    full_name: str
    telegram: str | None
    photo_url: str | None
    note: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
