from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .router import api_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="NOA-E API",
        description="NOA-E (Node Oriented Agent - Education) Visual Agent Builder & Execution Engine API",
        version="0.1.0",
    )

    # CORS 설정 (개발 환경용)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 라우터 등록
    app.include_router(api_router, prefix="/api")

    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    return app
