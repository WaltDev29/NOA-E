from .base import BaseNode
from ..registry import register_node
from typing import Dict, Any

@register_node("output")
class OutputNode(BaseNode):
    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        current_output = state.get("current_output", "")
        return {
            "current_output": current_output,
            "logs": [f"[{self.node_id}] Received final result and ready to display."]
        }
