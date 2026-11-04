from .base import BaseNode
from ..registry import register_node
from typing import Dict, Any, List
from langchain_core.tools import tool
import html
import logging
import os
import requests

logger = logging.getLogger("runtime.tools")

HTTP_TIMEOUT_SEC = 10

WEATHER_CODE_KO = {
    0: "맑음", 1: "대체로 맑음", 2: "구름 조금", 3: "흐림",
    45: "안개", 48: "서리 안개",
    51: "약한 이슬비", 53: "이슬비", 55: "강한 이슬비",
    56: "약한 어는 이슬비", 57: "강한 어는 이슬비",
    61: "약한 비", 63: "비", 65: "강한 비",
    66: "약한 어는 비", 67: "강한 어는 비",
    71: "약한 눈", 73: "눈", 75: "강한 눈", 77: "싸락눈",
    80: "약한 소나기", 81: "소나기", 82: "강한 소나기",
    85: "약한 눈 소나기", 86: "강한 눈 소나기",
    95: "뇌우", 96: "우박 동반 뇌우", 99: "강한 우박 동반 뇌우",
}


def _mask_secrets(text: str, secrets: List[str]) -> str:
    for secret in secrets:
        if secret:
            text = text.replace(secret, "***")
    return text


def _get_json(url: str, params: Dict[str, Any]) -> Dict[str, Any]:
    response = requests.get(url, params=params, timeout=HTTP_TIMEOUT_SEC)
    response.raise_for_status()
    return response.json()


def _load_local_env_var(key: str) -> str:
    if os.getenv(key):
        return os.getenv(key, "").strip()
    # 왜: 로컬 런타임 설정창(.storage/settings.json)에 저장된 YouTube API Key를 우선 참조합니다.
    if key == "YOUTUBE_API_KEY":
        try:
            from storage import get_youtube_api_key
            saved_key = get_youtube_api_key()
            if saved_key:
                return saved_key
        except Exception:
            try:
                from runtime.storage import get_youtube_api_key
                saved_key = get_youtube_api_key()
                if saved_key:
                    return saved_key
            except Exception:
                pass
    candidates = [
        "docker/env/.env.backend",
        "../docker/env/.env.backend",
        "services/backend/.env.backend",
        "../services/backend/.env.backend",
        ".env",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            if k.strip() == key:
                                return v.strip().strip("'\"")
            except Exception:
                pass
    return ""


@tool
def calculate(expression: str) -> str:
    """수식을 계산합니다. 기본 사칙연산 수식만 허용됩니다."""
    allowed = set("0123456789+-*/(). ")
    if not set(expression).issubset(allowed):
        return "오류: 허용되지 않는 문자가 수식에 포함되어 있습니다."
    try:
        result = eval(expression, {"__builtins__": {}}, {})
        return str(result)
    except Exception as e:
        return f"수식 계산 오류: {str(e)}"


@tool
def web_search(query: str) -> str:
    """웹에서 실시간 정보를 검색합니다. 검색어가 입력되면 최신 웹 문서 제목과 내용을 반환합니다."""
    import re
    raw_query = (query or "").strip()
    if not raw_query:
        return "오류: 검색어가 비어 있습니다. 유효한 검색어를 전달하세요."

    clean_query = re.sub(r'site:[^\s]+', '', raw_query).strip().strip('"\'').strip() or raw_query

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


@tool
def get_weather(location: str, days: int = 3) -> str:
    """도시/지역의 현재 날씨와 일별 예보를 조회합니다. location에는 도시 이름(예: '서울', 'Tokyo'), days에는 예보 일수(1~7)를 전달하세요."""
    clean_location = (location or "").strip()
    if not clean_location:
        return "오류: 지역 이름이 비어 있습니다. 도시 이름을 전달하세요."
    try:
        forecast_days = max(1, min(int(days), 7))
    except (TypeError, ValueError):
        forecast_days = 3

    try:
        candidates = [clean_location]
        if " " in clean_location:
            candidates.append(clean_location.split()[0])
        place = None
        for name in candidates:
            geo = _get_json(
                "https://geocoding-api.open-meteo.com/v1/search",
                {"name": name, "count": 1, "language": "ko", "format": "json"},
            )
            if geo.get("results"):
                place = geo["results"][0]
                break
        if not place:
            nom_res = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": clean_location, "format": "json", "limit": 1},
                headers={"User-Agent": "noa-e-weather-tool/1.0", "Accept-Language": "ko"},
                timeout=HTTP_TIMEOUT_SEC,
            )
            if nom_res.ok and nom_res.json():
                hit = nom_res.json()[0]
                place = {
                    "latitude": float(hit["lat"]),
                    "longitude": float(hit["lon"]),
                    "name": hit.get("display_name", clean_location),
                }
        if not place:
            return f"'{clean_location}'에 해당하는 지역을 찾지 못했습니다. 도시 이름으로 다시 시도하세요."

        data = _get_json(
            "https://api.open-meteo.com/v1/forecast",
            {
                "latitude": place["latitude"],
                "longitude": place["longitude"],
                "current": "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
                "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                "timezone": "auto",
                "forecast_days": forecast_days,
            },
        )

        current = data.get("current", {})
        place_name = ", ".join(p for p in [place.get("name"), place.get("admin1"), place.get("country")] if p)
        lines = [
            f"**{place_name} 날씨** (기준 시각 {current.get('time', '-')}, {data.get('timezone', '')})",
            f"- 현재: {WEATHER_CODE_KO.get(current.get('weather_code'), '알 수 없음')}, "
            f"{current.get('temperature_2m')}°C (체감 {current.get('apparent_temperature')}°C), "
            f"습도 {current.get('relative_humidity_2m')}%, 풍속 {current.get('wind_speed_10m')}km/h, "
            f"강수 {current.get('precipitation')}mm",
            "",
            "일별 예보:",
        ]
        daily = data.get("daily", {})
        for i, day in enumerate(daily.get("time", [])):
            lines.append(
                f"- {day}: {WEATHER_CODE_KO.get(daily['weather_code'][i], '알 수 없음')}, "
                f"{daily['temperature_2m_min'][i]}~{daily['temperature_2m_max'][i]}°C, "
                f"강수확률 {daily['precipitation_probability_max'][i]}%"
            )
        return "\n".join(lines)
    except Exception as e:
        logger.error(f"Open-Meteo 날씨 조회 오류 ({clean_location}): {e}")
        return f"날씨 조회 중 오류가 발생했습니다: {e}"


