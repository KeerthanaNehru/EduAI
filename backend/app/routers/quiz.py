"""Quiz endpoints - teacher posts, student submits."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db
from app.models import User, Quiz, QuizQuestion, QuizSubmission
from app.auth import get_current_teacher, get_current_user
from app.schemas.quiz import QuizCreate, QuizResponse, QuizSubmissionCreate

router = APIRouter(prefix="/quiz", tags=["quiz"])


def _quiz_with_questions(quiz, questions):
    return {
        "id": quiz.id,
        "teacher_id": quiz.teacher_id,
        "subject": quiz.subject,
        "title": quiz.title,
        "description": quiz.description,
        "created_at": str(quiz.created_at),
        "due_date": str(quiz.due_date) if quiz.due_date else None,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "options": q.options,
                "correct_answer": q.correct_answer,
            }
            for q in questions
        ],
    }


@router.post("/")
async def create_quiz(
    data: QuizCreate,
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db),
):
    if data.subject != current_user.subject:
        raise HTTPException(status_code=403, detail="You can only create quizzes for your subject")
    quiz = Quiz(
        teacher_id=current_user.id,
        subject=data.subject,
        title=data.title,
        description=data.description,
        due_date=data.due_date,
    )
    db.add(quiz)
    await db.flush()
    for q in data.questions:
        db.add(QuizQuestion(
            quiz_id=quiz.id,
            question_text=q.question_text,
            options=q.options,
            correct_answer=q.correct_answer,
            explanation=q.explanation,
        ))
    await db.flush()
    await db.refresh(quiz)
    return {"id": quiz.id, "title": quiz.title, "subject": quiz.subject, "message": "Quiz posted successfully!"}


@router.get("/teacher/my")
async def my_quizzes(
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Quiz).where(Quiz.teacher_id == current_user.id).order_by(Quiz.created_at.desc())
    )
    quizzes = result.scalars().all()
    out = []
    for quiz in quizzes:
        q_result = await db.execute(select(QuizQuestion).where(QuizQuestion.quiz_id == quiz.id))
        questions = q_result.scalars().all()
        out.append(_quiz_with_questions(quiz, questions))
    return out


@router.get("/available")
async def available_quizzes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns ALL quizzes with questions — for students."""
    result = await db.execute(select(Quiz).order_by(Quiz.created_at.desc()))
    quizzes = result.scalars().all()
    out = []
    for quiz in quizzes:
        q_result = await db.execute(select(QuizQuestion).where(QuizQuestion.quiz_id == quiz.id))
        questions = q_result.scalars().all()
        out.append(_quiz_with_questions(quiz, questions))
    return out


@router.get("/student/subject/{subject}")
async def student_quizzes_by_subject(
    subject: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Quiz).where(Quiz.subject == subject).order_by(Quiz.created_at.desc())
    )
    quizzes = result.scalars().all()
    out = []
    for quiz in quizzes:
        q_result = await db.execute(select(QuizQuestion).where(QuizQuestion.quiz_id == quiz.id))
        questions = q_result.scalars().all()
        out.append(_quiz_with_questions(quiz, questions))
    return out


@router.get("/{quiz_id}/questions")
async def get_quiz_questions(quiz_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    q_result = await db.execute(select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id))
    questions = q_result.scalars().all()
    return _quiz_with_questions(quiz, questions)


@router.post("/submit")
async def submit_quiz(
    data: QuizSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Quiz).where(Quiz.id == data.quiz_id))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    q_result = await db.execute(select(QuizQuestion).where(QuizQuestion.quiz_id == data.quiz_id))
    questions = list(q_result.scalars().all())
    score = 0
    for q in questions:
        ans = data.answers.get(str(q.id), "")
        if str(ans).strip().upper() == str(q.correct_answer).strip().upper():
            score += 1
    total = len(questions)

    sub = QuizSubmission(
        quiz_id=data.quiz_id,
        student_id=current_user.id,
        answers=data.answers,
        score=score,
        total=total,
    )
    db.add(sub)
    await db.flush()
    return {"score": score, "total": total, "message": "Submitted!"}