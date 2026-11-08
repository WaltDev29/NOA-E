import json
import re
from typing import Dict, Any, List
from .base import BaseNode, extract_text_content
from ..registry import register_node
from app.services.llm_service import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

@register_node("planner")
class PlannerNode(BaseNode):
    def __init__(self, node_id: str, config: dict):
        super().__init__(node_id, config)

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        llm = get_llm(self.config)
        input_text = state.get("current_output") or state.get("input_text", "")
        system_instruction = self.config.get(
            "system_prompt",
            "사용자 요청을 달성하기 위한 구체적인 세부 작업(Task) 계획을 수립하세요. 최종 결과 제시, 답변 작성, 요약 등의 작업은 후속 노드가 처리하므로 계획 목록에 절대 포함하지 마세요."
        )

        prompt = f"""사용자의 요청:
"{input_text}"

위 요청을 완수하기 위해 처리해야 할 핵심 세부 작업 목록을 순서대로 JSON 문자열 배열 형식으로만 응답하세요.
주의: 최종 답변 제시, 결과 안내, 요약과 같은 작업은 후속 노드가 담당하므로 계획에 절대 포함하지 마세요. 필요한 데이터 생성/획득/계산 등 순수 처리 작업만 포함해야 합니다.

예시 1:
["임의의 숫자 x 선택하기", "수식 5 * x 계산하기"]

예시 2:
["2026년 최신 기술 동향 정보 검색하기", "검색 결과에서 핵심 키워드 및 수치 데이터 추출하기"]

다른 인사말이나 설명 없이 오직 JSON 배열( [ "작업1", "작업2" ] )만 반환하세요."""

        messages = [
            SystemMessage(content=system_instruction),
            HumanMessage(content=prompt)
        ]

        logs = [f"[{self.node_id}] 플래너가 사용자 요청 분석 및 실행 계획 수립을 시작합니다."]

        try:
            response = llm.invoke(messages)
            raw_content = extract_text_content(response.content).strip()

            # JSON 배열 추출 시도
            match = re.search(r'\[\s*".*?"\s*(?:,\s*".*?"\s*)*\]', raw_content, re.DOTALL)
            if match:
                plan_list = json.loads(match.group(0))
            else:
                # 파싱 실패 시 줄바꿈 기준으로 계획 분할
                lines = [line.strip().lstrip("0123456789.-* ") for line in raw_content.split("\n") if line.strip()]
                plan_list = lines if lines else [input_text]

            # 최소 1개 이상의 작업 보장
            if not isinstance(plan_list, list) or len(plan_list) == 0:
                plan_list = [input_text]

            plan_text = "\n".join([f"{idx + 1}. {step}" for idx, step in enumerate(plan_list)])
            logs.append(f"[{self.node_id}] 수립된 계획 ({len(plan_list)}단계):\n{plan_text}")

            return {
                "plan": plan_list,
                "current_step": 0,
                "current_output": f"수립된 계획:\n{plan_text}",
                "logs": logs
            }

        except Exception as e:
            err_log = f"[{self.node_id}] 계획 수립 중 오류 발생: {str(e)} -> 단일 작업으로 대체합니다."
            logs.append(err_log)
            return {
                "plan": [input_text],
                "current_step": 0,
                "current_output": input_text,
                "logs": logs
            }

