# backend/middleware/auth.py
"""
Authentication middleware for FastAPI.
Runs on every request before reaching endpoints.
"""

import time
from fastapi import Request
from fastapi.middleware import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Global auth logic that runs on every request
        # E.g., rate limiting, request logging, etc.
        
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        logger.info(f"Request processed in {process_time:.4f}s")
        return response