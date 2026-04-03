"""Subject and Student-Subject enrollment models."""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Subject(Base):
    """Subjects that students can enroll in."""
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)  # "Computer Science" etc.


class StudentSubject(Base):
    """Many-to-many: Students enroll in subjects."""
    __tablename__ = "student_subjects"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("student_id", "subject_id"),)
