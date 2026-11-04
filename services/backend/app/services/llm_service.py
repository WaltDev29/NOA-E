import json
import os
import re
from typing import Optional, Dict, Any, Tuple, List
from langchain_openai import ChatOpenAI

def load_backend_env() -> Dict[str, str]:
    """
    컨테이너 및 호스트의 .env.backend 파일을 실시간으로 읽어 최신 환경 변수를 반환합니다.
    """
    env_vars: Dict[str, str] = {}
    candidates = ["/app/.env.backend", "services/backend/.env.backend", "docker/env/.env.backend"]
    for path in candidates:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()

                # MODELS_CONFIG={...} 블록 추출 (여러 줄 JSON 지원)
                models_match = re.search(r"MODELS_CONFIG\s*=\s*(\{.*?\n\s*\})", content, re.DOTALL)
                if models_match:
                    env_vars["MODELS_CONFIG"] = models_match.group(1).strip()

                # 단일 라인 키=값 파싱
                for line in content.splitlines():
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line and not line.startswith("MODELS_CONFIG"):
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip().strip("'\"")
                return env_vars
            except Exception as e:
                print(f"[LLM_SERVICE] Failed to read {path}: {e}")
    return env_vars

def get_backend_models_config() -> Tuple[str, Dict[str, Any]]:
    """
    .env.backend 파일 또는 환경 변수로부터 기본 모델과 모델 매핑 설정을 가져옵니다.
    """
    env_file = load_backend_env()
    
    # 1. MODELS_CONFIG 로드
    raw_config = env_file.get("MODELS_CONFIG") or os.getenv("MODELS_CONFIG", "{}")
    models_config = {}
    if raw_config:
        try:
            models_config = json.loads(raw_config)
        except Exception as e:
            print(f"[LLM_SERVICE] MODELS_CONFIG JSON 파싱 실패: {e}")

    # 2. 기본 모델 로드
    default_model = env_file.get("LLM_MODEL") or os.getenv("LLM_MODEL", "gemma2:2b")
    return default_model, models_config

def get_llm(custom_config: Optional[Dict[str, Any]] = None):
    custom_config = custom_config or {}
    env_file = load_backend_env()
    
    default_model, models_config = get_backend_models_config()
    
    # 1. 사용할 모델명 결정 (노드 config > 환경설정 LLM_MODEL > 기본값)
    target_model = custom_config.get("model") or default_model
    
    # 2. 모델별 사전 정의 설정 확인
    matched_model_config = models_config.get(target_model, {})

    # 3. 엔드포인트 URL 및 API Key 우선순위 매핑
    node_base_url = custom_config.get("base_url")
    node_api_key = custom_config.get("api_key")
    
    matched_base_url = matched_model_config.get("base_url")
    matched_api_key = matched_model_config.get("api_key")

    openai_key = env_file.get("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY", "")
    global_base_url = env_file.get("LLM_BASE_URL") or os.getenv("LLM_BASE_URL", "http://ollama:11434/v1")
    global_api_key = env_file.get("LLM_API_KEY") or os.getenv("LLM_API_KEY", "ollama")

    is_openai_model = (
        target_model.startswith("gpt-") or 
        target_model.startswith("o1") or 
        target_model.startswith("o3") or 
        target_model.startswith("chatgpt")
    )

    # 최종 BASE_URL 결정
    if node_base_url:
        final_base_url = node_base_url
    elif matched_base_url:
        final_base_url = matched_base_url
    elif is_openai_model:
        final_base_url = "https://api.openai.com/v1"
    else:
        final_base_url = global_base_url

    # 최종 API_KEY 결정
    if node_api_key:
        final_api_key = node_api_key
    elif matched_api_key:
        final_api_key = matched_api_key
    elif is_openai_model:
        final_api_key = openai_key or global_api_key
    else:
        final_api_key = global_api_key or "ollama"

    default_headers = custom_config.get("default_headers") or {"User-Agent": "Mozilla/5.0"}

    # ChatOpenAI 객체 생성
    if is_openai_model and (not final_base_url or final_base_url == "https://api.openai.com/v1"):
        llm = ChatOpenAI(
            model=target_model,
            api_key=final_api_key,
        )
    else:
        llm = ChatOpenAI(
            model=target_model,
            base_url=final_base_url,
            api_key=final_api_key or "x",
            default_headers=default_headers,
            reasoning_effort="none" if not (target_model.startswith("o1") or target_model.startswith("o3")) else None
        )
    return llm
