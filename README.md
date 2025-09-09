# FleetAI

FleetAI is an **AI-powered procurement contract management platform** for airlines and adjacent industries (starting with aviation).  
It helps procurement teams automate RFQs, parse supplier quotes, detect contract leakage, and monitor compliance across ground services and fuel contracts.

---

## App

Deployed app: [https://fleet-ai-web.vercel.app/](https://fleet-ai-web.vercel.app/)

---

## Tech Stack

**Frontend**

- TypeScript + React (Next.js)
- TailwindCSS + ShadCN UI for modern, responsive UI components

**Backend**

- Python + FastAPI for APIs and business logic
- PostgreSQL (with vector DB extensions) for structured + unstructured data
- Supabase for authentication and data management

**AI / ML**

- OpenAI APIs for LLM-based reasoning
- LlamaIndex for retrieval-augmented generation (RAG) and knowledge orchestration
- Embeddings + vector search for contract and RFQ intelligence

---

## Branch Workflow

- Work happens in `dev`
- Commit and push normally
- When stable:

  ```bash
  git checkout main
  git pull origin main
  git merge dev
  git push origin main
  ```

- Switch back to dev with `git checkout dev` to continue working.
- Keep `main` clean and production-ready
