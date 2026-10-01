"""
NOA-E Agent Runtime PyInstaller 빌드 스크립트 (PySide6 Native GUI)
-----------------------------------------------------------------
사용법:
  1. pip install pyinstaller PySide6
  2. python build_exe.py

빌드가 완료되면 dist/NOA-E_Agent_Runtime/ 디렉토리에 실행 파일이 생성됩니다.
"""

import os
import sys
import subprocess

def build():
    print("======================================================")
    print(" 🚀 NOA-E Agent Runtime (PySide6) EXE 빌드 시작")
    print("======================================================")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    entry_point = os.path.join(current_dir, "agent_runner.py")
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--name=NOA-E_Agent_Runtime",
        "--onedir",
        "--windowed", # GUI 앱으로 콘솔 창 숨김 (CLI 실행은 별도 인자로 가능)
        "--noconfirm",
        "--clean",
        f"--add-data={os.path.join(current_dir, 'gui.py')};.",
        f"--add-data={os.path.join(current_dir, 'core')};core",
        f"--add-data={os.path.join(current_dir, 'config.py')};.",
        f"--add-data={os.path.join(current_dir, 'storage.py')};.",
        "--hidden-import=PySide6",
        "--hidden-import=PySide6.QtCore",
        "--hidden-import=PySide6.QtWidgets",
        "--hidden-import=PySide6.QtGui",
        "--hidden-import=langchain_core",
        "--hidden-import=langgraph",
        "--hidden-import=langchain_openai",
        "--hidden-import=colorama",
        entry_point
    ]
    
    print(f"실행 명령어: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=current_dir)
    
    if result.returncode == 0:
        print("\n======================================================")
        print(" ✔ 빌드 완료! dist/NOA-E_Agent_Runtime/ 디렉토리를 확인하세요.")
        print("======================================================")
    else:
        print("\n❌ 빌드 실패. 오류 메시지를 확인하세요.")

if __name__ == "__main__":
    build()
