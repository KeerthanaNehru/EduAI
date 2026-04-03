"""QuizGenerationAI - Generates quizzes and verifies answers."""
import json
from .groq_client import groq_chat


def quiz_generation_ai(content_text: str, content_title: str, num_questions: int = 5) -> list[dict]:
    system = """You are QuizGenerationAI. Generate multiple-choice quiz questions from the given educational content.
Return a JSON array only, no other text. Format:
[
  {"question_text": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct_answer": "A"},
  ...
]
Each correct_answer must be "A", "B", "C", or "D". Exactly 4 options per question."""
    user = f"Content: {content_title}\n\n{content_text[:8000]}\n\nGenerate exactly {num_questions} quiz questions as JSON array:"
    out = groq_chat(system, user)
    # Parse JSON from response (might have markdown code blocks)
    try:
        if "```" in out:
            out = out.split("```")[1].replace("json", "").strip()
        data = json.loads(out)
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []


def quiz_verify_ai(questions: list, answers: dict) -> list[dict]:
    """Verify each answer and return feedback (congratulate/correct with explanation)."""
    results = []
    for i, q in enumerate(questions):
        q_key = str(i)
        user_answer = answers.get(q_key, "")
        correct = q.get("correct_answer", "").upper().strip()
        user_upper = str(user_answer).upper().strip() if user_answer else ""

        is_correct = user_upper == correct
        options = q.get("options", [])
        correct_option_text = next((o for o in options if o.strip().upper().startswith(correct)), "")

        if is_correct:
            results.append({
                "correct": True,
                "message": "Correct! Well done!",
                "explanation": correct_option_text or "You got it right.",
            })
        else:
            results.append({
                "correct": False,
                "message": "Not quite. Don't worry, here's the correct answer:",
                "correct_answer": correct,
                "explanation": correct_option_text or f"The correct answer is {correct}.",
            })
    return results
