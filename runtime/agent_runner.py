import os
import sys
import json
import argparse

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
for p in [current_dir, parent_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)


def _setup_win32_dll_paths():
    """
    왜: PyInstaller(_internal) 패키징 환경에서 Conda 구버전 DLL이나 PATH 탐색 누락으로 인해
    PySide6(Qt6Core/Qt6Widgets)가 '지정된 프로시저를 찾을 수 없습니다' 오류를 내는 것을 방지합니다.
    """
    if sys.platform != "win32":
        return
    base_dir = getattr(sys, "_MEIPASS", current_dir)
    pyside_dir = os.path.join(base_dir, "PySide6")
    shiboken_dir = os.path.join(base_dir, "shiboken6")

    prepend_paths = []
    for d in (pyside_dir, shiboken_dir, base_dir):
        if os.path.isdir(d):
            prepend_paths.append(d)
            if hasattr(os, "add_dll_directory"):
                try:
                    os.add_dll_directory(d)
                except Exception:
                    pass
    if prepend_paths:
        os.environ["PATH"] = os.pathsep.join(prepend_paths) + os.pathsep + os.environ.get("PATH", "")


_setup_win32_dll_paths()

if os.path.isdir(os.path.join(current_dir, "core")):
    from core.engine.compiler import WorkflowCompiler
    from storage import extract_llm_nodes, update_llm_configs_in_workflow, get_youtube_api_key
else:
    from runtime.core.engine.compiler import WorkflowCompiler
    from runtime.storage import extract_llm_nodes, update_llm_configs_in_workflow, get_youtube_api_key


