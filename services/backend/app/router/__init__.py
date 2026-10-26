from fastapi import APIRouter
from . import workflow
from . import auth

api_router = APIRouter()

api_router.include_router(workflow.router, prefix="/workflow", tags=["Workflow"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
