from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ContentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: str  # document, pdf, video, audio, youtube
    url: Optional[str] = None  # For YouTube


class ContentResponse(BaseModel):
    id: int
    teacher_id: int
    subject: str
    title: str
    description: Optional[str] = None
    content_type: str
    file_path: Optional[str] = None
    url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
