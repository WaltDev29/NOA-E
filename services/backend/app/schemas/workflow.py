from typing import List, Dict, Any
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
