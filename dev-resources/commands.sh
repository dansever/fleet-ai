#!/bin/bash

# Quick helper commands for FleetAI project
# Run from the repo root: ./dev-resources/commands.sh <command>

case "$1" in
  dev)
    # Start the Next.js dev server
    echo "🚀 Starting Next.js dev server (apps/web)..."
    cd apps/web && pnpm dev
    ;;

  build)
    # Build the Next.js app
    echo "🔨 Building Next.js (apps/web)..."
    cd apps/web && pnpm build
    ;;

  studio:local)
    echo "📊 Opening Drizzle Studio (local DB)..."
    dotenv -e apps/web/.env.local -- drizzle-kit studio --config=drizzle.config.ts
    ;;

  studio:remote)
    echo "📊 Opening Drizzle Studio (Supabase)..."
    dotenv -e apps/web/.env.production -- drizzle-kit studio --config=drizzle.config.ts
    ;;

  migrate:local)
    echo "📦 Running local DB migrations..."
    dotenv -e apps/web/.env.local -- drizzle-kit migrate --config=drizzle.config.ts
    ;;

  migrate:remote)
    echo "📦 Running Supabase DB migrations..."
    dotenv -e apps/web/.env.production -- drizzle-kit migrate --config=drizzle.config.ts
    ;;

  db:generate)
    echo "📝 Generating Drizzle schema from DB..."
    dotenv -e apps/web/.env.local -- drizzle-kit generate --config=drizzle.config.ts
    ;;

    tree)
    # Save project tree structure into a file
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    REPO_ROOT="$(dirname "$SCRIPT_DIR")"
    cd "$REPO_ROOT"
    echo "alias tree='/c/Windows/System32/tree.com'" >> ~/.bashrc
    tree -I "node_modules|.git|.next|dist|build|coverage|.turbo|.pnpm-store" . > "$SCRIPT_DIR/project-structure.txt"
    echo "✅ Project tree saved to $SCRIPT_DIR/project-structure.txt"
    ;;

  *)
    echo "Usage: ./commands.sh {dev|build|studio:local|studio:remote|migrate:local|migrate:remote|db:generate}"
    exit 1
    ;;
esac
