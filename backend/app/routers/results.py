"""Test results - teacher posts, student sees only their own."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db
from app.models import User, TestResult, StudentSubject, Subject, UserRole
from app.auth import get_current_teacher, get_current_user
from app.schemas.result import TestResultCreate, TestResultResponse, TestResultBulkCreate

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


@router.post("/bulk")
async def post_results_bulk(
    data: TestResultBulkCreate,
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db),
):
    if data.subject != current_user.subject:
        raise HTTPException(status_code=403, detail="You can only post results for your subject")
    
    results_to_add = []
    for item in data.results:
        r = TestResult(
            student_id=item.student_id,
            teacher_id=current_user.id,
            subject=data.subject,
            test_name=data.test_name,
            marks_obtained=item.marks_obtained,
            total_marks=data.total_marks,
            feedback=item.feedback,
        )
        results_to_add.append(r)
    
    db.add_all(results_to_add)
    await db.flush()
    return {"message": f"Successfully posted {len(results_to_add)} results"}


@router.get("/students")
async def get_students_for_subject(
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db),
):
    """List students enrolled in the teacher's subject."""
    # First, find the subject ID
    sub_res = await db.execute(select(Subject).where(Subject.name == current_user.subject))
    sub = sub_res.scalar_one_or_none()
    
    if not sub:
        # Fallback: if no subjects table entry yet, return all students
        res = await db.execute(select(User).where(User.role == UserRole.STUDENT))
        students = res.scalars().all()
    else:
        # Get students enrolled in this subject
        res = await db.execute(
            select(User)
            .join(StudentSubject, StudentSubject.student_id == User.id)
            .where(StudentSubject.subject_id == sub.id)
        )
        students = res.scalars().all()
        
        # If no one enrolled yet, maybe return all students so teacher can still post?
        if not students:
             res = await db.execute(select(User).where(User.role == UserRole.STUDENT))
             students = res.scalars().all()

    return [{"id": s.id, "full_name": s.full_name, "email": s.email, "roll_number": s.roll_number} for s in students]


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
