"""Application configuration."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    APP_NAME: str = "EduAI"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite+aiosqlite:///./eduai.db"
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024

    GROQ_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    SUBJECTS: list[str] = [
        "tamil", "english", "maths", "physics",
        "chemistry", "computer_science", "biology"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# No lru_cache — always reads fresh from .env
def get_settings() -> Settings:
    return Settings()