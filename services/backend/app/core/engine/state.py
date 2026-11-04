from typing import TypedDict, Annotated, Sequence, Optional, List, Dict, Any
import operator

class AgentState(TypedDict):
    input_text: str             
    input_images: Optional[list[str]] # URL 또는 Base64 인코딩 문자열
    current_output: str         
    messages: Annotated[Sequence[dict], operator.add] 
    logs: Annotated[list[str], operator.add] 
    plan: Optional[List[str]] # Planner가 수립한 단계별 작업 목록
    current_step: int # 현재 처리 중인 계획의 인덱스
    intermediate_steps: Annotated[List[Dict[str, Any]], operator.add] # Worker들의 단계별 수행 결과 누적
    loop_count: int # Router를 통과한 루프 횟수 (무한 루프 방지용)
    next_worker: Optional[str] # Router가 동적으로 결정한 다음 목적지 노드 ID
