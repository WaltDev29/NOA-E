from typing import Dict, Type, Any

NODE_REGISTRY: Dict[str, Type[Any]] = {}

def register_node(node_type: str):
    def decorator(cls: Type[Any]):
        NODE_REGISTRY[node_type] = cls
        return cls
    return decorator

class NodeFactory:
    @staticmethod
    def create_node(node_type: str, node_id: str, config: dict):
        node_class = NODE_REGISTRY.get(node_type)
        if not node_class:
            raise ValueError(f"Unknown node type: {node_type}")
        return node_class(node_id, config)
