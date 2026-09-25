from langchain_openai import ChatOpenAI
from typing import Optional, Dict, Any
import os

def get_llm(custom_config: Optional[Dict[str, Any]] = None):
    custom_config = custom_config or {}
    
    USE_OPENAI = os.getenv("USE_OPENAI", "true")
    MODEL = custom_config.get("model") or os.getenv("LLM_MODEL", "gpt-4o-mini")
    API_KEY = custom_config.get("api_key") or os.getenv("LLM_API_KEY", "")
    BASE_URL = custom_config.get("base_url") or os.getenv("LLM_BASE_URL", "")
    HEADERS = custom_config.get("default_headers") or {"User-Agent": "Mozilla/5.0"}
    
    # 만약 사용자가 base_url을 명시적으로 입력했다면, OpenAI 모드 여부와 관계없이 커스텀 엔드포인트를 타야함
    is_custom_url = bool(custom_config.get("base_url"))

    if USE_OPENAI.lower() == "true" and not is_custom_url:
        llm = ChatOpenAI(
            model=MODEL, 
            api_key=API_KEY,
        )
    else:
        llm = ChatOpenAI(
            model=MODEL,
            base_url=BASE_URL,
            api_key=API_KEY or "x",  # 로컬 서버는 API_KEY가 빈 문자열이면 에러 나는 경우 대비
            default_headers=HEADERS,
            reasoning_effort="none"
        )
    return llm
