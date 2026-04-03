"""Content models - docs, PDFs, videos, audios, YouTube links."""
from enum import Enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from .database import Base


class ContentType(str, Enum):
    DOCUMENT = "document"
    PDF = "pdf"
    VIDEO = "video"
    AUDIO = "audio"
    YOUTUBE = "youtube"


class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(50), nullable=False)  # maths, physics, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(SQLEnum(ContentType), nullable=False)
    
    # File path for document/pdf/video/audio, or URL for YouTube
    file_path = Column(String(500), nullable=True)
    url = Column(String(500), nullable=True)  # For YouTube links
    
    created_at = Column(DateTime, default=datetime.utcnow)
