# LangGraph Quick Start Guide

## TL;DR - Fix Port Conflicts

Your services now run on **separate ports**:

- 🌐 **Next.js**: `http://localhost:3000`
- 🤖 **LangGraph**: `http://localhost:8000`
- ⚡ **Python Backend**: `http://localhost:8001`

## Start All Services (Windows PowerShell)

```powershell
# Terminal 1 - Start LangGraph
cd apps/web
langgraph dev

# Terminal 2 - Start Python Backend
cd apps/backend
.\start.ps1

# Terminal 3 - Start Next.js
cd apps/web
npm run dev
```

## Required Environment Variables

Minimum required in `apps/web/.env.local`:

```env
# Services
LANGGRAPH_DEPLOYMENT_URL=http://localhost:8000
BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000,http://localhost:8001

# APIs (get your own keys)
LANGSMITH_API_KEY=lsv2_pt_xxxxx
OPENAI_API_KEY=sk-proj-xxxxx
COPILOTKIT_API_KEY=ck_xxxxx
TAVILY_API_KEY=tvly-xxxxx
WEATHER_API_KEY=xxxxx

# Auth & Database (configure as needed)
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
DATABASE_URL_LOCAL=postgresql://dansever:dandan96@localhost:5432/fleetai_db_dev
DB_TARGET=local

# Llama Cloud
LLAMA_CLOUD_API_KEY=llx-xxxxx
LLAMA_EXTRACT_PROJECT_ID=xxxxx
LLAMA_ORGANIZATION_ID=xxxxx
```

## Verify Everything Works

1. ✅ LangGraph running: Open `http://localhost:8000`
2. ✅ Backend running: Open `http://localhost:8001/docs`
3. ✅ Next.js running: Open `http://localhost:3000`
4. ✅ No "fetch failed" errors in browser console
5. ✅ AI assistant responds when you ask questions

## What Was Fixed

1. **Environment validation** - Added defaults for local development
2. **Port separation** - Backend moved from 8000 → 8001
3. **Type-safe env access** - Route now uses validated `serverEnv`
4. **Start scripts updated** - Backend scripts now specify `--port 8001`

## Need More Help?

See detailed documentation: `apps/web/src/documentation/langgraph-setup.md`

## Common Issues

### "Address already in use"

- Another service is using the port
- Stop all terminals and restart in order: LangGraph → Backend → Next.js

### "LangGraph connection failed"

- Make sure LangGraph is running on port 8000
- Check `LANGGRAPH_DEPLOYMENT_URL=http://localhost:8000` in `.env.local`

### "Environment variable not found"

- Copy all required variables above to `.env.local`
- Replace xxxxx with your actual API keys
- Restart Next.js dev server
