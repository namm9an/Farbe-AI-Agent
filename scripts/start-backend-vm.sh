#!/usr/bin/env bash

set -euo pipefail

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8001}"

cd "$(dirname "$0")/../backend"

exec python3 -m uvicorn app.main:app --host "$HOST" --port "$PORT"
