from .base import BaseNode
from ..registry import register_node
from typing import Dict, Any
from langchain_core.tools import tool
import re

@tool
def calculate(expression: str) -> str:
    """Evaluate a mathematical expression. Only basic math operators are allowed."""
    # Basic security against arbitrary code execution
    allowed = set("0123456789+-*/(). ")
    if not set(expression).issubset(allowed):
        return "Error: Invalid characters in expression."
    try:
        # safe eval
        result = eval(expression, {"__builtins__": {}}, {})
        return str(result)
    except Exception as e:
        return f"Error evaluating expression: {str(e)}"

@tool
def web_search(query: str) -> str:
    """Search the web for information."""
    # MVP Mock Search
    return f"Search results for '{query}': According to recent data, this is a simulated web search result for the query."

@register_node("calculator")
class CalculatorNode(BaseNode):
    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        input_text = state.get("current_output", "")
        result = calculate(input_text)
        return {
            "current_output": result,
            "logs": [f"[{self.node_id}] Evaluated: {input_text} = {result}"]
        }
        
    def get_tool(self):
        return calculate

@register_node("search")
class SearchNode(BaseNode):
    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        input_text = state.get("current_output", "")
        result = web_search(input_text)
        return {
            "current_output": result,
            "logs": [f"[{self.node_id}] Searched for: {input_text}"]
        }
        
    def get_tool(self):
        return web_search
