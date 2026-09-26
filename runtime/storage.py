import json
import os
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

STORAGE_DIR = os.path.join(os.path.dirname(__file__), ".storage")
SESSIONS_FILE = os.path.join(STORAGE_DIR, "sessions.json")
AGENT_CACHE_DIR = os.path.join(STORAGE_DIR, "agents")

def ensure_storage_dirs():
    os.makedirs(STORAGE_DIR, exist_ok=True)
    os.makedirs(AGENT_CACHE_DIR, exist_ok=True)

# -------------------------------------------------------------
# 세션 관리 (Session Management)
# -------------------------------------------------------------
def load_sessions() -> List[Dict[str, Any]]:
    ensure_storage_dirs()
    if not os.path.exists(SESSIONS_FILE):
        return []
    
    try:
        with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_sessions(sessions: List[Dict[str, Any]]):
    ensure_storage_dirs()
    with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(sessions, f, ensure_ascii=False, indent=2)

def create_new_session(title: str = "새로운 대화", session_id: Optional[str] = None) -> Dict[str, Any]:
    sessions = load_sessions()
    new_session = {
        "id": session_id or str(uuid.uuid4()),
        "title": title,
        "created_at": datetime.now().isoformat(),
        "messages": [],
        "logs": []
    }
    sessions.insert(0, new_session)
    save_sessions(sessions)
    return new_session

def delete_session(session_id: str):
    sessions = load_sessions()
    sessions = [s for s in sessions if s["id"] != session_id]
    save_sessions(sessions)

def update_session_messages(session_id: str, messages: list, logs: list = None, title: Optional[str] = None):
    sessions = load_sessions()
    for s in sessions:
        if s["id"] == session_id:
            s["messages"] = messages
            if logs is not None:
                s["logs"] = logs
            if title:
                s["title"] = title
            break
    save_sessions(sessions)

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
            if "config" not in n:
                n["config"] = {}
            n["config"].update({
                "model": cfg.get("model", "gemma2:2b"),
                "base_url": cfg.get("base_url", ""),
                "api_key": cfg.get("api_key", ""),
                "is_custom": cfg.get("is_custom", False),
                "temperature": float(cfg.get("temperature", 0.7)),
            })
            if "system_prompt" in cfg:
                n["config"]["system_prompt"] = cfg["system_prompt"]

    if file_path and os.path.exists(file_path):
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(workflow_json, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Warning: Failed to save updated workflow to {file_path}: {e}")

    return workflow_json
