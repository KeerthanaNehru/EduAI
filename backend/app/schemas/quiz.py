from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class QuizQuestionCreate(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None


class QuizCreate(BaseModel):
    subject: str
    title: str
    description: Optional[str] = None
    questions: List[QuizQuestionCreate]
    due_date: Optional[datetime] = None


class QuizResponse(BaseModel):
    id: int
    teacher_id: int
    subject: str
    title: str
    description: Optional[str] = None
    created_at: datetime
    due_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class QuizSubmissionCreate(BaseModel):
    quiz_id: int
    answers: dict  # {"question_id": "A"}
