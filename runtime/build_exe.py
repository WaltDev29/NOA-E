"""
NOA-E Desktop PyInstaller 빌드 스크립트 (PySide6 Native GUI)
------------------------------------------------------------
사용법:
  1. pip install pyinstaller PySide6 duckduckgo-search requests
  2. python build_exe.py

빌드가 완료되면 dist/noa-e/ 디렉토리에 실행 파일(noa-e.exe)이 생성됩니다.
"""

import os
import sys
import glob
import shutil
import subprocess


def _post_process_dist(dist_dir: str):
    """
    왜: Conda 환경에서 패키징될 때 포함되는 구버전 MSVCP140/VCRUNTIME140 및 Conda 전용 icu*.dll이
    PySide6(Qt6Core.dll/Qt6Widgets.dll)와 심볼 충돌('지정된 프로시저를 찾을 수 없습니다')을 일으키므로,
    충돌하는 icu*.dll을 제거하고 PySide6 내장 최신 MSVC 런타임 DLL로 통일합니다.
    """
    internal_dir = os.path.join(dist_dir, "_internal")
    pyside_dir = os.path.join(internal_dir, "PySide6")
    if not os.path.isdir(internal_dir):
        return

    # 1. Windows System32 icuuc.dll 대신 로드되어 Qt6Core.dll 심볼 오류를 유발하는 Conda icu*.dll 제거
    for icu_dll in glob.glob(os.path.join(internal_dir, "icu*.dll")):
        try:
            os.remove(icu_dll)
            print(f"  [후처리] 충돌 ICU DLL 제거: {os.path.basename(icu_dll)}")
        except Exception as e:
            print(f"  [경고] {icu_dll} 제거 실패: {e}")

    # 2. PySide6가 요구하는 최신 MSVC 런타임(MSVCP140*.dll, VCRUNTIME140*.dll)을 _internal 루트에 덮어쓰기
    if os.path.isdir(pyside_dir):
        for pattern in ("MSVCP140*.dll", "VCRUNTIME140*.dll"):
            for src_dll in glob.glob(os.path.join(pyside_dir, pattern)):
                dst_dll = os.path.join(internal_dir, os.path.basename(src_dll))
                try:
                    shutil.copy2(src_dll, dst_dll)
                    print(f"  [후처리] 최신 MSVC 런타임 동기화: {os.path.basename(src_dll)}")
                except Exception as e:
                    print(f"  [경고] {src_dll} 복사 실패: {e}")


def _sync_staging_to_dist(staging_noa_dir: str, final_noa_dir: str):
    """
    왜: Windows에서 사용자가 이미 실행 중인 noa-e.exe나 DLL이 있으면 삭제(os.unlink) 시 WinError 5가 발생하지만,
    실행 중인 파일을 같은 볼륨 내에서 이름 변경(os.replace)하는 것은 허용됩니다.
    이를 활용해 실행 중인 프로세스를 강제 종료하지 않고도 최신 빌드 파일로 안전하게 교체합니다.
    """
    os.makedirs(final_noa_dir, exist_ok=True)
    # 이전 빌드에서 남은 .old 임시 파일 정리 시도
    for root, _, files in os.walk(final_noa_dir):
        for f in files:
            if f.endswith(".old_locked"):
                try:
                    os.remove(os.path.join(root, f))
                except Exception:
                    pass

    for root, dirs, files in os.walk(staging_noa_dir):
        rel_dir = os.path.relpath(root, staging_noa_dir)
        target_dir = final_noa_dir if rel_dir == "." else os.path.join(final_noa_dir, rel_dir)
        os.makedirs(target_dir, exist_ok=True)
        for f in files:
            src_file = os.path.join(root, f)
            dst_file = os.path.join(target_dir, f)
            try:
                shutil.copy2(src_file, dst_file)
            except PermissionError:
                # 실행 중이어서 잠긴 파일은 이름을 변경한 뒤 새 파일을 복사
                locked_backup = dst_file + ".old_locked"
                try:
                    if os.path.exists(locked_backup):
                        os.remove(locked_backup)
                except Exception:
                    locked_backup = dst_file + f".{os.getpid()}.old_locked"
                os.replace(dst_file, locked_backup)
                shutil.copy2(src_file, dst_file)


def build():
    print("======================================================")
    print(" 🚀 NOA-E Desktop (PySide6) EXE 빌드 시작")
    print("======================================================")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    entry_point = os.path.join(current_dir, "agent_runner.py")
    
    assets_dir = os.path.join(current_dir, "assets")
    icon_file = os.path.join(assets_dir, "icon.ico")
    staging_dist_dir = os.path.join(current_dir, "dist_staging")
    if os.path.exists(staging_dist_dir):
        shutil.rmtree(staging_dist_dir, ignore_errors=True)

    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--name=noa-e",
        "--onedir",
        "--windowed",  # GUI 앱으로 콘솔 창 숨김 (CLI 실행 시 콘솔 자동 연결)
        "--noconfirm",
        "--clean",
        f"--distpath={staging_dist_dir}",
        f"--add-data={os.path.join(current_dir, 'gui.py')};.",
        f"--add-data={os.path.join(current_dir, 'core')};core",
        f"--add-data={os.path.join(current_dir, 'config.py')};.",
        f"--add-data={os.path.join(current_dir, 'storage.py')};.",
        f"--add-data={assets_dir};assets",
        "--hidden-import=PySide6",
        "--hidden-import=PySide6.QtCore",
        "--hidden-import=PySide6.QtWidgets",
        "--hidden-import=PySide6.QtGui",
        "--hidden-import=shiboken6",
        "--hidden-import=langchain_core",
        "--hidden-import=langchain_core.tools",
        "--hidden-import=langgraph",
        "--hidden-import=langchain_openai",
        "--hidden-import=colorama",
        "--hidden-import=requests",
        "--hidden-import=duckduckgo_search",
        "--hidden-import=primp",
        "--hidden-import=lxml",
        "--hidden-import=html",
        # 불필요한 대용량 과학 연산 패키지 제외 (빌드 속도 향상 및 DLL 충돌 방지)
        "--exclude-module=matplotlib",
        "--exclude-module=scipy",
        "--exclude-module=pandas",
        "--exclude-module=pyarrow",
        "--exclude-module=IPython",
        "--exclude-module=notebook",
        "--exclude-module=tkinter",
        "--exclude-module=pytest",
    ]

    if os.path.exists(icon_file):
        cmd.append(f"--icon={icon_file}")

    cmd.append(entry_point)
    
    print(f"실행 명령어: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=current_dir)
    
    if result.returncode == 0:
        staging_noa_dir = os.path.join(staging_dist_dir, "noa-e")
        dist_noa_dir = os.path.join(current_dir, "dist", "noa-e")
        _post_process_dist(staging_noa_dir)
        _sync_staging_to_dist(staging_noa_dir, dist_noa_dir)
        shutil.rmtree(staging_dist_dir, ignore_errors=True)
        print("\n======================================================")
        print(" ✔ 빌드 및 DLL 최적화 완료! dist/noa-e/ 디렉토리를 확인하세요.")
        print("======================================================")
    else:
        print("\n❌ 빌드 실패. 오류 메시지를 확인하세요.")
        sys.exit(result.returncode)


if __name__ == "__main__":
    build()
