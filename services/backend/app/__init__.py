from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .router import api_router
from app.db import Base, engine
import app.models  # noqa: F401 - 모델들이 Base.metadata에 등록되도록 임포트

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 애플리케이션 시작 시 DB 테이블 자동 생성
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[Warning] Failed to initialize DB tables: {e}")
    yield

def create_app() -> FastAPI:
    app = FastAPI(
        title="NOA-E API",
        description="NOA-E (Node Oriented Agent - Education) Visual Agent Builder & Execution Engine API",
        version="0.1.0",
        lifespan=lifespan,
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
