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
            raise ValueError("Workflow must contain at least one 'input' node.")
        if not has_output:
            raise ValueError("Workflow must contain at least one 'output' node.")
            
        for edge in edges:
            source_id = edge["source"]
            target_id = edge["target"]
            
            if source_id not in node_ids:
                raise ValueError(f"Edge source {source_id} does not exist.")
            if target_id not in node_ids:
                raise ValueError(f"Edge target {target_id} does not exist.")
                
            if node_ids[source_id].get("type") == "output":
                raise ValueError("Output node cannot have outgoing edges.")
                
        return True
