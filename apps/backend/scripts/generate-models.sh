#!/usr/bin/env bash
# Automatically generate models from the database
# Run this script from the root of the backend directory
# ./scripts/generate-models.sh

set -euo pipefail

# 1) Read DATABASE_URL from ../.env
env_line=$(grep '^DATABASE_URL=' ../.env || true)
if [ -z "$env_line" ]; then
  echo "❌ DATABASE_URL not found in ../.env" >&2
  exit 1
fi

# 2) Strip key, quotes, spaces
db_url=$(echo "$env_line" | sed -E 's/^DATABASE_URL=//; s/^"//; s/"$//; s/^[[:space:]]*//; s/[[:space:]]*$//')

# 3) Fix prefix (sqlalchemy psycopg3 async driver)
db_url=$(echo "$db_url" | sed -E 's/^postgres:/postgresql+psycopg:/')

echo "✅ Using DB URL: $db_url"

# 4) Ensure app/db exists
mkdir -p ../app/db

# 5) Generate models
sqlacodegen "$db_url" --generator declarative --outfile ../app/db/models_auto.py
echo "🎉 Models generated at ../app/db/models_auto.py"
