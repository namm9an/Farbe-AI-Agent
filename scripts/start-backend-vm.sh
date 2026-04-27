#!/usr/bin/env bash

set -euo pipefail

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8001}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

cd "$(dirname "$0")/../backend"

exec "${PYTHON_BIN}" -m uvicorn app.main:app --host "$HOST" --port "$PORT"
