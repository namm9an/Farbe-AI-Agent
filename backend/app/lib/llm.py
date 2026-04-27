from __future__ import annotations

import logging

from openai import OpenAI

from app.lib.env import env

logger = logging.getLogger(__name__)


def _get_client() -> OpenAI:
    llm = env.llm
    return OpenAI(api_key=llm.api_key, base_url=llm.base_url)


def generate_suggestion_narrative(
    *,
    reference_palette: list[str],
    target_palette: list[str],
    score: int,
    findings: list[str],
    suggestions: list[str],
) -> str | None:
    if not env.has_llm:
        return None

    try:
        client = _get_client()
        completion = client.chat.completions.create(
            model=env.llm.model,
            temperature=0.2,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a concise internal design QA assistant. "
                        "Respond in plain English for a designer. "
                        "Keep the answer under 140 words and make it practical."
                    ),
                },
                {
                    "role": "user",
                    "content": "\n".join(
                        [
                            f"Reference palette: {', '.join(reference_palette)}",
                            f"Target palette: {', '.join(target_palette)}",
                            f"Match score: {score}/100",
                            f"Findings: {' | '.join(findings)}",
                            f"Suggested actions already generated: {' | '.join(suggestions)}",
                            "Write one short summary paragraph and two short actionable recommendations.",
                        ]
                    ),
                },
            ],
        )
    except Exception:
        logger.exception("LLM narrative generation failed; returning deterministic analysis only.")
        return None

    message = completion.choices[0].message.content if completion.choices else None
    return message.strip() if message else None
