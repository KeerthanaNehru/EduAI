"""Seed database with initial subjects and sample users."""
import asyncio
from sqlalchemy import select
from app.models.database import async_session, init_db
from app.models import User, Subject, UserRole
from app.auth import get_password_hash

SUBJECTS = [
    ("tamil", "Tamil"),
    ("english", "English"),
    ("maths", "Maths"),
    ("physics", "Physics"),
    ("chemistry", "Chemistry"),
    ("computer_science", "Computer Science"),
    ("biology", "Biology"),
]


async def seed():
    await init_db()
    async with async_session() as db:
        # Subjects
        for name, display in SUBJECTS:
            r = await db.execute(select(Subject).where(Subject.name == name))
            if not r.scalar_one_or_none():
                db.add(Subject(name=name, display_name=display))
        await db.commit()

        # Sample teacher (maths)
        r = await db.execute(select(User).where(User.email == "maths@eduai.com"))
        if not r.scalar_one_or_none():
            db.add(User(
                email="maths@eduai.com",
                hashed_password=get_password_hash("teacher123"),
                full_name="Maths Teacher",
                role=UserRole.TEACHER,
                subject="maths",
            ))

        # Sample student
        r = await db.execute(select(User).where(User.email == "student@eduai.com"))
        if not r.scalar_one_or_none():
            db.add(User(
                email="student@eduai.com",
                hashed_password=get_password_hash("student123"),
                full_name="Sample Student",
                role=UserRole.STUDENT,
                subject=None,
            ))
        await db.commit()
    print("Seed complete. Use maths@eduai.com / teacher123 and student@eduai.com / student123")


if __name__ == "__main__":
    asyncio.run(seed())
