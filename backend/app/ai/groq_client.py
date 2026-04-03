"""Groq API client - Using Llama models."""
import httpx

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def groq_chat(system_prompt: str, user_prompt: str, model: str = "llama-3.1-8b-instant") -> str:
    # Import fresh every call so .env changes are always picked up
    from app.config import get_settings
    settings = get_settings()
    api_key = settings.GROQ_API_KEY

    if not api_key:
        return (
            "[AI Error: GROQ_API_KEY not set. "
            "Get your key at https://console.groq.com/keys "
            "and add GROQ_API_KEY=your-key to your backend .env file]"
        )

    try:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2048
        }
        with httpx.Client(timeout=90.0) as client:
            response = client.post(
                GROQ_API_URL,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                },
            )
            data = response.json()
            if response.status_code != 200:
                err = data.get("error", {}).get("message", str(data))
                return f"[AI Error: {err}]"
                
            choices = data.get("choices", [])
            if not choices:
                return "[AI Error: No response from Groq. Please try again.]"
                
            return choices[0].get("message", {}).get("content", "[AI Error: Could not extract text.]")
    except httpx.TimeoutException:
        return "[AI Error: Request timed out. Please try again.]"
    except Exception as e:
        return f"[AI Error: {str(e)}]"
