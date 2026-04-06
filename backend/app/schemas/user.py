from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str  # "teacher" | "student"
    subject: Optional[str] = None  # For teachers only
    roll_number: Optional[str] = None  # For students only


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    subject: Optional[str] = None
    roll_number: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
