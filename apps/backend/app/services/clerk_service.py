# backend/services/clerk_service.py
import os, time, json, logging
from typing import Optional, Dict, Any
import httpx
import jwt
from jwt import InvalidTokenError

logger = logging.getLogger(__name__)

def _get_clerk_config():
    """Get Clerk configuration at runtime, loading environment variables if needed."""
    
    CLERK_ISSUER = os.getenv("CLERK_ISSUER")
    CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")
    BACKEND_AUD = os.getenv("CLERK_BACKEND_AUD")
    # Validate environment variables - Fails fast if missing
    for k, v in {"CLERK_ISSUER": CLERK_ISSUER, "CLERK_JWKS_URL": CLERK_JWKS_URL, "CLERK_BACKEND_AUD": BACKEND_AUD}.items():
        if not v:
            raise RuntimeError(f"Missing required env: {k}")
    
    return CLERK_ISSUER, CLERK_JWKS_URL, BACKEND_AUD

_jwks_cache: Dict[str, Any] = {"keys": [], "fetched_at": 0}

async def _get_jwks() -> Dict[str, Any]:
    _, CLERK_JWKS_URL, _ = _get_clerk_config()
    now = int(time.time())
    if now - _jwks_cache["fetched_at"] > 600 or not _jwks_cache["keys"]:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(CLERK_JWKS_URL)
            resp.raise_for_status()
            data = resp.json()
        _jwks_cache["keys"] = data.get("keys", [])
        _jwks_cache["fetched_at"] = now
    return _jwks_cache

async def verify_clerk_jwt(session_token: str) -> Optional[Dict[str, Any]]:
    if not session_token:
        return None
    try:
        CLERK_ISSUER, _, BACKEND_AUD = _get_clerk_config()
        
        jwks = await _get_jwks()
        header = jwt.get_unverified_header(session_token)
        kid = header.get("kid")
        if not kid:
            return None
        key = next((k for k in jwks["keys"] if k.get("kid") == kid), None)
        if not key:
            return None

        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
        claims = jwt.decode(
            session_token,
            key=public_key,
            algorithms=[key.get("alg", "RS256")],
            issuer=CLERK_ISSUER,
            audience=BACKEND_AUD,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iss": True,
                "verify_aud": True,
            },
            leeway=60,
        )

        return {"sub": claims.get("sub"), "sid": claims.get("sid"), "orgId": claims.get("orgId"), "claims": claims}

    except InvalidTokenError as e:
        logger.warning(f"JWT invalid: {e}")
        return None
    except Exception as e:
        logger.error(f"JWT verify error: {e}")
        return None