"""Test result model - teachers post, students see only their own."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from .database import Base


class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(50), nullable=False)
    test_name = Column(String(255), nullable=False)
    marks_obtained = Column(Float, nullable=False)
    total_marks = Column(Float, nullable=False)
    feedback = Column(String(500), nullable=True)
    posted_at = Column(DateTime, default=datetime.utcnow)
