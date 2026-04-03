"""Test results - teacher posts, student sees only their own."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db
from app.models import User, TestResult
from app.auth import get_current_teacher, get_current_user
from app.schemas.result import TestResultCreate, TestResultResponse

router = APIRouter(prefix="/results", tags=["results"])


@router.post("/", response_model=TestResultResponse)
async def post_result(
    data: TestResultCreate,
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db),
):
    if data.subject != current_user.subject:
        raise HTTPException(status_code=403, detail="You can only post results for your subject")
    r = TestResult(
        student_id=data.student_id,
        teacher_id=current_user.id,
        subject=data.subject,
        test_name=data.test_name,
        marks_obtained=data.marks_obtained,
        total_marks=data.total_marks,
        feedback=data.feedback,
    )
    db.add(r)
    await db.flush()
    await db.refresh(r)
    return TestResultResponse(
        id=r.id,
        subject=r.subject,
        test_name=r.test_name,
        marks_obtained=r.marks_obtained,
        total_marks=r.total_marks,
        feedback=r.feedback,
        posted_at=r.posted_at,
    )


@router.get("/student/my", response_model=list[TestResultResponse])
async def my_results(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TestResult)
        .where(TestResult.student_id == current_user.id)
        .order_by(TestResult.posted_at.desc())
    )
    items = result.scalars().all()
    return [
        TestResultResponse(
            id=r.id,
            subject=r.subject,
            test_name=r.test_name,
            marks_obtained=r.marks_obtained,
            total_marks=r.total_marks,
            feedback=r.feedback,
            posted_at=r.posted_at,
        )
        for r in items
    ]
