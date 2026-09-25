from .base import BaseNode
from ..registry import register_node
from typing import Dict, Any
from app.services.llm_service import get_llm
from langchain_core.messages import SystemMessage, HumanMessage, trim_messages
from langgraph.prebuilt import create_react_agent

@register_node("agent")
class AgentNode(BaseNode):
    def __init__(self, node_id: str, config: dict):
        super().__init__(node_id, config)
        self.tools = []  # Will be injected by compiler

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        llm = get_llm(self.config)
        system_prompt = self.config.get("system_prompt", "You are a helpful assistant with access to tools.")
        input_text = state.get("current_output", "")
        
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
        logs.append(f"[{self.node_id}] Agent starting with {len(self.tools)} tools: {[t.name for t in self.tools]}")
        
        if self.tools:
            # Create a React agent executor with the tools
            agent_executor = create_react_agent(llm, self.tools)
            
            # The agent executor expects a state with "messages". 
            # We pass the trimmed_messages to it.
            result = agent_executor.invoke({"messages": trimmed_messages})
            
            # result["messages"] contains the history including tool calls and the final AI response.
            # We want to extract logs for tool calls to show in the UI.
            final_response = result["messages"][-1]
            content = final_response.content
            
            for msg in result["messages"][len(trimmed_messages):]:
                if msg.type == "ai" and msg.tool_calls:
                    for tc in msg.tool_calls:
                        logs.append(f"[{self.node_id}] Calling tool: {tc['name']} with args {tc['args']}")
                elif msg.type == "tool":
                    logs.append(f"[{self.node_id}] Tool result: {msg.content}")
                    
        else:
            # Fallback to standard LLM behavior if no tools are connected
            response = llm.invoke(trimmed_messages)
            content = response.content
            final_response = response
            
        logs.append(f"[{self.node_id}] Generated response: {content}")

        return {
            "current_output": content,
            "messages": [human_msg, final_response],
            "logs": logs
        }
