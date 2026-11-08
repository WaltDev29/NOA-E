from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseNode(ABC):
    def __init__(self, node_id: str, config: dict = None):
        self.node_id = node_id
        self.config = config or {}

    @abstractmethod
    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        pass


def extract_text_content(content: Any) -> str:
    """
    LLM 응답 content가 단일 문자열이 아닌 멀티파트 리스트나 딕셔너리 구조일 때
    순수 텍스트를 추출하여 반환합니다.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts = []
        for item in content:
            if isinstance(item, dict):
                if item.get("type") == "text" and "text" in item:
                    texts.append(str(item["text"]))
                elif "text" in item:
                    texts.append(str(item["text"]))
                elif "content" in item:
                    texts.append(extract_text_content(item["content"]))
            elif isinstance(item, str):
                texts.append(item)
            else:
                texts.append(str(item))
        return "\n\n".join(texts)
    if isinstance(content, dict):
        if "text" in content:
            return str(content["text"])
        if "content" in content:
            return extract_text_content(content["content"])
    return str(content) if content is not None else ""
