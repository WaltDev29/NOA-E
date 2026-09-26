from langgraph.graph import StateGraph, START, END
from .state import AgentState
from .registry import NodeFactory
from .validator import WorkflowValidator
from . import nodes  # Ensure nodes are registered

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
        
        node_instances = {}
        tool_node_types = {"search", "calculator"}
        
        # 1. Instantiate all nodes
        for node_data in nodes:
            node_type = node_data["type"]
            node_id = node_data["id"]
            
            if node_type == "input":
                input_node_id = node_id
            if node_type == "output":
                output_node_id = node_id
                
            node_obj = NodeFactory.create_node(
                node_type=node_type,
                node_id=node_id,
                config=node_data.get("config", {})
            )
            node_instances[node_id] = {
                "type": node_type,
                "obj": node_obj
            }
            
        # 2. Map tools to agents/LLMs based on edges
        for edge in edges:
            source_id = edge["source"]
            target_id = edge["target"]
            
            source_info = node_instances.get(source_id)
            target_info = node_instances.get(target_id)
            
            if not source_info or not target_info:
                continue
                
            if source_info["type"] in ("llm", "agent") and target_info["type"] in tool_node_types:
                if not hasattr(source_info["obj"], "tools"):
                    source_info["obj"].tools = []
                source_info["obj"].tools.append(target_info["obj"].get_tool())
                
            elif target_info["type"] in ("llm", "agent") and source_info["type"] in tool_node_types:
                if not hasattr(target_info["obj"], "tools"):
                    target_info["obj"].tools = []
                target_info["obj"].tools.append(source_info["obj"].get_tool())

        # 3. Add non-tool nodes to the graph
        for node_id, info in node_instances.items():
            if info["type"] not in tool_node_types:
                graph.add_node(node_id, info["obj"].execute)
            
        # 4. Add edges between non-tool nodes
        for edge in edges:
            source_id = edge["source"]
            target_id = edge["target"]
            
            source_info = node_instances.get(source_id)
            target_info = node_instances.get(target_id)
            
            if source_info and target_info:
                if source_info["type"] not in tool_node_types and target_info["type"] not in tool_node_types:
                    graph.add_edge(source_id, target_id)
            
        # Add START and END connections
        if input_node_id:
            graph.add_edge(START, input_node_id)
        if output_node_id:
            graph.add_edge(output_node_id, END)
            
        return graph.compile()
