; =====================================================================
; NOA-E Desktop Inno Setup Installer Script
; =====================================================================
; 요구사항: Inno Setup 6.x / 7.x 이상 (https://jrsoftware.org/isdl.php)
; 사용법:
;   1. python build_exe.py 실행 (dist/NOA-E_Desktop 생성)
;   2. Inno Setup Compiler로 본 스크립트(installer.iss)를 열어 빌드 (F9)
;      또는 ISCC.exe installer.iss 명령어로 CLI 빌드
; =====================================================================

#define MyAppName "NOA-E Desktop"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "NOA-E"
#define MyAppExeName "noa-e.exe"

[Setup]
AppId={{D9A83F12-7B4C-4B9E-8B1E-6D29C4A0F901}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
; 관리자 권한 여부 (사용자 설치도 허용)
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=installer_output
OutputBaseFilename=NOA-E_Desktop_Setup_v{#MyAppVersion}
SetupIconFile=assets\icon.ico
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "korean"; MessagesFile: "compiler:Languages\Korean.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce
Name: "envpath"; Description: "환경 변수(PATH)에 noa-e 명령어 경로 추가 (터미널에서 noa-e 바로 실행 가능)"; GroupDescription: "고급 옵션:"

[Files]
; PyInstaller --onedir 출력 디렉터리의 모든 파일 및 하위 폴더 포함
Source: "dist\noa-e\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Registry]
; PATH 환경변수 추가 (Tasks: envpath 선택 시)
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Tasks: envpath; Check: NeedsAddPath(ExpandConstant('{app}'))

[Code]
// PATH 중복 등록 방지 체크 함수
function NeedsAddPath(Param: string): boolean;
var
  OrigPath: string;
begin
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', OrigPath)
  then begin
    Result := True;
    exit;
  end;
  // 기존 PATH에 이미 등록되어 있는지 확인
  Result := Pos(';' + Param + ';', ';' + OrigPath + ';') = 0;
end;

// 삭제 시 PATH에서 설치 디렉터리 제거
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  AppDir, OrigPath, NewPath: string;
  P, L: Integer;
begin
  if CurUninstallStep = usUninstall then
  begin
    AppDir := ExpandConstant('{app}');
    if RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', OrigPath) then
    begin
      P := Pos(AppDir, OrigPath);
      if P > 0 then
      begin
        L := Length(AppDir);
        // 세미콜론 포함 처리
        if (P > 1) and (OrigPath[P - 1] = ';') then
        begin
          P := P - 1;
          L := L + 1;
        end
        else if (P + L <= Length(OrigPath)) and (OrigPath[P + L] = ';') then
        begin
          L := L + 1;
        end;
        Delete(OrigPath, P, L);
        RegWriteStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', OrigPath);
      end;
    end;
  end;
end;
