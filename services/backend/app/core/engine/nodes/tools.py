from .base import BaseNode
from ..registry import register_node
from typing import Dict, Any
from langchain_core.tools import tool
import logging

logger = logging.getLogger("tools")

@tool
def web_search(query: str) -> str:
    """웹에서 실시간 정보를 검색합니다. 검색어가 입력되면 최신 웹 문서 제목과 내용을 반환합니다.
    주의: site: 나 복잡한 따옴표 구문 대신 자연스러운 핵심 키워드(예: '포켓몬 레전즈 Z-A 발매 정보')를 입력하세요."""
    import re
    raw_query = (query or "").strip()
    if not raw_query:
        return "오류: 검색어가 비어 있습니다. 유효한 검색어를 전달하세요."

    # DuckDuckGo에서 검색 실패를 유발하기 쉬운 site: 연산자 정제
    clean_query = re.sub(r'site:[^\s]+', '', raw_query).strip()
    clean_query = clean_query.strip('"\'').strip()
    if not clean_query:
        clean_query = raw_query

    try:
        from duckduckgo_search import DDGS
        results = DDGS().text(clean_query, max_results=3)
        if not results:
            return f"'{clean_query}'에 대한 웹 검색 결과가 없습니다."

        formatted_results = []
        for idx, item in enumerate(results, 1):
            title = item.get("title", "제목 없음")
            body = item.get("body", "내용 없음")
            href = item.get("href", "")
            formatted_results.append(f"{idx}. [{title}]({href})\n{body}")

        return "\n\n".join(formatted_results)
    except Exception as e:
        logger.error(f"DuckDuckGo 검색 오류 ({clean_query}): {str(e)}")
        return f"웹 검색 수행 중 오류가 발생했습니다: {str(e)}"

@register_node("search")
class SearchNode(BaseNode):
    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        input_text = state.get("current_output", "") or state.get("input_text", "")
        clean_input = str(input_text).strip()
        try:
            result = web_search.invoke(clean_input) if hasattr(web_search, "invoke") else web_search(clean_input)
            result_str = str(result)
        except Exception as e:
            result_str = f"웹 검색 수행 중 오류 발생: {str(e)}"
            
        return {
            "current_output": result_str,
            "logs": [f"[{self.node_id}] 웹 검색 완료: '{clean_input}'"]
        }
        
    def get_tool(self):
        return web_search
