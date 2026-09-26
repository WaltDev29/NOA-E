import os
import sys
import json
import argparse

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
for p in [current_dir, parent_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from runtime.core.engine.compiler import WorkflowCompiler
    from runtime.storage import extract_llm_nodes, update_llm_configs_in_workflow
except ModuleNotFoundError:
    from core.engine.compiler import WorkflowCompiler
    from storage import extract_llm_nodes, update_llm_configs_in_workflow

def run_cli_chat(workflow_path: str):
    """
    터미널(CLI) 기반 인터랙티브 에이전트 대화 루프
    """
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
    print(f"{Fore.YELLOW}• 감지된 LLM/Agent 노드: {len(llm_nodes)}개")
    for n in llm_nodes:
        mode_str = "커스텀 API" if n["is_custom"] else "기본 서버 Ollama"
        print(f"   - [{n['id']}] {n['label']} (Model: {n['model']}, 모드: {mode_str})")

    print(f"\n{Fore.CYAN}[컴파일 중...] LangGraph StateGraph 구축 중...")
    try:
        type_map = {
            "inputNode": "input",
            "llmNode": "llm",
            "outputNode": "output",
            "searchNode": "search",
            "calculatorNode": "calculator",
            "agentNode": "agent"
        }
        normalized_workflow = {
            "nodes": [
                {
                    "id": n.get("id"),
                    "type": type_map.get(n.get("type"), n.get("type")),
                    "config": n.get("config", {}) or n.get("data", {}).get("config", {})
                }
                for n in workflow_json.get("nodes", [])
            ],
            "edges": [
                {"source": e.get("source"), "target": e.get("target")}
                for e in workflow_json.get("edges", [])
            ]
        }
        compiler = WorkflowCompiler()
        graph = compiler.compile_workflow(normalized_workflow)
        print(f"{Fore.GREEN}✔ 컴파일 성공! 에이전트가 준비되었습니다.{Style.RESET_ALL}")
    except Exception as e:
        print(f"{Fore.RED}❌ 컴파일 실패: {e}{Style.RESET_ALL}")
        return

    print(f"\n{Fore.WHITE}대화를 시작합니다. ('exit', 'quit' 입력 시 종료, 'clear' 입력 시 메모리 초기화)")
    print(f"{Fore.CYAN}------------------------------------------------------{Style.RESET_ALL}\n")

    conversation_messages = []
    
    while True:
        try:
            user_input = input(f"{Fore.GREEN}User > {Style.RESET_ALL}").strip()
            if not user_input:
                continue
                
            if user_input.lower() in ("exit", "quit", "q"):
                print(f"\n{Fore.YELLOW}에이전트를 종료합니다. 안녕히 가세요!{Style.RESET_ALL}")
                break
                
            if user_input.lower() == "clear":
                conversation_messages = []
                print(f"{Fore.YELLOW}[알림] 대화 메모리가 초기화되었습니다.{Style.RESET_ALL}\n")
                continue

            initial_state = {
                "input_text": user_input,
                "current_output": "",
                "messages": conversation_messages,
                "logs": []
            }

            print(f"\n{Fore.MAGENTA}🤖 Agent 생각 중...{Style.RESET_ALL}")
            result = graph.invoke(initial_state)
            
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
    try:
        from runtime.gui import launch_gui
    except ModuleNotFoundError:
        from gui import launch_gui
    launch_gui()

def main():
    parser = argparse.ArgumentParser(description="NOA-E Local Agent Runtime Runner (PySide6 GUI / CLI)")
    parser.add_argument("--workflow", "-w", type=str, help="실행할 워크플로우 JSON 파일 경로")
    parser.add_argument("--cli", action="store_true", help="CLI 터미널 대화 모드로 실행")
    parser.add_argument("--gui", action="store_true", help="PySide6 GUI 모드로 실행")
    
    args = parser.parse_args()
    
    if args.cli and args.workflow:
        run_cli_chat(args.workflow)
    else:
        # 기본값: PySide6 GUI 실행
        run_pyside_gui()

if __name__ == "__main__":
    main()
