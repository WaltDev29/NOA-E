import os
from typing import Optional, Dict, Any
from langchain_openai import ChatOpenAI

# 기본 프로젝트 서버의 Ollama 엔드포인트 및 모델
DEFAULT_SERVER_OLLAMA_URL = os.getenv("SERVER_OLLAMA_URL", "http://localhost:11434/v1")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gemma2:2b")

def get_runtime_llm(custom_config: Optional[Dict[str, Any]] = None):
    """
    각 LLM 노드의 설정 및 런타임 환경에 따라 최적의 LLM 인스턴스를 생성합니다.
    우선순위:
    1. 노드 개별 커스텀 설정 (base_url, api_key, model)
    2. 로컬 환경 변수 설정
    3. 기본 프로젝트 서버 Ollama 엔드포인트
    """
    custom_config = custom_config or {}
    
    is_custom = custom_config.get("is_custom", False)
    base_url = custom_config.get("base_url") or os.getenv("LLM_BASE_URL", "")
    api_key = custom_config.get("api_key") or os.getenv("LLM_API_KEY", "")
    model = custom_config.get("model") or os.getenv("LLM_MODEL", DEFAULT_MODEL)
    default_headers = custom_config.get("default_headers") or {"User-Agent": "NOA-E-Runtime/1.0"}
    temperature = float(custom_config.get("temperature", 0.7))

    # 1. 사용자가 커스텀 API를 명시한 경우
    if is_custom or (base_url and base_url != DEFAULT_SERVER_OLLAMA_URL) or (api_key and api_key != "ollama"):
        if not base_url:
            # base_url이 없는데 api_key만 있다면 OpenAI 표준 엔드포인트 사용
            return ChatOpenAI(
                model=model,
                api_key=api_key,
                temperature=temperature,
            )
        else:
            # 커스텀 Base URL (OpenAI 호환 프록시, Groq, vLLM, 로컬 커스텀 Ollama 등)
            return ChatOpenAI(
                model=model,
                base_url=base_url,
                api_key=api_key or "custom-key",
                default_headers=default_headers,
                temperature=temperature,
            )

    # 2. 기본값: 프로젝트 서버의 Ollama 컨테이너 사용
    return ChatOpenAI(
        model=model or DEFAULT_MODEL,
        base_url=DEFAULT_SERVER_OLLAMA_URL,
        api_key="ollama",
        default_headers=default_headers,
        temperature=temperature,
    )
