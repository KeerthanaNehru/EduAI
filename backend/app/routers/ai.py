"""AI endpoints - SummaryAI, QuizGenerationAI, DoubtClarifyingAI."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db
from app.models import Content
from app.auth import get_current_user
from app.services.content_extractor import get_content_text
from app.config import get_settings
from app.ai import summary_ai, quiz_generation_ai, quiz_verify_ai, doubt_clarifying_ai
from app.schemas.ai import (
    SummaryRequest, SummaryResponse,
    QuizGenRequest, QuizGenResponse, QuizVerifyRequest, QuizVerifyResponse,
    DoubtRequest, DoubtResponse,
)

router = APIRouter(prefix="/ai", tags=["ai"])
settings = get_settings()


async def _get_content(content_id: int, db: AsyncSession) -> Content:
    result = await db.execute(select(Content).where(Content.id == content_id))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Content not found")
    return c


async def _get_content_text(content: Content) -> str:
    return get_content_text(
        content.content_type.value,
        content.file_path,
        content.url,
        settings.UPLOAD_DIR,
    )


@router.post("/summary", response_model=SummaryResponse)
async def get_summary(
    req: SummaryRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await _get_content(req.content_id, db)
    text = await _get_content_text(content)
    summary = summary_ai(text, content.title)
    return SummaryResponse(summary=summary, content_title=content.title)


@router.post("/quiz/generate", response_model=QuizGenResponse)
async def generate_quiz(
    req: QuizGenRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await _get_content(req.content_id, db)
    text = await _get_content_text(content)
    questions = quiz_generation_ai(text, content.title, req.num_questions)
    return QuizGenResponse(
        questions=[{"question_text": q.get("question_text", ""), "options": q.get("options", []), "correct_answer": q.get("correct_answer", "")} for q in questions],
        content_title=content.title,
    )


@router.post("/quiz/verify", response_model=QuizVerifyResponse)
async def verify_quiz(
    req: QuizVerifyRequest,
    current_user=Depends(get_current_user),
):
    results = quiz_verify_ai(req.questions, req.answers)
    score = sum(1 for r in results if r.get("correct"))
    total = len(results)
    return QuizVerifyResponse(score=score, total=total, results=results)


@router.post("/doubt", response_model=DoubtResponse)
async def clarify_doubt(
    req: DoubtRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await _get_content(req.content_id, db)
    text = await _get_content_text(content)
    clarification = doubt_clarifying_ai(text, content.title, req.doubt)
    return DoubtResponse(clarification=clarification)