@tool
def youtube_search(query: str, max_results: int = 5) -> str:
    """YouTube에서 영상을 검색합니다. query에는 검색어, max_results에는 결과 개수(1~10)를 전달하세요."""
    clean_query = (query or "").strip()
    if not clean_query:
        return "오류: 검색어가 비어 있습니다. 유효한 검색어를 전달하세요."

    api_key = _load_local_env_var("YOUTUBE_API_KEY")
    if not api_key:
        return "오류: YouTube API Key가 설정되지 않았습니다. 런타임 설정 창에서 YouTube 노드의 API Key를 입력하거나 YOUTUBE_API_KEY 환경 변수를 설정하세요."
    try:
        result_count = max(1, min(int(max_results), 10))
    except (TypeError, ValueError):
        result_count = 5

    try:
        response = requests.get(
            "https://www.googleapis.com/youtube/v3/search",
            params={"part": "snippet", "type": "video", "q": clean_query, "maxResults": result_count, "key": api_key},
            timeout=HTTP_TIMEOUT_SEC,
        )
        if not response.ok:
            try:
                reason = response.json().get("error", {}).get("message", response.text)
            except ValueError:
                reason = response.text
            return f"YouTube 검색 중 오류가 발생했습니다 (HTTP {response.status_code}): {_mask_secrets(str(reason), [api_key])}"

        items = response.json().get("items", [])
        if not items:
            return f"'{clean_query}'에 대한 YouTube 영상 검색 결과가 없습니다."

        formatted = []
        for idx, item in enumerate(items, 1):
            snippet = item.get("snippet", {})
            video_id = item.get("id", {}).get("videoId", "")
            title = html.unescape(snippet.get("title", "제목 없음"))
            description = html.unescape(snippet.get("description", "")).strip()
            formatted.append(
                f"{idx}. [{title}](https://www.youtube.com/watch?v={video_id})\n"
                f"채널: {html.unescape(snippet.get('channelTitle', '-'))} | 게시일: {snippet.get('publishedAt', '')[:10]}"
                + (f"\n{description[:120]}" if description else "")
            )
        return "\n\n".join(formatted)
    except Exception as e:
        masked = _mask_secrets(str(e), [api_key])
        logger.error(f"YouTube 검색 오류 ({clean_query}): {masked}")
        return f"YouTube 검색 중 오류가 발생했습니다: {masked}"


class BaseToolNode(BaseNode):
    tool_func = None
    tool_arg_name = "query"
    tool_log_name = "도구"

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        input_text = state.get("current_output", "") or state.get("input_text", "")
        clean_input = str(input_text).strip()
        try:
            result_str = str(self.tool_func.invoke({self.tool_arg_name: clean_input}))
        except Exception as e:
            result_str = f"{self.tool_log_name} 수행 중 오류 발생: {str(e)}"

        return {
            "current_output": result_str,
            "logs": [f"[{self.node_id}] {self.tool_log_name} 완료: '{clean_input}'"]
        }

    def get_tool(self):
        return self.tool_func


@register_node("calculator")
class CalculatorNode(BaseToolNode):
    tool_func = calculate
    tool_arg_name = "expression"
    tool_log_name = "수식 계산"


@register_node("search")
class SearchNode(BaseToolNode):
    tool_func = web_search
    tool_arg_name = "query"
    tool_log_name = "웹 검색"


@register_node("weather")
class WeatherNode(BaseToolNode):
    tool_func = get_weather
    tool_arg_name = "location"
    tool_log_name = "날씨 조회"


@register_node("youtube")
class YoutubeNode(BaseToolNode):
    tool_func = youtube_search
    tool_arg_name = "query"
    tool_log_name = "YouTube 검색"

    def __init__(self, node_id: str, config: Dict[str, Any] = None):
        super().__init__(node_id, config)
        # 왜: 로컬 런타임 GUI에서 설정한 YouTube 노드의 api_key를 도구 함수가 참조할 수 있도록 환경변수에 주입
        node_api_key = (self.config.get("api_key") or "").strip()
        if node_api_key:
            os.environ["YOUTUBE_API_KEY"] = node_api_key
