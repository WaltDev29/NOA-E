from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseNode(ABC):
    def __init__(self, node_id: str, config: dict = None):
        self.node_id = node_id
        self.config = config or {}

    @abstractmethod
    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        pass
