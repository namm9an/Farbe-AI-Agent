from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def _load_dotenv() -> None:
    candidate_paths = [
        Path.cwd() / ".env",
        Path(__file__).resolve().parents[3] / ".env",
        Path(__file__).resolve().parents[2] / ".env",
    ]

    for path in candidate_paths:
        if not path.exists():
            continue

        for raw_line in path.read_text().splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)
        break


_load_dotenv()


def _required(value: str | None, key: str) -> str:
    if not value:
        raise RuntimeError(f"Missing required environment variable: {key}")
    return value


@dataclass(frozen=True)
class LLMConfig:
    base_url: str
    api_key: str
    model: str


@dataclass(frozen=True)
class EnvConfig:
    database_url: str
    llm_base_url: str | None
    llm_api_key: str | None
    llm_model: str

    @property
    def has_llm(self) -> bool:
        return bool(self.llm_base_url and self.llm_api_key)

    @property
    def llm(self) -> LLMConfig:
        return LLMConfig(
            base_url=_required(self.llm_base_url, "E2E_LLM_BASE_URL"),
            api_key=_required(self.llm_api_key, "E2E_LLM_API_KEY"),
            model=self.llm_model,
        )


env = EnvConfig(
    database_url=os.environ.get("DATABASE_URL", "data/farbe.db"),
    llm_base_url=os.environ.get("E2E_LLM_BASE_URL"),
    llm_api_key=os.environ.get("E2E_LLM_API_KEY"),
    llm_model=os.environ.get("E2E_LLM_MODEL", "llama-3.3-70b-instruct"),
)
