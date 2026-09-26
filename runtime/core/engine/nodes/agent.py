from .base import BaseNode
from ..registry import register_node
from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage, trim_messages
from langgraph.prebuilt import create_react_agent

try:
    from runtime.config import get_runtime_llm as get_llm
except ImportError:
    try:
        from app.services.llm_service import get_llm
    except ImportError:
        from config import get_runtime_llm as get_llm

@register_node("agent")
class AgentNode(BaseNode):
    def __init__(self, node_id: str, config: dict):
        super().__init__(node_id, config)
        self.tools = []

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        llm = get_llm(self.config)
        system_prompt = self.config.get("system_prompt", "You are a helpful assistant with access to tools.")
        input_text = state.get("current_output", "")
        input_images = state.get("input_images", [])

        # 멀티모달 또는 텍스트 HumanMessage 생성
        if input_images:
            content = [{"type": "text", "text": input_text}]
            for img in input_images:
                content.append({"type": "image_url", "image_url": {"url": img}})
            human_msg = HumanMessage(content=content)
        else:
            human_msg = HumanMessage(content=input_text)
        
        # 기존 대화 이력 파싱
        existing_messages = state.get("messages", [])
        converted_messages = []
        for m in existing_messages:
            if isinstance(m, (HumanMessage, SystemMessage)):
                converted_messages.append(m)
            elif hasattr(m, "type") and hasattr(m, "content"):
                if m.type == "human":
                    converted_messages.append(HumanMessage(content=m.content))
                elif m.type == "ai":
                    from langchain_core.messages import AIMessage
                    converted_messages.append(AIMessage(content=m.content))
            elif isinstance(m, dict):
                role = m.get("role", "")
                content = m.get("content", "")
                if role == "user":
                    converted_messages.append(HumanMessage(content=content))
                elif role == "assistant":
                    from langchain_core.messages import AIMessage
                    converted_messages.append(AIMessage(content=content))

        current_messages = converted_messages + [human_msg]
        
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
        logs.append(f"[{self.node_id}] Agent 실행 시작 (사용 가능 도구 {len(self.tools)}개: {[t.name for t in self.tools]})")
        
        if self.tools:
            agent_executor = create_react_agent(llm, self.tools)
            result = agent_executor.invoke({"messages": trimmed_messages})
            
            final_response = result["messages"][-1]
            content = final_response.content
            
            for msg in result["messages"][len(trimmed_messages):]:
                if msg.type == "ai" and getattr(msg, "tool_calls", None):
                    for tc in msg.tool_calls:
                        logs.append(f"[{self.node_id}] 도구 호출: {tc['name']}({tc['args']})")
                elif msg.type == "tool":
                    logs.append(f"[{self.node_id}] 도구 결과: {msg.content}")
        else:
            response = llm.invoke(trimmed_messages)
            content = response.content
            final_response = response
            
        logs.append(f"[{self.node_id}] Agent 최종 응답:\n{content}")

        return {
            "current_output": content,
            "messages": [human_msg, final_response],
            "logs": logs
        }
