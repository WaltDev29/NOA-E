from .base import BaseNode, extract_text_content
from ..registry import register_node
from typing import Dict, Any
import os
from datetime import datetime
from zoneinfo import ZoneInfo
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage, trim_messages
from langgraph.prebuilt import create_react_agent

try:
    from runtime.config import get_runtime_llm as get_llm
except ImportError:
    try:
        from app.services.llm_service import get_llm
    except ImportError:
        from config import get_runtime_llm as get_llm

_WEEKDAYS_KO = ["월", "화", "수", "목", "금", "토", "일"]


def _build_current_datetime_prompt() -> str:
    """실행 시점의 현재 날짜/시각을 시스템 프롬프트에 주입한다."""
    tz_name = os.getenv("TIMEZONE") or "Asia/Seoul"
    try:
        now = datetime.now(ZoneInfo(tz_name))
    except Exception:
        tz_name = "Asia/Seoul"
        try:
            now = datetime.now(ZoneInfo(tz_name))
        except Exception:
            now = datetime.now()
    return (
        "[현재 날짜 정보]\n"
        f"오늘은 {now.strftime('%Y-%m-%d')}({_WEEKDAYS_KO[now.weekday()]}) {now.strftime('%H:%M')} ({tz_name}) 입니다.\n"
        "'오늘', '최근', '최신', '올해' 등 시간 표현은 반드시 이 날짜를 기준으로 해석하고, "
        "검색어에 연도를 임의로 추측해 붙이지 마세요."
    )


def _format_tool_logs(node_id: str, messages: list, tool_labels: dict = None) -> list:
    tool_labels = tool_labels or {}
    tool_results = {
        msg.tool_call_id: msg.content
        for msg in messages
        if getattr(msg, "type", None) == "tool"
    }
    logs = []
    for msg in messages:
        if getattr(msg, "type", None) == "ai" and getattr(msg, "tool_calls", None):
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

        if tool_instruction:
            system_prompt = f"{system_prompt}\n\n[도구 사용 및 결과 검증 지침]\n{tool_instruction}"

        system_prompt = f"{system_prompt}\n\n{_build_current_datetime_prompt()}"

        raw_task = state.get("current_output", "") or state.get("input_text", "")
        original_query = state.get("input_text", "")
        intermediate_steps = state.get("intermediate_steps", [])
        plan = state.get("plan")

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
        if input_images:
            content_list = [{"type": "text", "text": final_prompt_text}]
            for img in input_images:
                content_list.append({"type": "image_url", "image_url": {"url": img}})
            human_msg = HumanMessage(content=content_list)
        else:
            human_msg = HumanMessage(content=final_prompt_text)

        # 단일 LLM 대화 시 이전 대화 맥락 유지 (다단계 Plan 수행 중이 아닐 때)
        existing_messages = state.get("messages", [])
        converted_messages = []
        if not plan and not intermediate_steps:
            for m in existing_messages:
                if isinstance(m, (HumanMessage, AIMessage, SystemMessage)):
                    converted_messages.append(m)
                elif hasattr(m, "type") and hasattr(m, "content"):
                    if m.type == "human":
                        converted_messages.append(HumanMessage(content=m.content))
                    elif m.type == "ai":
                        converted_messages.append(AIMessage(content=m.content))
                elif isinstance(m, dict):
                    role = m.get("role", "")
                    m_content = m.get("content", "")
                    if role == "user":
                        converted_messages.append(HumanMessage(content=m_content))
                    elif role == "assistant":
                        converted_messages.append(AIMessage(content=m_content))

        def safe_token_counter(msgs: list) -> int:
            try:
                if hasattr(llm, "get_num_tokens_from_messages"):
                    return llm.get_num_tokens_from_messages(msgs)
                return sum(len(str(m.content)) for m in msgs) // 4
            except Exception:
                return sum(len(str(m.content)) for m in msgs) // 4

        node_messages = trim_messages(
            [SystemMessage(content=system_prompt)] + converted_messages + [human_msg],
            max_tokens=4000,
            token_counter=safe_token_counter,
            strategy="last",
            include_system=True,
        )

        logs = []
        if self.tools and react_loop:
            logs.append(f"[{self.node_id}] LLM ReAct 루프 시작 (연결 도구: {[t.name for t in self.tools]}, 최대 재시도: {max_tool_iterations}회)")
            try:
                system_with_tools = (
                    f"{system_prompt}\n\n"
                    "[도구 사용 지침]\n"
                    "- 웹 검색 시 'site:'나 복잡한 따옴표 문법 대신 자연스러운 핵심 키워드로 검색하세요.\n"
                    "- 검색 결과를 확인한 후에는 추가 도구 호출 없이 최종 요약 답변을 한국어로 작성하세요."
                )
                node_messages[0] = SystemMessage(content=system_with_tools)

                agent_executor = create_react_agent(llm, self.tools)
                recursion_limit = max(20, max_tool_iterations * 4 + 10)
                result = agent_executor.invoke(
                    {"messages": node_messages},
                    config={"recursion_limit": recursion_limit}
                )

                final_response = result["messages"][-1]
                content = extract_text_content(final_response.content)

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
                    logs.append(f"[{self.node_id}] ⚠️ 모델 '{model_name}'은(는) 도구 호출(Tool Calling)을 지원하지 않아 일반 모델 응답으로 전환합니다.")
                    response = llm.invoke(node_messages)
                    content = extract_text_content(response.content)
                    final_response = response
                else:
                    logs.append(f"[{self.node_id}] 도구 실행 중 오류 발생: {err_str}")
                    raise e
        elif self.tools:
            logs.append(f"[{self.node_id}] 도구 단일 호출 모드 시작 (연결 도구: {[t.name for t in self.tools]}, 반복 없음)")
            try:
                first = llm.bind_tools(self.tools).invoke(node_messages)
                if getattr(first, "tool_calls", None):
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

        logs.append(f"[{self.node_id}] 생성된 응답:\n{content}")

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
