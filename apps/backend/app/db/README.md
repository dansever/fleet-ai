# 🔄 Generate SQLAlchemy Models from PostgreSQL

Use `sqlacodegen` to auto-generate SQLAlchemy models from your Postgres DB (populated via Drizzle).

---

## ✅ Steps

1. **Install dependencies**

   ```bash
   pip install sqlacodegen python-dotenv
   ```

2. **Make sure your `.env` contains**

   ```
   DATABASE_URL=postgres://user:pass@localhost:5432/dbname
   ```

3. **Run one of the following**:
   - **Linux/macOS/WSL**

     ```bash
        dbUrl=$(grep '^DATABASE_URL=' apps/backend/.env | sed 's/^DATABASE_URL=//' | sed 's/^postgres:/postgresql:/')
        sqlacodegen "$dbUrl" --generator declarative --outfile apps/backend/app/db/models_auto.py
     ```

   - **Windows PowerShell**

   ```powershell
     1) # read from backend folder that contains .env
     $envLine = Get-Content .env | Where-Object { $_ -match '^DATABASE_URL=' }
     if (-not $envLine) { throw "DATABASE_URL not found in .env" }

     2) # sanitize: strip key, quotes, spaces, then ensure correct driver prefix
     $dbUrl = ($envLine -replace '^DATABASE_URL=', '' -replace '^"|"$', '').Trim()
     $dbUrl = $dbUrl -replace '^postgres:', 'postgresql+psycopg:'   # v3 driver

     3) # Test
     Write-Host "Using DB URL: $dbUrl"

     4) # make sure target folder exists
     if (-not (Test-Path app/db)) { New-Item -ItemType Directory -Path app/db | Out-Null }

     5) # generate
     sqlacodegen "$dbUrl" --generator declarative --outfile app/db/models_auto.py
   ```

   - **Cross-platform (recommended)**

     ```bash
     python scripts/generate_models.py
     ```

4. **Models are saved to:**

   ```
   backend/db/models_auto.py
   ```

---

## ⚠️ Notes

- Don't manually edit `models_auto.py`
- Re-run the command after DB schema changes
- Ensure your DB is migrated before generating

---

# 🗄️ Database Operations Guide

This guide explains how to perform database operations in the FleetAI backend, including session management, authentication, and best practices.

## 🔐 Database Session Management

### Session Initialization

The database session is **automatically initialized** when the FastAPI application starts in `main.py`:

```python
# apps/backend/app/main.py
@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    try:
        await get_db_connection()
        logger.info("🚀 Application startup completed successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database connection: {e}")
        raise
```

**You do NOT need to manually create sessions** - the connection pool is managed automatically.

### Session Usage in API Routes

For API routes, use the `get_db()` dependency to inject database sessions:

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

@router.post("/example")
async def example_endpoint(
    request: ExampleRequest,
    db: AsyncSession = Depends(get_db)
):
    # Use the injected session
    result = await some_database_operation(db, request.data)
    return result
```

### Direct Database Operations

For background tasks or services, you can get a connection directly:

```python
from app.db.session import get_db_connection

async def background_task():
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        # Use the connection for raw SQL or asyncpg operations
        result = await conn.fetch("SELECT * FROM users")
```

## 🚀 How to Call Database Operations

### 1. Using Database Operation Functions

Database operations are organized in the `app/db/operations/` directory. Each module contains CRUD functions for specific entities:

```python
# Example: Using airport operations
from app.db.operations.airports import get_airports_by_org, update_airport

@router.get("/airports")
async def get_airports(
    org_id: str,
    db: AsyncSession = Depends(get_db)
):
    # Get airports for organization
    airports = await get_airports_by_org(db, org_id)
    return airports

@router.put("/airports/{airport_id}")
async def update_airport_endpoint(
    airport_id: str,
    update_data: dict,
    db: AsyncSession = Depends(get_db)
):
    # Update airport
    updated_airport = await update_airport(
        db,
        airport_id,
        **update_data
    )
    return updated_airport
```

### 2. Direct SQLAlchemy Operations

For custom queries, you can use SQLAlchemy directly:

```python
from sqlalchemy import select, update, delete
from app.db.models_auto import Users

