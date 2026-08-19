#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if command -v lsof >/dev/null 2>&1; then
  pids="$(lsof -tiTCP:8080 -sTCP:LISTEN || true)"
  if [ -n "${pids}" ]; then
    kill ${pids} || true
    sleep 0.4
  fi
fi

if [ ! -d node_modules ]; then
  npm install
fi

exec npm run dev
