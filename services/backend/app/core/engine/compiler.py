from langgraph.graph import StateGraph, START, END
from .state import AgentState
from .registry import NodeFactory
from .validator import WorkflowValidator
import app.core.engine.nodes  # Ensure nodes are registered

class WorkflowCompiler:
    def __init__(self):
        self.validator = WorkflowValidator()

    def compile_workflow(self, workflow_json: dict):
        self.validator.validate(workflow_json)
        
        graph = StateGraph(AgentState)
        nodes = workflow_json.get("nodes", [])
        edges = workflow_json.get("edges", [])
        
        input_node_id = None
        output_node_id = None
        aggregator_node_id = None
        
        node_instances = {}
        tool_node_types = {"search", "weather", "youtube"}
        
        # 1. 모든 노드 인스턴스화
        for node_data in nodes:
            node_type = node_data["type"]
            node_id = node_data["id"]
            
            if node_type == "input":
                input_node_id = node_id
            elif node_type == "output":
                output_node_id = node_id
            elif node_type == "aggregator":
                aggregator_node_id = node_id
                
            node_obj = NodeFactory.create_node(
                node_type=node_type,
                node_id=node_id,
                config=node_data.get("config", {})
            )
            node_instances[node_id] = {
                "type": node_type,
                "label": node_data.get("config", {}).get("label") or node_type,
                "obj": node_obj
            }
            
        # 2. 도구(Tool) 노드를 LLM 노드에 매핑
        for edge in edges:
            source_id = edge["source"]
            target_id = edge["target"]
            
            source_info = node_instances.get(source_id)
            target_info = node_instances.get(target_id)
            
            if not source_info or not target_info:
                continue
                
            if source_info["type"] == "llm" and target_info["type"] in tool_node_types:
                if not hasattr(source_info["obj"], "tools"):
                    source_info["obj"].tools = []
                source_info["obj"].add_tool(target_info["obj"].get_tool(), target_info["label"])
                
            elif target_info["type"] == "llm" and source_info["type"] in tool_node_types:
                if not hasattr(target_info["obj"], "tools"):
                    target_info["obj"].tools = []
                target_info["obj"].add_tool(source_info["obj"].get_tool(), source_info["label"])

        # 3. Router 노드에 연결된 타겟 노드(Worker, Exit) 메타데이터 주입
        router_outgoing_map = {}
        for edge in edges:
            s_id = edge["source"]
            t_id = edge["target"]
            s_info = node_instances.get(s_id)
            t_info = node_instances.get(t_id)
            if s_info and t_info and s_info["type"] == "router":
                if s_id not in router_outgoing_map:
                    router_outgoing_map[s_id] = []
                router_outgoing_map[s_id].append((t_id, t_info))

        for r_id, out_list in router_outgoing_map.items():
            r_obj = node_instances[r_id]["obj"]
            worker_list = []
            exit_node = None
            exit_label = None

            for tid, tinfo in out_list:
                if tinfo["type"] in ("aggregator", "output"):
                    exit_node = tid
                    exit_label = tinfo["label"]
                elif tinfo["type"] not in tool_node_types:
                    worker_list.append({
                        "id": tid,
                        "label": tinfo["label"],
                        "type": tinfo["type"]
                    })

            # 명시적 exit 노드가 없으면 aggregator -> output 순으로 폴백
            if not exit_node:
                exit_node = aggregator_node_id or output_node_id or (worker_list[0]["id"] if worker_list else r_id)
                exit_label = node_instances.get(exit_node, {}).get("label") or exit_node

            r_obj.worker_targets = worker_list
            r_obj.exit_target = exit_node
            r_obj.exit_target_label = exit_label or exit_node

        # 4. 도구 노드를 제외한 모든 실행 노드를 그래프에 추가
        for node_id, info in node_instances.items():
            if info["type"] not in tool_node_types:
                graph.add_node(node_id, info["obj"].execute)
            
        # 5. 노드 간 엣지 연결 (Router의 출력은 조건부 엣지로, 나머지는 일반 엣지로)
        router_ids = {nid for nid, info in node_instances.items() if info["type"] == "router"}

        # Router 조건부 엣지 등록
        for r_id in router_ids:
            r_obj = node_instances[r_id]["obj"]
            all_possible_targets = set()
            for w in r_obj.worker_targets:
                all_possible_targets.add(w["id"])
            if r_obj.exit_target:
                all_possible_targets.add(r_obj.exit_target)

            if all_possible_targets:
                path_map = {t: t for t in all_possible_targets}
                default_target = r_obj.exit_target or next(iter(all_possible_targets))
                
                def make_route_fn(def_tgt):
                    return lambda state: state.get("next_worker") or def_tgt

                graph.add_conditional_edges(
                    r_id,
                    make_route_fn(default_target),
                    path_map
                )

        # Router로 복귀하는 루프 엣지를 가진 Worker 노드 집합 식별
        loop_returning_workers = set()
        for edge in edges:
            t_info = node_instances.get(edge["target"])
            if t_info and t_info["type"] == "router":
                loop_returning_workers.add(edge["source"])

        # 일반 엣지 연결 (Router에서 나가는 엣지는 위에서 조건부 엣지로 처리했으므로 제외)
        for edge in edges:
            source_id = edge["source"]
            target_id = edge["target"]
            
            source_info = node_instances.get(source_id)
            target_info = node_instances.get(target_id)
            
            if source_info and target_info:
                if source_info["type"] not in tool_node_types and target_info["type"] not in tool_node_types:
                    # Router의 출력 엣지는 조건부 엣지로 이미 연결되었으므로 일반 엣지 추가 스킵
                    if source_info["type"] == "router":
                        continue
                    # 루프 복귀 Worker에서 Output으로 직접 나가는 엣지는 조기 종료 및 병렬 쓰기 충돌 방지를 위해 제외
                    if source_id in loop_returning_workers and target_info["type"] == "output":
                        continue
                    graph.add_edge(source_id, target_id)
            
        # 6. START / END 연결
        if input_node_id:
            graph.add_edge(START, input_node_id)
        if output_node_id:
            graph.add_edge(output_node_id, END)
            
        return graph.compile()
