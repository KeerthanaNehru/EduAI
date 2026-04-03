from pydantic import BaseModel
from typing import List, Optional


class SummaryRequest(BaseModel):
    content_id: int


class SummaryResponse(BaseModel):
    summary: str
    content_title: str


class QuizGenRequest(BaseModel):
    content_id: int
    num_questions: int = 5


class QuizQuestionItem(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: str


class QuizGenResponse(BaseModel):
    questions: List[QuizQuestionItem]
    content_title: str


class QuizVerifyRequest(BaseModel):
    content_id: int
    questions: List[QuizQuestionItem]
    answers: dict  # {"0": "A", "1": "B"}


class QuizVerifyResponse(BaseModel):
    score: int
    total: int
    results: List[dict]  # [{correct, explanation, congratulations/correction}]


class DoubtRequest(BaseModel):
    content_id: int
    doubt: str


class DoubtResponse(BaseModel):
    clarification: str
