# LangGraph and Backend Setup Guide

This guide explains how to properly configure and run LangGraph, the Python backend, and Next.js web app without port conflicts.

## Port Configuration

To avoid conflicts, each service runs on a separate port:

- **Next.js Web App**: `http://localhost:3000`
- **LangGraph Server**: `http://localhost:8000`
- **Python Backend API**: `http://localhost:8001`

## Environment Variables Required

### Core Configuration

Create or update `apps/web/.env.local` with these variables:

```env
# LangGraph Configuration
LANGGRAPH_DEPLOYMENT_URL=http://localhost:8000
LANGSMITH_API_KEY=lsv2_pt_your_key_here

# Python Backend Configuration
BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001

# CORS - Allow all service ports
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000,http://localhost:8001

# OpenAI (required by LangChain)
OPENAI_API_KEY=sk-proj-your_key_here
ACTIVE_OPENAI_MODEL=gpt-4o-mini

# CopilotKit
COPILOTKIT_API_KEY=ck_your_key_here

# Other APIs
TAVILY_API_KEY=tvly_your_key_here
WEATHER_API_KEY=your_key_here

# Database
DATABASE_URL_LOCAL=postgresql://dansever:dandan96@localhost:5432/fleetai_db_dev
DB_TARGET=local

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_key_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev

# Llama Cloud
LLAMA_CLOUD_API_KEY=llx-your_key_here
LLAMA_EXTRACT_PROJECT_ID=your_project_id
LLAMA_ORGANIZATION_ID=your_org_id
```

## Startup Sequence

Follow this order to start all services without conflicts:

### 1. Start Database (if not already running)

```powershell
# From project root
docker-compose up -d
```

### 2. Start LangGraph Server (Port 8000)

```powershell
# Terminal 1
cd apps/web
langgraph dev
```

You should see:

```
- 🚀 API: http://localhost:8000
- 🎨 Studio UI: https://smith.langchain.com/studio?baseUrl=http://localhost:8000
```

### 3. Start Python Backend (Port 8001)

```powershell
# Terminal 2
cd apps/backend
.\start.ps1
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8001
```

### 4. Start Next.js Web App (Port 3000)

```powershell
# Terminal 3
cd apps/web
npm run dev
```

You should see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

## Verification

### Check All Services Are Running

1. **LangGraph**: Open `http://localhost:8000` - should show LangGraph API
2. **Python Backend**: Open `http://localhost:8001/docs` - should show FastAPI docs
3. **Next.js**: Open `http://localhost:3000` - should show your app

### Test AI Assistant Connection

1. Open your app at `http://localhost:3000`
2. Navigate to any page with the AI assistant
3. Try asking a question
4. You should NOT see "LangGraph connection attempt failed" errors
5. The assistant should respond successfully

## Troubleshooting

### Error: "LangGraph connection attempt failed"

**Causes:**

- LangGraph server not running on port 8000
- `LANGGRAPH_DEPLOYMENT_URL` not set correctly
- Port conflict with another service

**Solution:**

1. Make sure LangGraph is running: `langgraph dev`
2. Check `LANGGRAPH_DEPLOYMENT_URL=http://localhost:8000` in `.env.local`
3. Verify no other service is using port 8000

### Error: "Address already in use" on Port 8000

**Cause:** Both LangGraph and Python backend trying to use port 8000

**Solution:**

1. Stop all services
2. Verify backend scripts have `--port 8001`:
   - `apps/backend/start.ps1` should have: `py -m uvicorn app.main:app --reload --port 8001`
   - `apps/backend/start.sh` should have: `exec python -m uvicorn app.main:app --reload --port 8001`
3. Restart in correct order (LangGraph first, then Backend)

### Error: "fetch failed" in Console

**Causes:**

- Services not running
- Wrong URL configuration
- CORS issues

**Solution:**

1. Check all three services are running (see Verification above)
2. Verify environment variables are set correctly
3. Check `CORS_ALLOWED_ORIGINS` includes all ports: `http://localhost:3000,http://localhost:8000,http://localhost:8001`

### Error: Environment Variable Validation Failed

**Cause:** Missing required environment variables

**Solution:**

1. Copy all variables from the Environment Variables section above
2. Replace placeholder values with your actual API keys
3. Restart Next.js dev server

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  Browser (localhost:3000)                                    │
│  ├── Next.js Web App                                         │
│  └── CopilotKit UI                                           │
│                                                               │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ HTTP Requests
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│  Next.js API Routes (localhost:3000/api/*)                    │
│  ├── /api/copilotkit → Connects to LangGraph                 │
│  ├── /api/contracts → Proxies to Python Backend              │
│  └── Other API routes                                         │
└───────┬───────────────────────────────┬───────────────────────┘
        │                               │
        │                               │
        ▼                               ▼
┌─────────────────────┐     ┌──────────────────────────┐
│  LangGraph Server   │     │  Python Backend          │
│  (localhost:8000)   │     │  (localhost:8001)        │
│                     │     │                          │
│  - Assistant Agent  │     │  - FastAPI               │
│  - UOM Converter    │     │  - Document Extraction   │
│  - LangChain        │     │  - Database Operations   │
│  - Tool Execution   │     │  - Business Logic        │
└─────────────────────┘     └──────────────────────────┘
```

## Key Changes Made

1. **Environment Validation** (`apps/web/src/lib/env/server.ts`):
   - Added default values for `LANGGRAPH_DEPLOYMENT_URL`, `BACKEND_URL`, and `CORS_ALLOWED_ORIGINS`
   - Allows local development without explicitly setting every variable

2. **CopilotKit Route** (`apps/web/src/app/api/copilotkit/route.ts`):
   - Now uses validated `serverEnv` instead of raw `process.env`
   - Ensures type safety and validation

3. **Backend Start Scripts**:
   - Updated `apps/backend/start.ps1` to use `--port 8001`
   - Updated `apps/backend/start.sh` to use `--port 8001`
   - Prevents port conflict with LangGraph

## Additional Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangSmith Dashboard](https://smith.langchain.com/)
- [CopilotKit Documentation](https://docs.copilotkit.ai/)
- [Project Environment Documentation](../../../../../dev-resources/ENVIRONMENT.md)
