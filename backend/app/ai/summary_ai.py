"""SummaryAI - Summarizes content using LLM."""
from .groq_client import groq_chat


def summary_ai(content_text: str, content_title: str) -> str:
    system = """You are SummaryAI, an educational assistant. Your job is to summarize learning content clearly and concisely.
Provide a well-structured summary that captures the key concepts, main ideas, and important details.
Use bullet points or short paragraphs. Make it easy for students to review and recall the material."""
    user = f"Content title: {content_title}\n\nContent:\n{content_text[:12000]}\n\nProvide a clear summary:"
    return groq_chat(system, user)
