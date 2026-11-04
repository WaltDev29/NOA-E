from typing import TypedDict, Annotated, Sequence, Optional, List, Dict, Any
import operator

def take_last(old_val: Any, new_val: Any) -> Any:
    """단일 값 필드에 대해 동시 업데이트 발생 시 가장 최신 값으로 병합하는 리듀서"""
    return new_val if new_val is not None else old_val

class AgentState(TypedDict):
    input_text: Annotated[str, take_last]
    input_images: Optional[list[str]] # URL 또는 Base64 인코딩 문자열
    current_output: Annotated[str, take_last]
    messages: Annotated[Sequence[dict], operator.add] 
    logs: Annotated[list[str], operator.add] 
    plan: Annotated[Optional[List[str]], take_last] # Planner가 수립한 단계별 작업 목록
    current_step: Annotated[int, take_last] # 현재 처리 중인 계획의 인덱스
    intermediate_steps: Annotated[List[Dict[str, Any]], operator.add] # Worker들의 단계별 수행 결과 누적
    loop_count: Annotated[int, take_last] # Router를 통과한 루프 횟수 (무한 루프 방지용)
    next_worker: Annotated[Optional[str], take_last] # Router가 동적으로 결정한 다음 목적지 노드 ID
    routing_result: Annotated[Optional[str], take_last] # Router의 분기 결정 안내 메시지
