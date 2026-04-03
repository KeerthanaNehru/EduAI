"""DoubtClarifyingAI - Clarifies student doubts with theory and examples."""
from .groq_client import groq_chat


def doubt_clarifying_ai(content_text: str, content_title: str, doubt: str) -> str:
    system = """You are DoubtClarifyingAI, an educational assistant. Students ask you doubts about learning content.
Your job is to clarify their doubt in a helpful way:
1. Explain theoretically - use clear definitions and concepts
2. Give real-world examples to make it practical
3. Use simple language
4. Be encouraging and supportive"""
    user = f"Content title: {content_title}\n\nContent:\n{content_text[:10000]}\n\nStudent's doubt: {doubt}\n\nProvide a clear clarification with theory and examples:"
    return groq_chat(system, user)
