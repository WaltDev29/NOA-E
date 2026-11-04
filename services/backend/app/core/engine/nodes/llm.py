from .base import BaseNode, extract_text_content
from ..registry import register_node
from typing import Dict, Any
import os
from datetime import datetime
from zoneinfo import ZoneInfo
from app.services.llm_service import get_llm, load_backend_env
from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from langgraph.prebuilt import create_react_agent

_WEEKDAYS_KO = ["월", "화", "수", "목", "금", "토", "일"]


def _build_current_datetime_prompt() -> str:
    """LLM은 학습 시점 기준으로 날짜를 추측하므로, 실행 시점의 현재 날짜/시각을 시스템 프롬프트에 주입한다.
    서버(컨테이너)는 UTC 기준이라 시간대를 명시하며, TIMEZONE 설정이 없으면 Asia/Seoul을 사용한다."""
    tz_name = load_backend_env().get("TIMEZONE") or os.getenv("TIMEZONE") or "Asia/Seoul"
    try:
        now = datetime.now(ZoneInfo(tz_name))
    except Exception:
        # 잘못된 시간대 이름이면 기본값으로 대체해 노드 실행이 중단되지 않도록 한다
        tz_name = "Asia/Seoul"
        now = datetime.now(ZoneInfo(tz_name))
    return (
        "[현재 날짜 정보]\n"
        f"오늘은 {now.strftime('%Y-%m-%d')}({_WEEKDAYS_KO[now.weekday()]}) {now.strftime('%H:%M')} ({tz_name}) 입니다.\n"
        "'오늘', '최근', '최신', '올해' 등 시간 표현은 반드시 이 날짜를 기준으로 해석하고, "
        "검색어에 연도를 임의로 추측해 붙이지 마세요."
    )


def _format_tool_logs(node_id: str, messages: list, tool_labels: dict = None) -> list:
    """병렬 호출 시 호출/결과 로그가 뒤섞이지 않도록 tool_call_id로 짝지어 로그 문자열을 생성한다.
    호출 결정은 LLM이 하므로 [LLM] 라벨을, 실행 결과는 실제 실행 주체인 Tool 노드 라벨을 사용한다."""
    tool_labels = tool_labels or {}
    tool_results = {
        msg.tool_call_id: msg.content
        for msg in messages
        if msg.type == "tool"
    }
    logs = []
    for msg in messages:
        if msg.type == "ai" and msg.tool_calls:
            for tc in msg.tool_calls:
                logs.append(f"[{node_id}] 도구 호출: {tc['name']}({tc['args']})")
                if tc["id"] in tool_results:
                    result_label = tool_labels.get(tc["name"], tc["name"])
                    logs.append(f"[{result_label}] 도구 실행 결과: {str(tool_results[tc['id']])[:120]}...")
    return logs


