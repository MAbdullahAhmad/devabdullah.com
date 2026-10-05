#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  kill "${FRONTEND_PID:-}" "${PROXY_PID:-}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

npm --prefix "$ROOT/frontend" run dev &
FRONTEND_PID=$!
npm --prefix "$ROOT/rev-proxy" run dev &
PROXY_PID=$!

wait "$FRONTEND_PID" "$PROXY_PID"
