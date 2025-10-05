from fastapi import APIRouter
from app.api.v1.endpoints import admin_router

api_router = APIRouter()

# ======= Admin endpoints =======
api_router.include_router(
    admin_router,
    tags=["admin"]
)