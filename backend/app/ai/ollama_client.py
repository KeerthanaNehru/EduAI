"""Shim — all AI now goes through Gemini (free)."""
from .groq_client import groq_chat
def ollama_chat(system_prompt: str, user_prompt: str, model=None) -> str:
    return groq_chat(system_prompt, user_prompt)
