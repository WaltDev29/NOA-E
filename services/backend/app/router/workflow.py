import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any

from app.core.engine.compiler import WorkflowCompiler

router = APIRouter()

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

@router.post("/run")
async def run_workflow(request: WorkflowRequest):
    # React Flow 형식을 백엔드 엔진 규격으로 변환
    # React Flow type (inputNode, llmNode, outputNode) -> Backend type (input, llm, output)
    type_map = {
        "inputNode": "input",
        "llmNode": "llm",
        "outputNode": "output",
        "searchNode": "search",
        "calculatorNode": "calculator",
        "agentNode": "agent"
    }
    
    workflow_json = {
        "nodes": [
            {
                "id": n.id, 
                "type": type_map.get(n.type, n.type), 
                "config": n.data.get("config", {})
            } 
            for n in request.nodes
        ],
        "edges": [{"source": e.source, "target": e.target} for e in request.edges]
    }
    
    compiler = WorkflowCompiler()
    graph = compiler.compile_workflow(workflow_json)
    
    # Input Node가 사용할 초기 값 설정 (React Flow의 Input 노드의 config에서 추출)
    initial_text = ""
    for n in request.nodes:
        if n.type == "inputNode":
            initial_text = n.data.get("config", {}).get("input_text", "")
            break
            
    initial_state = {
        "input_text": initial_text,
        "current_output": "",
        "messages": request.messages,
        "logs": []
    }
    
    async def event_generator():
        def custom_serializer(obj):
            if hasattr(obj, "type") and hasattr(obj, "content"):
                return {"type": obj.type, "content": obj.content}
            if hasattr(obj, "content"):
                return {"type": "unknown", "content": obj.content}
            return str(obj)
            
        try:
            # stream_mode="updates"는 각 노드가 실행될 때 반환하는 상태 업데이트(dict)를 스트리밍합니다.
            async for chunk in graph.astream(initial_state, stream_mode="updates"):
                # chunk is typically {"node_name": {"key": "value"}}
                yield f"data: {json.dumps(chunk, default=custom_serializer)}\n\n"
            
            yield "data: [DONE]\n\n"
        except Exception as e:
            error_msg = {"error": str(e)}
            yield f"data: {json.dumps(error_msg)}\n\n"
            yield "data: [DONE]\n\n"
            
    return StreamingResponse(
        event_generator(), 
        media_type="text/event-stream", 
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
