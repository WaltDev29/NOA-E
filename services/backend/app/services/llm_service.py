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

                # MODELS_CONFIG={...} 블록 추출 (중첩 중괄호 완벽 지원)
                idx = content.find("MODELS_CONFIG")
                if idx != -1:
                    eq_idx = content.find("=", idx)
                    if eq_idx != -1:
                        brace_start = content.find("{", eq_idx)
                        if brace_start != -1:
                            depth = 0
                            in_str = False
                            escape = False
                            for i in range(brace_start, len(content)):
                                ch = content[i]
                                if in_str:
                                    if escape:
                                        escape = False
                                    elif ch == "\\":
                                        escape = True
                                    elif ch == '"':
                                        in_str = False
                                else:
                                    if ch == '"':
                                        in_str = True
                                    elif ch == '{':
                                        depth += 1
                                    elif ch == '}':
                                        depth -= 1
                                        if depth == 0:
                                            env_vars["MODELS_CONFIG"] = content[brace_start:i+1].strip()
                                            break

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

def resolve_model_endpoint_config(custom_config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    왜: 웹 스튜디오 직접 실행(get_llm)과 로컬 런타임의 웹 경유 프록시 요청(/api/workflow/llm/v1/chat/completions)이
    동일한 우선순위 규칙(.env.backend의 MODELS_CONFIG -> 글로벌 설정)으로 모델별 엔드포인트와 API Key를 해석하도록 모듈화합니다.
    """
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

    is_reasoning_model = target_model.startswith("o1") or target_model.startswith("o3")

    return {
        "target_model": target_model,
        "final_base_url": final_base_url,
        "final_api_key": final_api_key,
        "is_openai_model": is_openai_model,
        "is_reasoning_model": is_reasoning_model,
    }


def get_llm(custom_config: Optional[Dict[str, Any]] = None):
    custom_config = custom_config or {}
    resolved = resolve_model_endpoint_config(custom_config)

    target_model = resolved["target_model"]
    final_base_url = resolved["final_base_url"]
    final_api_key = resolved["final_api_key"]
    is_openai_model = resolved["is_openai_model"]
    is_reasoning_model = resolved["is_reasoning_model"]

    default_headers = custom_config.get("default_headers") or {"User-Agent": "Mozilla/5.0"}

    # Temperature 파라미터 추출 (기본값 0.7, 0.0 ~ 2.0 범위 클램핑)
    raw_temp = custom_config.get("temperature")
    try:
        temperature = max(0.0, min(2.0, float(raw_temp))) if raw_temp is not None else 0.7
    except (ValueError, TypeError):
        temperature = 0.7

    # ChatOpenAI 객체 생성
    if is_openai_model and (not final_base_url or final_base_url == "https://api.openai.com/v1"):
        llm_kwargs: Dict[str, Any] = {
            "model": target_model,
            "api_key": final_api_key,
        }
        if not is_reasoning_model:
            llm_kwargs["temperature"] = temperature
        llm = ChatOpenAI(**llm_kwargs)
    else:
        llm_kwargs = {
            "model": target_model,
            "base_url": final_base_url,
            "api_key": final_api_key or "x",
            "default_headers": default_headers,
            "reasoning_effort": "none" if not is_reasoning_model else None,
        }
        if not is_reasoning_model:
            llm_kwargs["temperature"] = temperature
        llm = ChatOpenAI(**llm_kwargs)
    return llm


def extract_model_capabilities(config: Dict[str, Any]) -> Dict[str, bool]:
    """
    모델 설정 딕셔너리에서 image, tool, mcp, skill 지원 여부를 추출합니다.
    기본값은 모두 False이며, 명시적으로 True로 선언된 속성만 True로 설정됩니다.
    최상위 키("tool": true) 및 중첩 키("capabilities": {"tool": true}) 모두 지원합니다.
    """
    caps_data = config.get("capabilities", {}) if isinstance(config.get("capabilities"), dict) else {}
    
    def check_bool(key: str) -> bool:
        # 최상위 키 우선 확인 (대소문자 무관)
        for k in [key, key.lower(), key.capitalize(), key.upper()]:
            if k in config:
                val = config[k]
                return str(val).lower() in ("true", "1", "yes")
            if k in caps_data:
                val = caps_data[k]
                return str(val).lower() in ("true", "1", "yes")
        return False

    return {
        "image": check_bool("image"),
        "tool": check_bool("tool"),
        "mcp": check_bool("mcp"),
        "skill": check_bool("skill")
    }

def get_backend_models_capabilities() -> Dict[str, Dict[str, bool]]:
    """
    모든 등록된 모델의 image, tool, mcp, skill 기능 지원 맵을 동적으로 반환합니다.
    """
    default_model, models_config = get_backend_models_config()
    capabilities_map = {}
    
    # 등록된 각 모델의 capabilities 추출
    for model_name, cfg in models_config.items():
        if isinstance(cfg, dict):
            capabilities_map[model_name] = extract_model_capabilities(cfg)
        else:
            capabilities_map[model_name] = {"image": False, "tool": False, "mcp": False, "skill": False}
            
    # default_model이 누락되어 있다면 기본값(전부 False)으로 추가
    if default_model not in capabilities_map:
        capabilities_map[default_model] = {"image": False, "tool": False, "mcp": False, "skill": False}
        
    return capabilities_map
