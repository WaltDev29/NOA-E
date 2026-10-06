"""
NOA-E Desktop PyInstaller 빌드 스크립트 (PySide6 Native GUI)
------------------------------------------------------------
사용법:
  1. pip install pyinstaller PySide6
  2. python build_exe.py

빌드가 완료되면 dist/noa-e/ 디렉토리에 실행 파일(noa-e.exe)이 생성됩니다.
"""

import os
import sys
import subprocess

def build():
    print("======================================================")
    print(" 🚀 NOA-E Desktop (PySide6) EXE 빌드 시작")
    print("======================================================")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    entry_point = os.path.join(current_dir, "agent_runner.py")
    
    assets_dir = os.path.join(current_dir, "assets")
    icon_file = os.path.join(assets_dir, "icon.ico")

    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--name=noa-e",
        "--onedir",
        "--windowed", # GUI 앱으로 콘솔 창 숨김 (CLI 실행 시 콘솔 자동 연결)
        "--noconfirm",
        "--clean",
        f"--add-data={os.path.join(current_dir, 'gui.py')};.",
        f"--add-data={os.path.join(current_dir, 'core')};core",
        f"--add-data={os.path.join(current_dir, 'config.py')};.",
        f"--add-data={os.path.join(current_dir, 'storage.py')};.",
        f"--add-data={assets_dir};assets",
        "--hidden-import=PySide6",
        "--hidden-import=PySide6.QtCore",
        "--hidden-import=PySide6.QtWidgets",
        "--hidden-import=PySide6.QtGui",
        "--hidden-import=langchain_core",
        "--hidden-import=langgraph",
        "--hidden-import=langchain_openai",
        "--hidden-import=colorama",
    ]

    if os.path.exists(icon_file):
        cmd.append(f"--icon={icon_file}")

    cmd.append(entry_point)
    
    print(f"실행 명령어: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=current_dir)
    
    if result.returncode == 0:
        print("\n======================================================")
        print(" ✔ 빌드 완료! dist/noa-e/ 디렉토리를 확인하세요.")
        print("======================================================")
    else:
        print("\n❌ 빌드 실패. 오류 메시지를 확인하세요.")

if __name__ == "__main__":
    build()
