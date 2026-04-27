from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from app.lib.env import env


def _database_path() -> Path:
    return Path.cwd() / env.database_url


def init_db() -> None:
    database_path = _database_path()
    database_path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(database_path, timeout=30)
    connection.execute("PRAGMA busy_timeout = 30000")
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS analysis_runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL,
          reference_name TEXT NOT NULL,
          target_name TEXT NOT NULL,
          match_score REAL NOT NULL,
          confidence REAL NOT NULL,
          findings_json TEXT NOT NULL,
          suggestions_json TEXT NOT NULL,
          summary TEXT NOT NULL
        );
        """
    )
    connection.commit()
    connection.close()


def save_analysis_run(
    *,
    created_at: str,
    reference_name: str,
    target_name: str,
    match_score: float,
    confidence: float,
    findings: list[str],
    suggestions: list[str],
    summary: str,
) -> None:
    connection = sqlite3.connect(_database_path(), timeout=30)
    connection.execute("PRAGMA busy_timeout = 30000")
    connection.execute(
        """
        INSERT INTO analysis_runs (
          created_at,
          reference_name,
          target_name,
          match_score,
          confidence,
          findings_json,
          suggestions_json,
          summary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            created_at,
            reference_name,
            target_name,
            match_score,
            confidence,
            json.dumps(findings),
            json.dumps(suggestions),
            summary,
        ),
    )
    connection.commit()
    connection.close()
