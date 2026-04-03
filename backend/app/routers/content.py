"""Content endpoints - teacher uploads, student views."""
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import mimetypes

from app.models.database import get_db
from app.models import User, Content, ContentType
from app.auth import get_current_teacher, get_current_user
from app.config import get_settings
from app.schemas.content import ContentResponse

router = APIRouter(prefix="/content", tags=["content"])
settings = get_settings()


def _ensure_upload_dir():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=ContentResponse)
async def upload_content(
    subject: str = Form(...),
    title: str = Form(...),
    description: str = Form(None),
    content_type: str = Form(...),
    url: str = Form(None),
    file: UploadFile = File(None),
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db),
):
    if subject != current_user.subject:
        raise HTTPException(status_code=403, detail="You can only upload for your subject")
    if content_type not in ["document", "pdf", "video", "audio", "youtube"]:
        raise HTTPException(status_code=400, detail="Invalid content type")

    file_path = None
    if content_type == "youtube":
        if not url:
            raise HTTPException(status_code=400, detail="YouTube content requires URL")
    else:
        if not file:
            raise HTTPException(status_code=400, detail="File required")
        _ensure_upload_dir()
        ext = os.path.splitext(file.filename or "file")[1]
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        content_bytes = await file.read()
        if len(content_bytes) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="File too large")
        with open(file_path, "wb") as f:
            f.write(content_bytes)
        file_path = filename  # store relative path

    content = Content(
        teacher_id=current_user.id,
        subject=subject,
        title=title,
        description=description,
        content_type=ContentType(content_type),
        file_path=file_path,
        url=url,
    )
    db.add(content)
    await db.flush()
    await db.refresh(content)
    return ContentResponse(
        id=content.id,
        teacher_id=content.teacher_id,
        subject=content.subject,
        title=content.title,
        description=content.description,
        content_type=content.content_type.value,
        file_path=content.file_path,
        url=content.url,
        created_at=content.created_at,
    )


@router.get("/teacher/my", response_model=list[ContentResponse])
async def my_content(
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Content).where(
            Content.teacher_id == current_user.id,
            Content.subject == current_user.subject,
        ).order_by(Content.created_at.desc())
    )
    items = result.scalars().all()
    return [
        ContentResponse(
            id=c.id, teacher_id=c.teacher_id, subject=c.subject,
            title=c.title, description=c.description, content_type=c.content_type.value,
            file_path=c.file_path, url=c.url, created_at=c.created_at,
        )
        for c in items
    ]


@router.get("/student/subject/{subject}", response_model=list[ContentResponse])
async def student_content_by_subject(
    subject: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check enrollment (simplified - we'll add StudentSubject check in student router)
    result = await db.execute(
        select(Content).where(Content.subject == subject).order_by(Content.created_at.desc())
    )
    items = result.scalars().all()
    return [
        ContentResponse(
            id=c.id, teacher_id=c.teacher_id, subject=c.subject,
            title=c.title, description=c.description, content_type=c.content_type.value,
            file_path=c.file_path, url=c.url, created_at=c.created_at,
        )
        for c in items
    ]


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Content).where(Content.id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return ContentResponse(
        id=content.id, teacher_id=content.teacher_id, subject=content.subject,
        title=content.title, description=content.description, content_type=content.content_type.value,
        file_path=content.file_path, url=content.url, created_at=content.created_at,
    )


@router.get("/file/{content_id}")
async def serve_file(
    content_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Serve the uploaded file so students can view/download it."""
    result = await db.execute(select(Content).where(Content.id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    if not content.file_path:
        raise HTTPException(status_code=400, detail="No file attached to this content")
    
    full_path = os.path.join(settings.UPLOAD_DIR, content.file_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    
    mime_type, _ = mimetypes.guess_type(full_path)
    return FileResponse(
        path=full_path,
        media_type=mime_type or "application/octet-stream",
        filename=content.title + os.path.splitext(content.file_path)[1],
    )
