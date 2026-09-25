from .base import BaseNode
from ..registry import register_node
from typing import Dict, Any
from app.services.llm_service import get_llm
from langchain_core.messages import SystemMessage, HumanMessage, trim_messages
from langgraph.prebuilt import create_react_agent

@register_node("llm")
class LLMNode(BaseNode):
    def __init__(self, node_id: str, config: dict):
        super().__init__(node_id, config)
        self.tools = []

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        llm = get_llm(self.config)
        
        system_prompt = self.config.get("system_prompt", "You are a helpful assistant.")
        input_text = state.get("current_output", "")
        input_images = state.get("input_images", [])
        
        # 멀티모달(이미지) 처리
        if input_images:
            content = [{"type": "text", "text": input_text}]
            for img in input_images:
                content.append({"type": "image_url", "image_url": {"url": img}})
            human_msg = HumanMessage(content=content)
        else:
            human_msg = HumanMessage(content=input_text)
            
        existing_messages = state.get("messages", [])
        current_messages = existing_messages + [human_msg]
        
        def safe_token_counter(msgs: list) -> int:
            try:
                if hasattr(llm, "get_num_tokens_from_messages"):
                    return llm.get_num_tokens_from_messages(msgs)
                return sum(len(str(m.content)) for m in msgs) // 4
            except Exception:
                return sum(len(str(m.content)) for m in msgs) // 4
                
            
        trimmed_messages = trim_messages(
            [SystemMessage(content=system_prompt)] + current_messages,
            max_tokens=4000,
            token_counter=safe_token_counter,
            strategy="last",
            include_system=True
        )
        
        logs = []
        if self.tools:
            logs.append(f"[{self.node_id}] LLM starting with {len(self.tools)} tools: {[t.name for t in self.tools]}")
            agent_executor = create_react_agent(llm, self.tools)
            result = agent_executor.invoke({"messages": trimmed_messages})
            
            final_response = result["messages"][-1]
            content = final_response.content
            
            for msg in result["messages"][len(trimmed_messages):]:
                if msg.type == "ai" and msg.tool_calls:
                    for tc in msg.tool_calls:
                        logs.append(f"[{self.node_id}] Calling tool: {tc['name']} with args {tc['args']}")
                elif msg.type == "tool":
                    logs.append(f"[{self.node_id}] Tool result: {msg.content}")
        else:
            response = llm.invoke(trimmed_messages)
            content = response.content
            final_response = response
            
        logs.append(f"[{self.node_id}] Generated response: {content}")
        
        return {
            "current_output": content,
            "messages": [human_msg, final_response],
            "logs": logs
        }
