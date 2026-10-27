import json
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.core.engine.compiler import WorkflowCompiler
from app.schemas.workflow import WorkflowRequest, WorkflowSaveRequest, WorkflowDetailResponse
from app.db.session import get_db
from app.models.workflow import AgentWorkflow
from app.models.user import User

router = APIRouter()

@router.post("/save", response_model=WorkflowDetailResponse, summary="워크플로우 저장/수정")
def save_workflow(req: WorkflowSaveRequest, db: Session = Depends(get_db)):
    # 1. 사용자 존재 여부 확인
    try:
        user_uuid = uuid.UUID(req.user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="유효하지 않은 사용자 ID입니다.")

    user = db.get(User, user_uuid)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    clean_title = req.title.strip()
    if not clean_title:
        raise HTTPException(status_code=400, detail="에이전트 이름을 입력해주세요.")

    # 2. 기존 워크플로우 업데이트 또는 신규 생성
    if req.id:
        try:
            wf_uuid = uuid.UUID(req.id)
            wf = db.get(AgentWorkflow, wf_uuid)
            if wf and wf.user_id == user_uuid:
                # 수정 시 동일 사용자 내 다른 에이전트와 이름 중복 확인
                dup_stmt = select(AgentWorkflow).where(
                    AgentWorkflow.user_id == user_uuid,
                    AgentWorkflow.title == clean_title,
                    AgentWorkflow.id != wf_uuid
                )
                if db.execute(dup_stmt).scalar_one_or_none():
                    raise HTTPException(status_code=400, detail=f"'{clean_title}' 이름의 에이전트가 이미 존재합니다.")

                wf.title = clean_title
                wf.description = req.description
                wf.graph_data = req.graph_data
                db.commit()
                db.refresh(wf)
                return WorkflowDetailResponse(
                    id=str(wf.id),
                    user_id=str(wf.user_id),
                    title=wf.title,
                    description=wf.description,
                    graph_data=wf.graph_data,
                    created_at=wf.created_at.isoformat(),
                    updated_at=wf.updated_at.isoformat(),
                )
        except ValueError:
            pass

    # 신규 생성 시 동일 사용자 내 이름 중복 확인
    dup_stmt = select(AgentWorkflow).where(
        AgentWorkflow.user_id == user_uuid,
        AgentWorkflow.title == clean_title
    )
    if db.execute(dup_stmt).scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"'{clean_title}' 이름의 에이전트가 이미 존재합니다.")

    new_wf = AgentWorkflow(
        user_id=user_uuid,
        title=clean_title,
        description=req.description,
        graph_data=req.graph_data,
    )
    db.add(new_wf)
    db.commit()
    db.refresh(new_wf)

    return WorkflowDetailResponse(
        id=str(new_wf.id),
        user_id=str(new_wf.user_id),
        title=new_wf.title,
        description=new_wf.description,
        graph_data=new_wf.graph_data,
        created_at=new_wf.created_at.isoformat(),
        updated_at=new_wf.updated_at.isoformat(),
    )

@router.get("/my", response_model=List[WorkflowDetailResponse], summary="내 에이전트 워크플로우 목록 조회")
def get_my_workflows(user_id: str = Query(..., description="사용자 ID"), db: Session = Depends(get_db)):
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="유효하지 않은 사용자 ID입니다.")

    stmt = (
        select(AgentWorkflow)
        .where(AgentWorkflow.user_id == user_uuid)
        .order_by(desc(AgentWorkflow.updated_at))
    )
    workflows = db.execute(stmt).scalars().all()

    return [
        WorkflowDetailResponse(
            id=str(w.id),
            user_id=str(w.user_id),
            title=w.title,
            description=w.description,
            graph_data=w.graph_data,
            created_at=w.created_at.isoformat(),
            updated_at=w.updated_at.isoformat(),
        )
        for w in workflows
    ]

@router.get("/{workflow_id}", response_model=WorkflowDetailResponse, summary="단일 워크플로우 상세 조회")
def get_workflow_by_id(workflow_id: str, db: Session = Depends(get_db)):
    try:
        wf_uuid = uuid.UUID(workflow_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="유효하지 않은 ID 형식입니다.")

    wf = db.get(AgentWorkflow, wf_uuid)
    if not wf:
        raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다.")

    return WorkflowDetailResponse(
        id=str(wf.id),
        user_id=str(wf.user_id),
        title=wf.title,
        description=wf.description,
        graph_data=wf.graph_data,
        created_at=wf.created_at.isoformat(),
        updated_at=wf.updated_at.isoformat(),
    )

@router.post("/{workflow_id}/duplicate", response_model=WorkflowDetailResponse, summary="에이전트 워크플로우 복제")
def duplicate_workflow(
    workflow_id: str,
    user_id: str = Query(..., description="사용자 ID"),
    db: Session = Depends(get_db)
):
    try:
        wf_uuid = uuid.UUID(workflow_id)
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="유효하지 않은 ID 형식입니다.")

    wf = db.get(AgentWorkflow, wf_uuid)
    if not wf or wf.user_id != user_uuid:
        raise HTTPException(status_code=404, detail="복제할 워크플로우를 찾을 수 없거나 권한이 없습니다.")

    # 복제 이름 결정 규칙:
    # 1. '이름(복사본)' 시도
    # 2. 존재하면 '이름(복사본1)', '이름(복사본2)' ... 순차 증가 검사
    base_title = wf.title
    # 만약 이미 끝이 (복사본) 또는 (복사본N)이면 기본 명칭 유지
    stmt_all_titles = select(AgentWorkflow.title).where(AgentWorkflow.user_id == user_uuid)
    existing_titles = set(db.execute(stmt_all_titles).scalars().all())

    candidate = f"{base_title}(복사본)"
    if candidate in existing_titles:
        counter = 1
        while True:
            candidate = f"{base_title}(복사본{counter})"
            if candidate not in existing_titles:
                break
            counter += 1

    new_wf = AgentWorkflow(
        user_id=user_uuid,
        title=candidate,
        description=wf.description,
        graph_data=wf.graph_data,
    )
    db.add(new_wf)
    db.commit()
    db.refresh(new_wf)

    return WorkflowDetailResponse(
        id=str(new_wf.id),
        user_id=str(new_wf.user_id),
        title=new_wf.title,
        description=new_wf.description,
        graph_data=new_wf.graph_data,
        created_at=new_wf.created_at.isoformat(),
        updated_at=new_wf.updated_at.isoformat(),
    )

@router.delete("/{workflow_id}", status_code=status.HTTP_200_OK, summary="에이전트 워크플로우 삭제")
def delete_workflow(
    workflow_id: str,
    user_id: str = Query(..., description="사용자 ID"),
    db: Session = Depends(get_db)
):
    try:
        wf_uuid = uuid.UUID(workflow_id)
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="유효하지 않은 ID 형식입니다.")

    wf = db.get(AgentWorkflow, wf_uuid)
    if not wf:
        raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다.")

    if wf.user_id != user_uuid:
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")

    db.delete(wf)
    db.commit()
    return {"message": "에이전트 워크플로우가 성공적으로 삭제되었습니다."}

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

    if not initial_text or not str(initial_text).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Input 노드에 입력된 메시지가 없습니다. 에이전트에게 전달할 메시지를 입력해주세요."
        )
            
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
