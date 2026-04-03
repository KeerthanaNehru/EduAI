"""EduAI - Educational AI Platform. 100% FREE resources."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models.database import init_db
from app.routers import auth, content, quiz, results, ai, student

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    import os
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="EduAI",
    description="Educational AI Platform - Google Classroom like for Teachers & Students",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(content.router)
app.include_router(quiz.router)
app.include_router(results.router)
app.include_router(ai.router)
app.include_router(student.router)


@app.get("/")
async def root():
    return {
        "message": "EduAI - Educational AI Platform",
        "docs": "/docs",
        "subjects": settings.SUBJECTS,
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
