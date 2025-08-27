#!/usr/bin/env bash
# To run this file, run from apps/backend: ./scripts/start.sh
# Starts the backend with uvicorn

set -euo pipefail

# 1) Activate venv
if [ -d ".venv" ]; then
  source .venv/bin/activate
  echo "✅ Virtual environment activated."
else
  echo "❌ .venv not found in $(pwd)"
  exit 1
fi

# 2) Run uvicorn
exec python -m uvicorn app.main:app --reload
