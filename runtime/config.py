import os
import socket
from typing import Optional, Dict, Any
from langchain_openai import ChatOpenAI

# 웹 페이지(Nginx/Backend) 경유 LLM 프록시 엔드포인트 및 로컬 Ollama 폴백 엔드포인트
DEFAULT_WEB_LLM_PROXY_URL = os.getenv("SERVER_WEB_LLM_URL", "https://waltdev29.aikopo.net/noa-e/api/workflow/llm/v1")
DEFAULT_BACKEND_LLM_PROXY_URL = os.getenv("SERVER_BACKEND_LLM_URL", "http://localhost:8000/api/workflow/llm/v1")
DEFAULT_SERVER_OLLAMA_URL = os.getenv("SERVER_OLLAMA_URL", "http://localhost:11434/v1")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-6-luna")


def _is_local_port_open(port: int, host: str = "127.0.0.1", timeout: float = 0.25) -> bool:
    """로컬 웹 서버(포트 80 또는 8000) 가동 여부를 빠르게 확인합니다."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False


def _resolve_default_gateway_url() -> str:
    """
    왜: 외부 커스텀 API를 설정하지 않은 경우 '로컬 런타임 -> 배포 서버(Nginx) -> 백엔드 LLM API' 순서로
    호출하도록 구성하며, 로컬 개발 환경(포트 8000)이 켜져 있을 때만 로컬 백엔드를 우선 호출합니다.
    """
    if os.getenv("SERVER_WEB_LLM_URL"):
        return os.getenv("SERVER_WEB_LLM_URL", DEFAULT_WEB_LLM_PROXY_URL)
    # 1. 로컬 백엔드(localhost:8000)가 켜져 있으면 로컬 개발 백엔드 우선 호출
    if _is_local_port_open(8000):
        return DEFAULT_BACKEND_LLM_PROXY_URL
    # 2. 그 외 일반 사용자 환경에서는 배포 서버(Nginx 서브패스) 프록시 호출
    return DEFAULT_WEB_LLM_PROXY_URL


def get_runtime_llm(custom_config: Optional[Dict[str, Any]] = None):
    """
    각 LLM 노드의 설정 및 런타임 환경에 따라 최적의 LLM 인스턴스를 생성합니다.
    우선순위:
    1. 노드 개별 커스텀 설정 (base_url, api_key, model)
    2. 로컬 환경 변수 설정
    3. 기본값: 웹 페이지 경유 LLM 게이트웨이 (/api/workflow/llm/v1) -> 오프라인 시 로컬 Ollama 폴백
    """
    custom_config = custom_config or {}
    
    is_custom = custom_config.get("is_custom", False)
    base_url = custom_config.get("base_url") or os.getenv("LLM_BASE_URL", "")
    api_key = custom_config.get("api_key") or os.getenv("LLM_API_KEY", "")
    model = custom_config.get("model") or os.getenv("LLM_MODEL", DEFAULT_MODEL)
    default_headers = custom_config.get("default_headers") or {"User-Agent": "NOA-E-Runtime/1.0"}
    temperature = float(custom_config.get("temperature", 0.7))

    default_urls = {
        "",
        DEFAULT_SERVER_OLLAMA_URL,
        DEFAULT_WEB_LLM_PROXY_URL,
        DEFAULT_BACKEND_LLM_PROXY_URL,
    }

    # 1. 사용자가 커스텀 API를 명시한 경우
    if is_custom or (base_url not in default_urls) or (api_key and api_key not in ("ollama", "noa-e-runtime")):
        if not base_url:
            # base_url이 없는데 api_key만 있다면 OpenAI 표준 엔드포인트 사용
            return ChatOpenAI(
                model=model,
                api_key=api_key,
                temperature=temperature,
                use_responses_api=False,
            )
        else:
            # 커스텀 Base URL (OpenAI 호환 프록시, Groq, vLLM, 로컬 커스텀 Ollama 등)
            return ChatOpenAI(
                model=model,
                base_url=base_url,
                api_key=api_key or "custom-key",
                default_headers=default_headers,
                temperature=temperature,
                use_responses_api=False,
            )

    # 2. 기본값: 웹 페이지(백엔드 게이트웨이)를 경유하여 웹 페이지에 설정된 LLM API 호출
    gateway_url = _resolve_default_gateway_url()
    return ChatOpenAI(
        model=model or DEFAULT_MODEL,
        base_url=gateway_url,
        api_key="noa-e-runtime",
        default_headers=default_headers,
        temperature=temperature,
        use_responses_api=False,
    )
