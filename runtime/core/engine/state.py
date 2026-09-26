from typing import TypedDict, Annotated, Sequence, Optional
import operator

class AgentState(TypedDict):
    input_text: str             
    input_images: Optional[list[str]] # URL 또는 Base64 인코딩 문자열
    current_output: str         
    messages: Annotated[Sequence[dict], operator.add] 
    logs: Annotated[list[str], operator.add] 
