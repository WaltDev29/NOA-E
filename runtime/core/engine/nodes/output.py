from .base import BaseNode
from ..registry import register_node
from typing import Dict, Any

@register_node("output")
class OutputNode(BaseNode):
    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        output_text = state.get("current_output", "")
        return {
            "current_output": output_text,
            "logs": [f"[{self.node_id}] Final output: {output_text}"]
        }