@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    # Direct SQLAlchemy query
    result = await db.execute(
        select(Users).where(Users.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
```

### 3. Transaction Management

Always commit your changes after modifications:

```python
async def create_user_with_profile(db: AsyncSession, user_data: dict, profile_data: dict):
    try:
        # Create user
        user = Users(**user_data)
        db.add(user)
        await db.flush()  # Get the user ID

        # Create profile with user reference
        profile = UserProfiles(user_id=user.id, **profile_data)
        db.add(profile)

        # Commit both operations
        await db.commit()
        return user

    except Exception as e:
        await db.rollback()
        raise e
```

## 🔑 Authentication & Clerk Integration

### How Clerk_ID is Extracted

**The app CANNOT automatically extract the active Clerk_ID from the session** - you must send it from the frontend. Here's how the authentication flow works:

#### Frontend (Next.js)

```typescript
// Get current user from Clerk
import { useUser } from '@clerk/nextjs';

function MyComponent() {
  const { user } = useUser();

  const callBackend = async () => {
    const response = await fetch('/api/v1/some-endpoint', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user?.id}`, // Send Clerk user ID
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: 'example' }),
    });
  };
}
```

#### Backend Authentication

```python
from app.services.clerk_service import get_clerk_session
from fastapi import HTTPException, Header

@router.post("/protected-endpoint")
async def protected_endpoint(
    request: SomeRequest,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    # Extract Clerk user ID from Authorization header
    clerk_user_id = authorization.replace("Bearer ", "")

    # Verify the session
    session_data = await get_clerk_session(clerk_user_id)
    if not session_data:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Get user from database
    user = await get_user_by_clerk_id(db, clerk_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Now you can use the authenticated user
    result = await process_request(db, user, request)
    return result
```

### Alternative: JWT Token Approach

You can also send the full JWT token and verify it:

```python
@router.post("/jwt-protected")
async def jwt_protected_endpoint(
    request: SomeRequest,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Valid Bearer token required")

    token = authorization.replace("Bearer ", "")

    # Verify JWT and extract user info
    session_data = await get_clerk_session(token)
    if not session_data:
        raise HTTPException(status_code=401, detail="Invalid token")

    clerk_user_id = session_data['user_id']
    # Continue with authenticated user...
```

## 📁 Database Operations Structure

```
app/db/
├── operations/           # CRUD operations for each entity
│   ├── airports.py      # Airport operations
│   ├── users.py         # User operations
│   ├── rfqs.py          # RFQ operations
│   └── quotes.py        # Quote operations
├── models_auto.py       # Auto-generated SQLAlchemy models
├── session.py           # Database session management
└── README.md            # This file
```

### Creating New Operations

To add operations for a new entity:

1. **Create the operation file:**

```python
# app/db/operations/new_entity.py
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from ..models_auto import NewEntity

async def get_new_entity_by_id(
    session: AsyncSession,
    entity_id: str
) -> Optional[NewEntity]:
    """Get entity by ID"""
    result = await session.execute(
        select(NewEntity).where(NewEntity.id == entity_id)
    )
    return result.scalar_one_or_none()

async def create_new_entity(
    session: AsyncSession,
    **kwargs
) -> NewEntity:
    """Create new entity"""
    entity = NewEntity(**kwargs)
    session.add(entity)
    await session.commit()
    await session.refresh(entity)
    return entity
```

2. **Use in your API routes:**

```python
from app.db.operations.new_entity import get_new_entity_by_id

@router.get("/new-entity/{entity_id}")
async def get_entity(
    entity_id: str,
    db: AsyncSession = Depends(get_db)
):
    entity = await get_new_entity_by_id(db, entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return entity
```

## ⚡ Best Practices

### 1. **Always Use Async/Await**

```python
# ✅ Correct
async def get_data(db: AsyncSession):
    result = await db.execute(select(Users))
    return result.scalars().all()

# ❌ Incorrect
def get_data(db: AsyncSession):
    result = db.execute(select(Users))  # Missing await
    return result.scalars().all()
```

### 2. **Handle Errors Gracefully**

```python
async def safe_database_operation(db: AsyncSession, user_id: str):
    try:
        user = await get_user_by_id(db, user_id)
        if not user:
            return None, "User not found"
        return user, None
    except Exception as e:
        logger.error(f"Database error: {e}")
        return None, "Database error occurred"
```

### 3. **Use Type Hints**

```python
from typing import Optional, List
from app.db.models_auto import Users

async def get_user_by_email(
    db: AsyncSession,
    email: str
) -> Optional[Users]:
    # Function implementation...
```

### 4. **Commit Changes Explicitly**

```python
async def update_user_profile(db: AsyncSession, user_id: str, data: dict):
    # Update user
    await update_user(db, user_id, **data)

    # Always commit changes
    await db.commit()

    # Return updated user
    return await get_user_by_id(db, user_id)
```

## 🔍 Debugging Database Issues

### 1. **Enable SQL Logging**

The database engine is configured with `echo=True` in `session.py`, so SQL queries are logged to the console.

### 2. **Check Connection Pool Status**

```python
from app.db.session import get_db_connection

async def check_db_health():
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.fetchval("SELECT 1")
            return {"status": "healthy", "test_query": result}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

### 3. **Common Issues**

- **Connection pool exhausted**: Check if you're properly closing connections
- **Transaction deadlocks**: Ensure proper transaction ordering
- **Model import errors**: Verify `models_auto.py` is up to date

## 📚 Additional Resources

- [SQLAlchemy Async Documentation](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [FastAPI Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [PostgreSQL AsyncPG](https://magicstack.github.io/asyncpg/)
