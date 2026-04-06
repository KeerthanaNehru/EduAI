from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TestResultCreate(BaseModel):
    student_id: int
    subject: str
    test_name: str
    marks_obtained: float
    total_marks: float
    feedback: Optional[str] = None


class ResultItem(BaseModel):
    student_id: int
    marks_obtained: float
    feedback: Optional[str] = None


class TestResultBulkCreate(BaseModel):
    subject: str
    test_name: str
    total_marks: float
    results: list[ResultItem]


class TestResultResponse(BaseModel):
    id: int
    subject: str
    test_name: str
    marks_obtained: float
    total_marks: float
    feedback: Optional[str] = None
    posted_at: datetime

    class Config:
        from_attributes = True