def run_cli_chat(workflow_path: str):
    """
    터미널(CLI) 기반 인터랙티브 에이전트 대화 루프
    """
    get_youtube_api_key()
    try:
        from colorama import init, Fore, Style
        init(autoreset=True)
    except ImportError:
        class Dummy:
            def __getattr__(self, name):
                return ""
        Fore = Style = Dummy()

    print(f"\n{Fore.CYAN}======================================================")
    print(f"{Fore.GREEN} NOA-E Agent Local CLI Runtime")
    print(f"{Fore.CYAN}======================================================{Style.RESET_ALL}")
    
    if not os.path.exists(workflow_path):
        print(f"{Fore.RED}오류: 지정한 워크플로우 파일을 찾을 수 없습니다: {workflow_path}")
        return

    with open(workflow_path, "r", encoding="utf-8") as f:
        workflow_json = json.load(f)

    agent_name = workflow_json.get("metadata", {}).get("agent_name", "Local Agent")
    print(f"{Fore.YELLOW}• 에이전트 이름: {agent_name}")
    print(f"{Fore.YELLOW}• 워크플로우 경로: {workflow_path}")

    llm_nodes = extract_llm_nodes(workflow_json)
    print(f"{Fore.YELLOW}• 감지된 설정 가능 노드: {len(llm_nodes)}개")
    for n in llm_nodes:
        mode_str = "커스텀 API" if n["is_custom"] else "기본 서버 Ollama"
        print(f"   - [{n['id']}] {n['label']} (Type: {n['type']}, Model: {n['model']}, 모드: {mode_str})")

    print(f"\n{Fore.CYAN}[컴파일 중...] LangGraph StateGraph 구축 중...")
    try:
        type_map = {
            "inputNode": "input",
            "llmNode": "llm",
            "plannerNode": "planner",
            "routerNode": "router",
            "aggregatorNode": "aggregator",
            "outputNode": "output",
            "searchNode": "search",
            "weatherNode": "weather",
            "youtubeNode": "youtube",
            "calculatorNode": "calculator",
            "agentNode": "agent"
        }
        normalized_workflow = {
            "nodes": [
                {
                    "id": n.get("id"),
                    "type": type_map.get(n.get("type"), n.get("type")),
                    "label": n.get("label") or n.get("data", {}).get("label"),
                    "config": {
                        **(n.get("config", {}) or n.get("data", {}).get("config", {})),
                        "label": n.get("label") or n.get("data", {}).get("label") or n.get("type"),
                    }
                }
                for n in workflow_json.get("nodes", [])
            ],
            "edges": [
                {
                    "source": e.get("source"),
                    "target": e.get("target"),
                    "sourceHandle": e.get("sourceHandle"),
                    "targetHandle": e.get("targetHandle"),
                }
                for e in workflow_json.get("edges", [])
            ]
        }
        compiler = WorkflowCompiler()
        graph = compiler.compile_workflow(normalized_workflow)
        print(f"{Fore.GREEN}✔ 컴파일 성공! 에이전트가 준비되었습니다.{Style.RESET_ALL}")
    except Exception as e:
        print(f"{Fore.RED}❌ 컴파일 실패: {e}{Style.RESET_ALL}")
        return

    conversation_messages = []

    while True:
        try:
            user_input = input(f"{Fore.GREEN}You > {Style.RESET_ALL}").strip()
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit", "q"):
                print(f"\n{Fore.YELLOW}에이전트 실행을 종료합니다.{Style.RESET_ALL}")
                break

            initial_state = {
                "messages": list(conversation_messages),
                "input_text": user_input,
                "current_output": "",
                "logs": [],
                "plan": [],
                "current_step": 0,
                "intermediate_steps": [],
                "loop_count": 0,
                "next_worker": None,
                "routing_result": None,
            }

            print(f"\n{Fore.MAGENTA}🤖 Agent 생각 중...{Style.RESET_ALL}")
            result = graph.invoke(initial_state, config={"recursion_limit": 40})
            
            output = result.get("current_output", "")
            logs = result.get("logs", [])
            conversation_messages = result.get("messages", [])

            if logs:
                print(f"\n{Fore.BLUE}--- [실행 로그] ---")
                for l in logs:
                    print(f"  {Fore.BLUE}• {l}")
                print(f"{Fore.BLUE}------------------{Style.RESET_ALL}")

            print(f"\n{Fore.CYAN}Agent > {Fore.WHITE}{output}{Style.RESET_ALL}\n")

        except KeyboardInterrupt:
            print(f"\n{Fore.YELLOW}사용자에 의해 중단되었습니다.{Style.RESET_ALL}")
            break
        except Exception as e:
            print(f"\n{Fore.RED}오류 발생: {e}{Style.RESET_ALL}\n")


def run_pyside_gui():
    """
    PySide6 네이티브 GUI 앱 실행
    """
    if os.path.isfile(os.path.join(current_dir, "gui.py")):
        from gui import launch_gui
    else:
        from runtime.gui import launch_gui
    launch_gui()


def _attach_console():
    """Windows 환경에서 GUI 앱으로 패키징되었을 때 터미널 호출 시 표준 입출력을 콘솔에 연결"""
    if sys.platform == "win32":
        try:
            import ctypes
            if ctypes.windll.kernel32.AttachConsole(-1):
                sys.stdout = open("CONOUT$", "w", encoding="utf-8")
                sys.stderr = open("CONOUT$", "w", encoding="utf-8")
                sys.stdin = open("CONIN$", "r", encoding="utf-8")
        except Exception:
            pass


def main():
    _attach_console()
    parser = argparse.ArgumentParser(description="NOA-E Desktop Runner (PySide6 GUI / CLI)")
    parser.add_argument("--workflow", "-w", type=str, help="실행할 워크플로우 JSON 파일 경로")
    parser.add_argument("--cli", action="store_true", help="CLI 터미널 대화 모드로 실행")
    parser.add_argument("--gui", action="store_true", help="PySide6 GUI 모드로 실행")
    
    args = parser.parse_args()
    
    if args.cli and args.workflow:
        run_cli_chat(args.workflow)
    else:
        run_pyside_gui()


if __name__ == "__main__":
    main()
