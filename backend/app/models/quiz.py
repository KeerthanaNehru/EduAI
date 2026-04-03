"""Quiz models - teacher posts quizzes, students submit."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, JSON
from .database import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # ["A", "B", "C", "D"]
    correct_answer = Column(String(10), nullable=False)  # "A", "B", etc.
    explanation = Column(Text, nullable=True)


class QuizAttempt(Base):
    """Student's attempt at a quiz (AI-generated or teacher-posted)."""
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=True)  # Null for AI-generated
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=True)  # For AI-generated
    answers = Column(JSON, nullable=False)  # {"q1": "A", "q2": "B"}
    score = Column(Integer, nullable=True)
    total = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class QuizSubmission(Base):
    """Student submission for teacher-posted quizzes."""
    __tablename__ = "quiz_submissions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    answers = Column(JSON, nullable=False)
    score = Column(Integer, nullable=True)
    total = Column(Integer, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