@register_node("llm")
class LLMNode(BaseNode):
    def __init__(self, node_id: str, config: dict):
        super().__init__(node_id, config)
        self.tools = []
        # tool.name -> 해당 Tool 노드의 사용자 지정 라벨 (로그에서 Tool 실행 결과 출처 표시용)
        self.tool_labels = {}

    def add_tool(self, tool, label: str):
        self.tools.append(tool)
        self.tool_labels[tool.name] = label

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        llm = get_llm(self.config)
        
        default_ko_prompt = "당신은 사용자의 요청에 정확하고 친절하게 답변하는 유능한 AI 어시스턴트입니다."
        system_prompt = self.config.get("system_prompt") or default_ko_prompt
        if system_prompt.strip() == "You are a helpful assistant.":
            system_prompt = default_ko_prompt
        tool_instruction = self.config.get("tool_instruction", "").strip()
        react_loop = self.config.get("react_loop", True)
        max_tool_iterations = int(self.config.get("max_tool_iterations", 3))

        # 도구 재시도/평가 지침이 설정되어 있다면 시스템 프롬프트에 병합
        if tool_instruction:
            system_prompt = f"{system_prompt}\n\n[도구 사용 및 결과 검증 지침]\n{tool_instruction}"

        # 현재 날짜 주입 (사용자 프롬프트 뒤에 붙여 기존 지침 우선순위를 해치지 않음)
        system_prompt = f"{system_prompt}\n\n{_build_current_datetime_prompt()}"

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
            try:
                system_with_tools = (
                    f"{system_prompt}\n\n"
                    "[도구 사용 지침]\n"
                    "- 웹 검색 시 'site:'나 복잡한 따옴표 문법 대신 자연스러운 핵심 키워드(예: '포켓몬 신작 2025 발매 정보')로 검색하세요.\n"
                    "- 검색 결과를 확인한 후에는 추가 도구 호출 없이 최종 요약 답변을 한국어로 작성하세요."
                )
                node_messages[0] = SystemMessage(content=system_with_tools)

                agent_executor = create_react_agent(llm, self.tools)
                # ReAct 탐색 및 최종 답변 생성을 위해 넉넉한 recursion_limit 부여
                recursion_limit = max(20, max_tool_iterations * 4 + 10)
                result = agent_executor.invoke(
                    {"messages": node_messages},
                    config={"recursion_limit": recursion_limit}
                )
                
                final_response = result["messages"][-1]
                content = extract_text_content(final_response.content)

                # 스텝 한계 도달 시스템 메시지 발생 시 수집된 정보로 즉시 최종 요약 답변 생성
                if "Sorry, need more steps to process this request" in content:
                    logs.append(f"[{self.node_id}] ⚠️ 도구 탐색 스텝 한계 도달. 지금까지 수집된 검색 결과로 최종 답변을 요약합니다.")
                    summary_messages = [
                        *result["messages"][:-1],
                        HumanMessage(content="추가 도구 검색 없이, 지금까지 검색된 위 결과들을 바탕으로 사용자 요청에 대한 명확하고 정리된 최종 답변을 한국어로 작성하세요.")
                    ]
                    fallback_res = llm.invoke(summary_messages)
                    content = extract_text_content(fallback_res.content)
                    final_response = fallback_res
                
                logs.extend(_format_tool_logs(self.node_id, result["messages"][len(node_messages):], self.tool_labels))
            except Exception as e:
                err_str = str(e)
                if "does not support tools" in err_str:
                    model_name = self.config.get("model", "현재 모델")
                    logs.append(f"[{self.node_id}] ⚠️ 모델 '{model_name}'은(는) 도구 호출(Tool Calling)을 지원하지 않아 일반 모델 응답으로 전환합니다. (도구 호출 지원 모델 권장: llama3.1, qwen2.5)")
                    response = llm.invoke(node_messages)
                    content = extract_text_content(response.content)
                    final_response = response
                else:
                    logs.append(f"[{self.node_id}] 도구 실행 중 오류 발생: {err_str}")
                    raise e
        elif self.tools:
            # Loop OFF: 도구는 바인딩하되 1회 왕복(호출 → 실행 → 답변)만 허용
            logs.append(f"[{self.node_id}] 도구 단일 호출 모드 시작 (연결 도구: {[t.name for t in self.tools]}, 반복 없음)")
            try:
                first = llm.bind_tools(self.tools).invoke(node_messages)
                if first.tool_calls:
                    tool_map = {t.name: t for t in self.tools}
                    tool_messages = []
                    for tc in first.tool_calls:
                        try:
                            tool_output = tool_map[tc["name"]].invoke(tc["args"])
                        except Exception as tool_err:
                            tool_output = f"도구 실행 오류: {tool_err}"
                        tool_messages.append(
                            ToolMessage(content=str(tool_output), tool_call_id=tc["id"], name=tc["name"])
                        )
                    logs.extend(_format_tool_logs(self.node_id, [first, *tool_messages], self.tool_labels))
                    # 2차 호출은 도구를 바인딩하지 않아 추가 도구 호출이 불가능하다 (반복 방지)
                    response = llm.invoke([*node_messages, first, *tool_messages])
                else:
                    response = first
            except Exception as e:
                if "does not support tools" not in str(e):
                    logs.append(f"[{self.node_id}] 도구 실행 중 오류 발생: {e}")
                    raise
                model_name = self.config.get("model", "현재 모델")
                logs.append(f"[{self.node_id}] ⚠️ 모델 '{model_name}'은(는) 도구 호출(Tool Calling)을 지원하지 않아 일반 모델 응답으로 전환합니다.")
                response = llm.invoke(node_messages)
            content = extract_text_content(response.content)
            final_response = response
        else:
            response = llm.invoke(node_messages)
            content = extract_text_content(response.content)
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
