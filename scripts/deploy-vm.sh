#!/usr/bin/env bash

set -euo pipefail

APP_NAME="${APP_NAME:-farbe-ai-agent}"
PORT="${PORT:-3001}"
LOG_FILE="${LOG_FILE:-/root/${APP_NAME}-frontend.log}"

echo "Installing dependencies..."
npm ci

echo "Building app..."
npm run build

mkdir -p data

EXISTING_PID="$(
  ss -tlnp |
    grep ":${PORT} " |
    grep -o 'pid=[0-9]*' |
    head -n 1 |
    cut -d= -f2 || true
)"

if [ -n "${EXISTING_PID}" ]; then
  echo "Stopping existing process on port ${PORT} with PID ${EXISTING_PID}..."
  kill -9 "${EXISTING_PID}"
fi

echo "Starting app on port ${PORT}..."
nohup env PORT="${PORT}" NODE_ENV=production npm run start:vm > "${LOG_FILE}" 2>&1 &

echo "Deployment complete."
echo "Log file: ${LOG_FILE}"
