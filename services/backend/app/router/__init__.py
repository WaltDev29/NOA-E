from fastapi import APIRouter
from . import workflow

api_router = APIRouter()

api_router.include_router(workflow.router, prefix="/workflow", tags=["Workflow"])
