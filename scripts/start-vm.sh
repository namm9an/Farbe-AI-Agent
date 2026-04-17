#!/usr/bin/env bash

set -euo pipefail

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3001}"
NODE_ENV="${NODE_ENV:-production}"

export HOST PORT NODE_ENV

exec npx next start -H "$HOST" -p "$PORT"
