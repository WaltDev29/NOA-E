from .base import BaseNode
from ..registry import register_node
from typing import Dict, Any

@register_node("input")
class InputNode(BaseNode):
    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        input_text = state.get("input_text", "")
        return {
            "current_output": input_text,
            "logs": [f"[{self.node_id}] Processed input: {input_text}"]
        }
