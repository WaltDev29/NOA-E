from typing import Dict, Any
from .base import BaseNode, extract_text_content
from ..registry import register_node
from langchain_core.messages import SystemMessage, HumanMessage

try:
    from runtime.config import get_runtime_llm as get_llm
except ImportError:
    try:
        from app.services.llm_service import get_llm
    except ImportError:
        from config import get_runtime_llm as get_llm


@register_node("aggregator")
class AggregatorNode(BaseNode):
    def __init__(self, node_id: str, config: dict):
        super().__init__(node_id, config)

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        llm = get_llm(self.config)
        original_query = state.get("input_text", "")
        intermediate = state.get("intermediate_steps", [])
        messages = state.get("messages", [])
        last_output = state.get("current_output", "")

        system_instruction = self.config.get(
            "system_prompt",
            "각 단계에서 처리된 결과들을 종합하여 사용자 요청에 대한 명확하고 가독성 좋은 최종 답변을 작성하세요."
        )

        logs = [f"[{self.node_id}] 파이프라인 전체 실행 내역을 종합하여 최종 답변 생성을 시작합니다."]

        summary_sections = []

        if intermediate:
            node_results = []
            for i, item in enumerate(intermediate):
                node_label = item.get("label") or item.get("node_id") or f"노드 {i + 1}"
                res = item.get("result", "")
                node_results.append(f"[{i + 1}단계: '{node_label}' 노드 산출물]\n{res}")
            summary_sections.append("### 각 노드별 처리 결과:\n" + "\n\n".join(node_results))

        if messages:
            msg_lines = []
            for msg in messages:
                role = getattr(msg, "type", None) or (msg.get("role") if isinstance(msg, dict) else "대화")
                msg_content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else str(msg))
                if msg_content:
                    msg_lines.append(f"- ({role}): {str(msg_content)[:300]}")
            if msg_lines:
                summary_sections.append("### 파이프라인 실행 히스토리:\n" + "\n".join(msg_lines[-6:]))

        if not summary_sections:
            summary_sections.append(f"### 직전 노드 산출물:\n{last_output}")

        full_context = "\n\n".join(summary_sections)

        aggregation_prompt = f"""[사용자의 최초 질문]
"{original_query}"

[파이프라인 전체 실행 산출물 및 대화 내용]
{full_context}

[지침]
위 파이프라인에서 처리된 모든 결과물과 대화 내용을 종합 분석하여, 사용자에게 최종적으로 전달할 완성도 높은 답변을 작성해 주세요.
- 각 노드가 처리한 핵심 결과(예: 번역, 분석 등)를 충실히 반영하세요.
- 시스템 프롬프트의 지침을 엄격히 준수하여 정중하고 읽기 편한 서식(마크다운)으로 작성하세요."""

        try:
            response = llm.invoke([
                SystemMessage(content=system_instruction),
                HumanMessage(content=aggregation_prompt)
            ])
            content = extract_text_content(response.content)
            logs.append(f"[{self.node_id}] 전체 실행 내역 종합 및 최종 답변 작성 완료")

            return {
                "current_output": content,
                "logs": logs
            }
        except Exception as e:
            fallback = f"결과 종합 중 오류가 발생하여 직전 출력을 반환합니다: {str(e)}\n\n{last_output}"
            logs.append(f"[{self.node_id}] {fallback}")
            return {
                "current_output": fallback,
                "logs": logs
            }

