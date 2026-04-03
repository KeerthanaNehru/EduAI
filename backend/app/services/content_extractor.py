"""Extract text from content for AI processing - all free libraries."""
import os
from pathlib import Path
from typing import Optional

# YouTube transcript (free)
try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    YouTubeTranscriptApi = None

# PDF (free)
try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None


def extract_youtube_transcript(url: str) -> str:
    """Extract transcript from YouTube video URL."""
    if not YouTubeTranscriptApi:
        return "YouTube transcript not available. Install: pip install youtube-transcript-api"
    try:
        # Extract video ID from URL
        video_id = None
        if "youtube.com/watch?v=" in url:
            video_id = url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in url:
            video_id = url.split("youtu.be/")[1].split("?")[0]
        if not video_id:
            return "Invalid YouTube URL"
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join([t["text"] for t in transcript])
    except Exception as e:
        return f"Could not fetch transcript: {str(e)}"


def extract_pdf_text(file_path: str) -> str:
    """Extract text from PDF file."""
    if not PdfReader:
        return "PDF processing not available. Install: pip install PyPDF2"
    try:
        reader = PdfReader(file_path)
        text = []
        for page in reader.pages:
            text.append(page.extract_text() or "")
        return "\n".join(text)
    except Exception as e:
        return f"Could not read PDF: {str(e)}"


def extract_document_text(file_path: str) -> str:
    """Extract text from plain text document."""
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception as e:
        return f"Could not read file: {str(e)}"


def extract_audio_video_transcript(file_path: str) -> str:
    """Extract transcript from audio/video using Groq Whisper API."""
    import httpx
    from app.config import get_settings
    settings = get_settings()
    api_key = settings.GROQ_API_KEY
    if not api_key:
        return "[Configuration Error: GROQ_API_KEY required for multimedia transcription]"

    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    try:
        # Check file size. Groq has a 25MB limit. If larger, we might fail, but let's try.
        if os.path.getsize(file_path) > 25 * 1024 * 1024:
            return "[Error: File size exceeds the 25MB limit for transcription. Please use a shorter audio/video file.]"

        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f)}
            data = {"model": "whisper-large-v3-turbo"}
            headers = {"Authorization": f"Bearer {api_key}"}

            with httpx.Client(timeout=120.0) as client:
                response = client.post(url, files=files, data=data, headers=headers)
                if response.status_code == 200:
                    return response.json().get("text", "")
                else:
                    err_msg = response.json().get("error", {}).get("message", response.text)
                    return f"[Transcription Failed: {err_msg}]"
    except Exception as e:
        return f"[Transcription Error: {str(e)}]"


def get_content_text(content_type: str, file_path: Optional[str], url: Optional[str], base_path: str) -> str:
    """Get text content from any content type."""
    if content_type == "youtube" and url:
        return extract_youtube_transcript(url)
    if content_type == "pdf" and file_path:
        full_path = os.path.join(base_path, file_path) if not os.path.isabs(file_path) else file_path
        return extract_pdf_text(full_path)
    if content_type in ("document", "video", "audio") and file_path:
        full_path = os.path.join(base_path, file_path) if not os.path.isabs(file_path) else file_path
        if content_type == "document":
            return extract_document_text(full_path)
        if content_type in ("video", "audio"):
            return extract_audio_video_transcript(full_path)
    return ""
