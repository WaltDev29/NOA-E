from typing import Dict, List, Set, Any

class WorkflowValidator:
    @staticmethod
    def validate(workflow_json: dict):
        nodes = workflow_json.get("nodes", [])
        edges = workflow_json.get("edges", [])
        
        node_ids = {node["id"]: node for node in nodes}
        has_input = False
        has_output = False
        
        for node in nodes:
            if node.get("type") == "input":
                has_input = True
            if node.get("type") == "output":
                has_output = True
                
        if not has_input:
            raise ValueError("워크플로우에 적어도 하나의 'Input' 노드가 포함되어야 합니다.")
        if not has_output:
            raise ValueError("워크플로우에 적어도 하나의 'Output' 노드가 포함되어야 합니다.")
            
        adjacency: Dict[str, List[str]] = {nid: [] for nid in node_ids}
        tool_types = {"search", "weather", "youtube"}

        for edge in edges:
            source_id = edge["source"]
            target_id = edge["target"]
            
            if source_id not in node_ids:
                raise ValueError(f"연결선 시작 노드 {source_id}가 존재하지 않습니다.")
            if target_id not in node_ids:
                raise ValueError(f"연결선 도착 노드 {target_id}가 존재하지 않습니다.")
                
            if node_ids[source_id].get("type") == "output":
                raise ValueError("Output 노드는 다음 노드로 연결할 수 없습니다.")

            # 도구 노드 연결선은 에이전트의 도구 주입용이므로 흐름 사이클 검사에서 제외
            s_type = node_ids[source_id].get("type")
            t_type = node_ids[target_id].get("type")
            if s_type not in tool_types and t_type not in tool_types:
                adjacency[source_id].append(target_id)

        # 사이클 검출 및 Router 포함 여부 검증 (Controlled Loop 원칙)
        visited: Set[str] = set()
        rec_stack: List[str] = []

        def dfs_cycle_check(u: str) -> None:
            visited.add(u)
            rec_stack.append(u)

            for v in adjacency.get(u, []):
                if v not in visited:
                    dfs_cycle_check(v)
                elif v in rec_stack:
                    # 사이클 발견! 사이클을 구성하는 노드들 추출
                    cycle_start_idx = rec_stack.index(v)
                    cycle_nodes = rec_stack[cycle_start_idx:]
                    has_router = any(node_ids[cid].get("type") == "router" for cid in cycle_nodes)
                    if not has_router:
                        cycle_names = [node_ids[cid].get("config", {}).get("label") or node_ids[cid].get("type") for cid in cycle_nodes]
                        raise ValueError(
                            f"허용되지 않은 순환 루프가 발견되었습니다: ({' -> '.join(cycle_names)} -> ...).\n"
                            "순환 루프는 무한 루프 방지를 위해 반드시 Router 노드를 통해서만 구성할 수 있습니다."
                        )

            rec_stack.pop()

        for nid in node_ids:
            if nid not in visited and node_ids[nid].get("type") not in tool_types:
                dfs_cycle_check(nid)
                
        return True
