#!/usr/bin/env bash

set -euo pipefail

APP_NAME="${APP_NAME:-farbe-ai-agent}"
FRONTEND_PORT="${FRONTEND_PORT:-3001}"
BACKEND_PORT="${BACKEND_PORT:-8001}"
FRONTEND_LOG="${FRONTEND_LOG:-/root/${APP_NAME}-frontend.log}"
BACKEND_LOG="${BACKEND_LOG:-/root/${APP_NAME}-backend.log}"

kill_port_if_running() {
  local port="$1"
  local pid
  pid="$(
    ss -tlnp |
      grep ":${port} " |
      grep -o 'pid=[0-9]*' |
      head -n 1 |
      cut -d= -f2 || true
  )"

  if [ -n "${pid}" ]; then
    echo "Stopping existing process on port ${port} with PID ${pid}..."
    kill -9 "${pid}"
  fi
}

echo "Installing backend dependencies..."
python3 -m pip install -r backend/requirements.txt

echo "Installing frontend dependencies..."
npm --prefix frontend ci

echo "Building frontend..."
npm --prefix frontend run build

mkdir -p data

kill_port_if_running "${BACKEND_PORT}"
kill_port_if_running "${FRONTEND_PORT}"

echo "Starting backend on port ${BACKEND_PORT}..."
nohup env PORT="${BACKEND_PORT}" bash scripts/start-backend-vm.sh > "${BACKEND_LOG}" 2>&1 &

echo "Starting frontend on port ${FRONTEND_PORT}..."
nohup env PORT="${FRONTEND_PORT}" NODE_ENV=production bash scripts/start-frontend-vm.sh > "${FRONTEND_LOG}" 2>&1 &

echo "Deployment complete."
echo "Backend log: ${BACKEND_LOG}"
echo "Frontend log: ${FRONTEND_LOG}"
