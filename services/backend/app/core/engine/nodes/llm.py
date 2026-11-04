from .base import BaseNode
from ..registry import register_node
from typing import Dict, Any
from app.services.llm_service import get_llm
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.prebuilt import create_react_agent

@register_node("llm")
class LLMNode(BaseNode):
    def __init__(self, node_id: str, config: dict):
        super().__init__(node_id, config)
        self.tools = []

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        llm = get_llm(self.config)
        
        system_prompt = self.config.get("system_prompt", "You are a helpful assistant.")
        tool_instruction = self.config.get("tool_instruction", "").strip()
        react_loop = self.config.get("react_loop", True)
        max_tool_iterations = int(self.config.get("max_tool_iterations", 3))

        # 도구 재시도/평가 지침이 설정되어 있다면 시스템 프롬프트에 병합
        if tool_instruction:
            system_prompt = f"{system_prompt}\n\n[도구 사용 및 결과 검증 지침]\n{tool_instruction}"

        raw_task = state.get("current_output", "") or state.get("input_text", "")
        original_query = state.get("input_text", "")
        intermediate_steps = state.get("intermediate_steps", [])
        plan = state.get("plan")

        # 다단계 계획(Plan)이 있거나 이전 작업 결과(intermediate_steps)가 있는 경우 선행 맥락 병합
        if intermediate_steps and (plan or raw_task != original_query):
            context_blocks = []
            if original_query:
                context_blocks.append(f"[사용자 원본 요청]\n{original_query}")
            
            steps_summary = "\n".join([
                f"- [{step.get('label', step.get('node_id', 'Worker'))}]: {step.get('result', '')}"
                for step in intermediate_steps
            ])
            context_blocks.append(f"[이전 단계 작업 결과]\n{steps_summary}")
            context_blocks.append(f"[현재 당신이 수행할 작업 지침]\n{raw_task}")
            
            final_prompt_text = "\n\n".join(context_blocks)
        else:
            final_prompt_text = raw_task

        input_images = state.get("input_images", [])
        
        # 멀티모달(이미지) 처리
        if input_images:
            content = [{"type": "text", "text": final_prompt_text}]
            for img in input_images:
                content.append({"type": "image_url", "image_url": {"url": img}})
            human_msg = HumanMessage(content=content)
        else:
            human_msg = HumanMessage(content=final_prompt_text)
            
        node_messages = [
            SystemMessage(content=system_prompt),
            human_msg
        ]
        
        logs = []
        if self.tools and react_loop:
            logs.append(f"[{self.node_id}] LLM ReAct 루프 시작 (연결 도구: {[t.name for t in self.tools]}, 최대 재시도: {max_tool_iterations}회)")
            agent_executor = create_react_agent(llm, self.tools)
            result = agent_executor.invoke(
                {"messages": node_messages},
                config={"recursion_limit": max(5, max_tool_iterations * 2 + 2)}
            )
            
            final_response = result["messages"][-1]
            content = final_response.content
            
            for msg in result["messages"][len(node_messages):]:
                if msg.type == "ai" and msg.tool_calls:
                    for tc in msg.tool_calls:
                        logs.append(f"[{self.node_id}] 도구 호출: {tc['name']}({tc['args']})")
                elif msg.type == "tool":
                    logs.append(f"[{self.node_id}] 도구 실행 결과: {str(msg.content)[:120]}...")
        else:
            if self.tools and not react_loop:
                logs.append(f"[{self.node_id}] 도구가 연결되어 있으나 도구 자율 루프가 OFF 상태입니다. 일반 응답을 생성합니다.")
            response = llm.invoke(node_messages)
            content = response.content
            final_response = response
            
        logs.append(f"[{self.node_id}] Generated response: {content}")
        
        # 중간 수행 결과 기록 (노드 라벨 및 단계별 산출물 누적)
        node_label = self.config.get("label") or self.node_id
        step_record = {
            "node_id": self.node_id,
            "label": node_label,
            "task": raw_task,
            "result": content
        }

        return {
            "current_output": content,
            "messages": [human_msg, final_response],
            "intermediate_steps": [step_record],
            "logs": logs
        }
