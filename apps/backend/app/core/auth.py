# backend/app/core/auth.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.clerk_service import verify_clerk_jwt

bearer = HTTPBearer(auto_error=False)

def _normalize(d: dict) -> dict:
    return {
        "user_id": d.get("sub"),
        "org_id": d.get("orgId"),
        "sid": d.get("sid"),
        "claims": d.get("claims", d),
    }

async def require_auth(creds: HTTPAuthorizationCredentials | None = Depends(bearer)):
    if not creds or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    decoded = await verify_clerk_jwt(creds.credentials)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid token")
    norm = _normalize(decoded)
    if not norm["user_id"]:
        raise HTTPException(status_code=401, detail="Missing user id (sub)")
    if not norm["org_id"]:
        raise HTTPException(status_code=403, detail="Missing active org")
    return norm
