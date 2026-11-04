import json
import re
from typing import Dict, Any, List
from .base import BaseNode
from ..registry import register_node
from app.services.llm_service import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

@register_node("router")
class RouterNode(BaseNode):
    def __init__(self, node_id: str, config: dict):
        super().__init__(node_id, config)
        # compiler.py가 연결된 엣지를 기반으로 주입
        self.worker_targets: List[Dict[str, str]] = []  # 작업 노드 후보들 [{"id": "...", "label": "...", "type": "..."}]
        self.exit_target: str = ""                      # 모든 작업 종료 시 이동할 노드 (Aggregator 또는 Output)

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        logs = []
        loop_count = state.get("loop_count", 0) + 1
        max_loops = int(self.config.get("max_loops", 5))

        plan = state.get("plan")
        current_step = state.get("current_step", 0)
        exit_label = getattr(self, "exit_target_label", None) or self.exit_target

        # 1. 종료 조건 확인: 최대 반복 초과 시 강제 탈출
        if loop_count > max_loops:
            logs.append(f"[{self.node_id}] '{exit_label}' 노드로 분기합니다.")
            return {
                "loop_count": loop_count,
                "next_worker": self.exit_target,
                "logs": logs
            }

        # 2. 종료 조건 확인: 계획(plan)이 있고 모든 계획 단계가 완료되었을 때
        if plan is not None and current_step >= len(plan):
            logs.append(f"[{self.node_id}] '{exit_label}' 노드로 분기합니다.")
            return {
                "loop_count": loop_count,
                "next_worker": self.exit_target,
                "logs": logs
            }

        # 3. 이번 루프에서 처리할 작업(Task) 내용 추출
        if plan is not None and len(plan) > 0:
            task_to_do = plan[current_step]
            next_step_index = current_step + 1
        else:
            task_to_do = state.get("current_output") or state.get("input_text", "")
            next_step_index = current_step

        # 4. 후보 Worker 노드 선택
        if not self.worker_targets:
            # 연결된 작업 노드가 없으면 바로 종료 노드로 이동
            logs.append(f"[{self.node_id}] '{exit_label}' 노드로 분기합니다.")
            return {
                "loop_count": loop_count,
                "next_worker": self.exit_target,
                "current_output": task_to_do,
                "logs": logs
            }

        if len(self.worker_targets) == 1:
            chosen_worker = self.worker_targets[0]
            logs.append(f"[{self.node_id}] '{chosen_worker['label']}' 노드로 분기합니다.")
            return {
                "loop_count": loop_count,
                "current_step": next_step_index,
                "next_worker": chosen_worker["id"],
                "current_output": task_to_do,
                "logs": logs
            }

        # 후보가 2개 이상이면 LLM과 시스템 프롬프트를 활용하여 최적의 노드 선정
        llm = get_llm(self.config)
        system_instruction = self.config.get(
            "system_prompt",
            "당신은 스마트 라우터입니다. 주어진 작업 내용과 노드 목록을 비교하여 가장 알맞은 노드 ID 하나를 선택하세요."
        )

        candidates_desc = "\n".join([
            f"- ID: \"{w['id']}\", 이름: \"{w['label']}\", 유형: \"{w['type']}\""
            for w in self.worker_targets
        ])

        routing_prompt = f"""시스템 지침:
{system_instruction}

선택 가능한 후보 노드 목록:
{candidates_desc}

현재 처리할 작업:
"{task_to_do}"

위 작업을 처리하기에 가장 적합한 노드의 ID를 JSON 형식으로 반환하세요.
예시:
{{"selected_id": "{self.worker_targets[0]['id']}", "reason": "이유 설명"}}

오직 유효한 JSON 형식으로만 응답하세요."""

        try:
            res = llm.invoke([
                SystemMessage(content=system_instruction),
                HumanMessage(content=routing_prompt)
            ])
            raw_content = res.content.strip()

            # JSON 파싱 시도
            match = re.search(r'\{\s*"selected_id"\s*:\s*".*?"\s*\}', raw_content)
            selected_id = None
            if match:
                parsed = json.loads(match.group(0))
                selected_id = parsed.get("selected_id")

            # 후보 목록에 존재하는 ID인지 검증
            valid_ids = {w["id"] for w in self.worker_targets}
            if not selected_id or selected_id not in valid_ids:
                # 텍스트 내에서 ID 검색
                for cid in valid_ids:
                    if cid in raw_content:
                        selected_id = cid
                        break

            if not selected_id:
                selected_id = self.worker_targets[0]["id"]

            chosen_label = next((w["label"] for w in self.worker_targets if w["id"] == selected_id), selected_id)
            logs.append(f"[{self.node_id}] '{chosen_label}' 노드로 분기합니다.")

            return {
                "loop_count": loop_count,
                "current_step": next_step_index,
                "next_worker": selected_id,
                "current_output": task_to_do,
                "logs": logs
            }

        except Exception as e:
            fallback_worker = self.worker_targets[0]
            fallback_id = fallback_worker["id"]
            fallback_label = fallback_worker.get("label", fallback_id)
            logs.append(f"[{self.node_id}] '{fallback_label}' 노드로 분기합니다.")
            return {
                "loop_count": loop_count,
                "current_step": next_step_index,
                "next_worker": fallback_id,
                "current_output": task_to_do,
                "logs": logs
            }

