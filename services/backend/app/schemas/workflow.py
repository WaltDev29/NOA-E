from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class EdgeModel(BaseModel):
    id: str
    source: str
    target: str

class NodeModel(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]

class WorkflowRequest(BaseModel):
    nodes: List[NodeModel]
    edges: List[EdgeModel]
    messages: List[Dict[str, Any]] = []

class WorkflowSaveRequest(BaseModel):
    id: Optional[str] = None  # 기존 에이전트 수정 시 전달
    user_id: str             # 저장 사용자 ID
    title: str
    description: Optional[str] = None
    graph_data: Dict[str, Any]

class WorkflowDetailResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    graph_data: Dict[str, Any]
    created_at: str
    updated_at: str
