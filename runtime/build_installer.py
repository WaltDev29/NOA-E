"""
NOA-E Desktop 원클릭 인스톨러 빌드 스크립트
-------------------------------------------------
1. PyInstaller로 --onedir 빌드 (dist/noa-e)
2. Inno Setup Compiler(ISCC.exe)를 호출하여 최종 설치 파일(Setup.exe) 생성
"""

import os
import sys
import subprocess
import shutil

def find_inno_setup_compiler():
    """시스템에 설치된 Inno Setup Compiler(ISCC.exe)의 경로를 검색합니다."""
    # 1. PATH 환경변수 확인
    iscc = shutil.which("iscc") or shutil.which("ISCC.exe")
    if iscc:
        return iscc

    # 2. 일반적인 Windows Program Files 경로 확인
    candidates = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Inno Setup 7\ISCC.exe"),
        os.path.expandvars(r"%ProgramFiles%\Inno Setup 7\ISCC.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"),
        os.path.expandvars(r"%ProgramFiles%\Inno Setup 6\ISCC.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Inno Setup 5\ISCC.exe"),
        os.path.expandvars(r"%ProgramFiles%\Inno Setup 5\ISCC.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Inno Setup 7\ISCC.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Inno Setup 6\ISCC.exe"),
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path
    return None

def build():
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # 1단계: PyInstaller --onedir 빌드
    print("======================================================")
    print(" [Step 1/2] PyInstaller --onedir 빌드 실행")
    print("======================================================")
    build_exe_script = os.path.join(current_dir, "build_exe.py")
    res = subprocess.run([sys.executable, build_exe_script], cwd=current_dir)
    if res.returncode != 0:
        print("❌ 1단계 PyInstaller 빌드 실패")
        return

    # 2단계: Inno Setup 패키징
    print("\n======================================================")
    print(" [Step 2/2] Inno Setup 설치 마법사(Setup.exe) 생성")
    print("======================================================")
    iscc_path = find_inno_setup_compiler()
    iss_file = os.path.join(current_dir, "installer.iss")

    if not iscc_path:
        print("⚠️ Inno Setup Compiler (ISCC.exe)를 찾을 수 없습니다.")
        print("  - Inno Setup 공식 다운로드: https://jrsoftware.org/isdl.php")
        print(f"  - 설치 후 Inno Setup Compiler에서 직접 아래 파일을 열어 빌드(F9)하거나,")
        print(f"    스크립트를 다시 실행해주세요: {iss_file}")
        return

    print(f"✔ ISCC 발견: {iscc_path}")
    print(f"✔ ISS 스크립트 컴파일 시작: {iss_file}")
    
    res = subprocess.run([iscc_path, iss_file], cwd=current_dir)
    if res.returncode == 0:
        out_dir = os.path.join(current_dir, "installer_output")
        print("\n" + "=" * 60)
        print(" 🎉 최종 설치 마법사 빌드 완료!")
        print(f" 📂 출력 경로: {out_dir}")
        print("=" * 60)
    else:
        print("❌ Inno Setup 컴파일 실패")

if __name__ == "__main__":
    build()
