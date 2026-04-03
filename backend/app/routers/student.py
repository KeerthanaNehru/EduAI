"""Student-specific endpoints - subjects enrollment."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.database import get_db
from app.models import User, Subject, StudentSubject
from app.auth import get_current_student
from app.config import get_settings

router = APIRouter(prefix="/student", tags=["student"])
settings = get_settings()


@router.get("/subjects")
async def list_subjects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Subject))
    subs = result.scalars().all()
    if not subs:
        return [{"name": s, "display_name": s.replace("_", " ").title()} for s in settings.SUBJECTS]
    return [{"id": s.id, "name": s.name, "display_name": s.display_name} for s in subs]


@router.post("/enroll/{subject}")
async def enroll_subject(
    subject: str,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    if subject not in settings.SUBJECTS:
        raise HTTPException(status_code=400, detail="Invalid subject")
    result = await db.execute(select(Subject).where(Subject.name == subject))
    sub = result.scalar_one_or_none()
    if not sub:
        sub = Subject(name=subject, display_name=subject.replace("_", " ").title())
        db.add(sub)
        await db.flush()
    existing = await db.execute(
        select(StudentSubject).where(
            StudentSubject.student_id == current_user.id,
            StudentSubject.subject_id == sub.id,
        )
    )
    if existing.scalar_one_or_none():
        return {"message": "Already enrolled"}
    db.add(StudentSubject(student_id=current_user.id, subject_id=sub.id))
    await db.flush()
    return {"message": "Enrolled successfully"}


@router.post("/unenroll/{subject}")
async def unenroll_subject(
    subject: str,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    if subject not in settings.SUBJECTS:
        raise HTTPException(status_code=400, detail="Invalid subject")
    result = await db.execute(select(Subject).where(Subject.name == subject))
    sub = result.scalar_one_or_none()
    if not sub:
        return {"message": "Not enrolled"}
    await db.execute(
        delete(StudentSubject).where(
            StudentSubject.student_id == current_user.id,
            StudentSubject.subject_id == sub.id,
        )
    )
    await db.flush()
    return {"message": "Unenrolled successfully"}


@router.get("/my-subjects")
async def my_subjects(
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subject)
        .join(StudentSubject, StudentSubject.subject_id == Subject.id)
        .where(StudentSubject.student_id == current_user.id)
    )
    subs = result.scalars().all()
    return [{"name": s.name, "display_name": s.display_name} for s in subs]
