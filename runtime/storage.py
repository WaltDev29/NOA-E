import json
import os
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

STORAGE_DIR = os.path.join(os.path.dirname(__file__), ".storage")
AGENTS_REGISTRY_FILE = os.path.join(STORAGE_DIR, "agents.json")
SETTINGS_FILE = os.path.join(STORAGE_DIR, "settings.json")
CHATS_DIR = os.path.join(STORAGE_DIR, "chats")

def ensure_storage_dirs():
    os.makedirs(STORAGE_DIR, exist_ok=True)
    os.makedirs(CHATS_DIR, exist_ok=True)

# -------------------------------------------------------------
# 전역 환경 설정 관리 (테마 등)
# -------------------------------------------------------------
def get_app_settings() -> Dict[str, Any]:
    ensure_storage_dirs()
    if not os.path.exists(SETTINGS_FILE):
        return {"theme": "dark"}
    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict):
                return data
            return {"theme": "dark"}
    except Exception:
        return {"theme": "dark"}

def save_app_settings(settings: Dict[str, Any]):
    ensure_storage_dirs()
    try:
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(settings, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Failed to save settings: {e}")

def get_app_theme() -> str:
    settings = get_app_settings()
    return settings.get("theme", "dark")

def set_app_theme(theme: str):
    settings = get_app_settings()
    settings["theme"] = theme
    save_app_settings(settings)

# -------------------------------------------------------------
# 에이전트 목록 (Agents Registry) 및 최근 에이전트 관리
# -------------------------------------------------------------
def load_agents_registry() -> List[Dict[str, Any]]:
    ensure_storage_dirs()
    if not os.path.exists(AGENTS_REGISTRY_FILE):
        return []
    try:
        with open(AGENTS_REGISTRY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            return []
    except Exception:
        return []

def save_agents_registry(agents: List[Dict[str, Any]]):
    ensure_storage_dirs()
    try:
        with open(AGENTS_REGISTRY_FILE, "w", encoding="utf-8") as f:
            json.dump(agents, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Failed to save agents registry: {e}")

def get_last_agent_path() -> Optional[str]:
    """
    agents.json에서 가장 최근에 사용된(last_used_at 최신) 에이전트의 경로를 반환합니다.
    """
    agents = load_agents_registry()
    if not agents:
        return None
    
    # last_used_at 기준으로 정렬
    valid_agents = [a for a in agents if a.get("path") and os.path.exists(a["path"])]
    if not valid_agents:
        return agents[0].get("path")
    
    valid_agents.sort(key=lambda x: x.get("last_used_at", ""), reverse=True)
    return valid_agents[0].get("path")

def set_last_agent_path(file_path: str):
    """
    해당 경로의 에이전트를 agents.json 내에서 최신 사용 상태로 갱신하고 맨 앞으로 이동시킵니다.
    """
    if not file_path:
        return
    agents = load_agents_registry()
    now_iso = datetime.now().isoformat()
    matched = None
    for a in agents:
        if a.get("path") == file_path:
            matched = a
            break
            
    if matched:
        matched["last_used_at"] = now_iso
        agents.remove(matched)
        agents.insert(0, matched)
        save_agents_registry(agents)

def register_agent(agent_id: str, agent_name: str, file_path: str, description: str = "") -> Dict[str, Any]:
    """
    에이전트를 불러올 때 해당 에이전트의 경로와 메타데이터를 에이전트 목록에 등록 또는 갱신합니다.
    """
    agents = load_agents_registry()
    now_iso = datetime.now().isoformat()
    
    existing = None
    for a in agents:
        if a.get("id") == agent_id or (file_path and a.get("path") == file_path):
            existing = a
            break
            
    if existing:
        existing["id"] = agent_id
        existing["name"] = agent_name
        existing["path"] = file_path
        existing["description"] = description
        existing["last_used_at"] = now_iso
        registered_item = existing
        agents.remove(existing)
        agents.insert(0, registered_item)
    else:
        registered_item = {
            "id": agent_id,
            "name": agent_name,
            "path": file_path,
            "description": description,
            "registered_at": now_iso,
            "last_used_at": now_iso,
        }
        agents.insert(0, registered_item)

    save_agents_registry(agents)
    return registered_item

# -------------------------------------------------------------
# 에이전트별 세션 및 대화 내역 독립 관리 ({agent_id}.json)
# -------------------------------------------------------------
def _get_agent_chat_file(agent_id: str) -> str:
    ensure_storage_dirs()
    # 파일명으로 안전하게 정제
    safe_id = "".join([c for c in agent_id if c.isalnum() or c in ("-", "_")]) or "default_agent"
    return os.path.join(CHATS_DIR, f"{safe_id}.json")

def load_agent_chat_data(agent_id: Optional[str]) -> Dict[str, Any]:
    if not agent_id:
        return {"agent_id": "", "sessions": []}
    
    file_path = _get_agent_chat_file(agent_id)
    if not os.path.exists(file_path):
        return {
            "agent_id": agent_id,
            "sessions": []
        }
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, dict):
                return {"agent_id": agent_id, "sessions": []}
            return data
    except Exception:
        return {"agent_id": agent_id, "sessions": []}

def save_agent_chat_data(agent_id: str, chat_data: Dict[str, Any]):
    if not agent_id:
        return
    ensure_storage_dirs()
    file_path = _get_agent_chat_file(agent_id)
    
    # 최상단 필드에 agent_id가 반드시 위치하도록 구성
    payload = {
        "agent_id": agent_id,
        "agent_name": chat_data.get("agent_name", ""),
        "updated_at": datetime.now().isoformat(),
        "sessions": chat_data.get("sessions", [])
    }
    
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Failed to save chat data for agent {agent_id}: {e}")

def load_sessions(agent_id: Optional[str] = None) -> List[Dict[str, Any]]:
    if not agent_id:
        return []
    data = load_agent_chat_data(agent_id)
    return data.get("sessions", [])

def save_sessions(sessions: List[Dict[str, Any]], agent_id: Optional[str] = None, agent_name: str = ""):
    if not agent_id:
        return
    chat_data = {
        "agent_name": agent_name,
        "sessions": sessions
    }
    save_agent_chat_data(agent_id, chat_data)

def create_new_session(agent_id: str, title: str = "새로운 대화", session_id: Optional[str] = None, agent_name: str = "") -> Dict[str, Any]:
    sessions = load_sessions(agent_id)
    new_session = {
        "id": session_id or str(uuid.uuid4()),
        "title": title,
        "created_at": datetime.now().isoformat(),
        "messages": [],
        "logs": []
    }
    sessions.insert(0, new_session)
    save_sessions(sessions, agent_id=agent_id, agent_name=agent_name)
    return new_session

def delete_session(agent_id: str, session_id: str):
    if not agent_id:
        return
    sessions = load_sessions(agent_id)
    sessions = [s for s in sessions if s["id"] != session_id]
    save_sessions(sessions, agent_id=agent_id)

def update_session_messages(agent_id: str, session_id: str, messages: list, logs: list = None, title: Optional[str] = None):
    if not agent_id:
        return
    sessions = load_sessions(agent_id)
    for s in sessions:
        if s["id"] == session_id:
            s["messages"] = messages
            if logs is not None:
                s["logs"] = logs
            if title:
                s["title"] = title
            break
    save_sessions(sessions, agent_id=agent_id)

# -------------------------------------------------------------
# Workflow & LLM Nodes 관리 (Workflow & Node Configs)
# -------------------------------------------------------------
def extract_llm_nodes(workflow_json: dict) -> List[Dict[str, Any]]:
    """
    Workflow JSON에서 LLM 및 Agent 노드들을 추출합니다.
    """
    nodes = workflow_json.get("nodes", [])
    llm_nodes = []
    
    for n in nodes:
        node_type = n.get("type", "")
        if node_type in ("llm", "agent", "llmNode", "agentNode"):
            config = n.get("config", {}) or n.get("data", {}).get("config", {})
            label = n.get("label") or n.get("data", {}).get("label") or f"{node_type.upper()} ({n.get('id')})"
            llm_nodes.append({
                "id": n.get("id"),
                "type": node_type,
                "label": label,
                "model": config.get("model", "gemma2:2b"),
                "base_url": config.get("base_url", ""),
                "api_key": config.get("api_key", ""),
                "is_custom": config.get("is_custom", False) or bool(config.get("base_url") or config.get("api_key")),
                "temperature": config.get("temperature", 0.7),
                "system_prompt": config.get("system_prompt", ""),
            })
    return llm_nodes

def update_llm_configs_in_workflow(workflow_json: dict, updated_configs: Dict[str, Dict[str, Any]], file_path: Optional[str] = None) -> dict:
    """
    사용자가 GUI에서 설정한 LLM 노드별 설정을 workflow_json에 반영하고,
    file_path가 제공된 경우 해당 파일에도 영구 저장합니다.
    """
    nodes = workflow_json.get("nodes", [])
    for n in nodes:
        node_id = n.get("id")
        if node_id in updated_configs:
            cfg = updated_configs[node_id]
            updated_dict = {
                "model": cfg.get("model", "gemma2:2b"),
                "base_url": cfg.get("base_url", ""),
                "api_key": cfg.get("api_key", ""),
                "is_custom": cfg.get("is_custom", False),
                "temperature": float(cfg.get("temperature", 0.7)),
            }
            if "system_prompt" in cfg:
                updated_dict["system_prompt"] = cfg["system_prompt"]

            if "config" not in n or not isinstance(n["config"], dict):
                n["config"] = {}
            n["config"].update(updated_dict)

            if "data" in n and isinstance(n["data"], dict):
                if "config" not in n["data"] or not isinstance(n["data"]["config"], dict):
                    n["data"]["config"] = {}
                n["data"]["config"].update(updated_dict)

    if file_path and os.path.exists(file_path):
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(workflow_json, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Warning: Failed to save updated workflow to {file_path}: {e}")

    return workflow_json
