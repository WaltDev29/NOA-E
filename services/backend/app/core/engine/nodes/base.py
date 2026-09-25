from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseNode(ABC):
    def __init__(self, node_id: str, config: dict):
        self.node_id = node_id
        self.config = config or {}

    @abstractmethod
    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        State를 인자로 받아 수정할 State를 반환. 
        (LangGraph는 반환된 딕셔너리로 전체 State를 갱신함)
        """
        pass
