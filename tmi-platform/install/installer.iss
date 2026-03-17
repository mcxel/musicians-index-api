; BerntoutGlobal XXL - Master Inno Setup Installer Script
; This script packages the Next.js web application and the Python runtime server
; for a stable Windows installation.

#define AppName "BerntoutGlobal XXL"
#define AppVersion "1.0.0"
#define AppPublisher "BerntoutGlobal"
#define AppURL "https://www.berntoutglobal.com"
#define AppExeName "start-server.bat"
#define KioskShortcutName "BerntoutGlobal XXL - Kiosk"

[Setup]
AppId={{5C1B3A3C-6593-4A99-8D33-43A5F5E4E42F}}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
AllowNoIcons=yes
OutputBaseFilename=berntoutglobal-xxl-setup-{#AppVersion}
Compression=lzma
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\web\public\favicon.ico
; --- Placeholders for custom wizard images ---
; WizardImageFile=install\assets\splash.bmp
; WizardSmallImageFile=install\assets\icon.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkablealone
Name: "kioskicon"; Description: "Create Kiosk Mode shortcut on Desktop"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkablealone

[Files]
; This assumes a build process that places the necessary files in a /dist folder.
; You must run `pnpm -C tmi-platform/apps/web build` first.
; The Next.js output is in `tmi-platform/apps/web/.next/standalone`.
; The Python server is `api_server.py`.

; Source: "path	o\your\files\*"; DestDir: "{app}\destination"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\apps\web\.next\standalone\*"; DestDir: "{app}\web"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\apps\web\public\*"; DestDir: "{app}\web\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\api_server.py"; DestDir: "{app}untime"; Flags: ignoreversion
Source: "..\..equirements.min.txt"; DestDir: "{app}untime"; Flags: ignoreversion

; A batch script to start the servers. This simplifies the process for the end-user.
Source: "scripts\start-server.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "scripts\start-kiosk.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "scripts\pre-install-check.ps1"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExeName}"
Name: "{group}\{cm:UninstallProgram,{#AppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExeName}"; Tasks: desktopicon
Name: "{autodesktop}\{#KioskShortcutName}"; Filename: "{app}\start-kiosk.bat"; Tasks: kioskicon

[Run]
Filename: "{app}\{#AppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(AppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

; Optional: Launch Kiosk mode directly after install
Filename: "{app}\start-kiosk.bat"; Description: "Launch in Kiosk Mode"; Flags: nowait postinstall skipifsilent checked

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[Code]
var
  PythonPath: String;

function IsPythonInstalled(): Boolean;
begin
  // Check registry for Python installation path
  if RegQueryStringValue(HKLM, 'SOFTWARE\Python\PythonCore\3.11\InstallPath', '', PythonPath) or
     RegQueryStringValue(HKCU, 'SOFTWARE\Python\PythonCore\3.11\InstallPath', '', PythonPath) then
  begin
    Log('Python 3.11 found at: ' + PythonPath);
    Result := True;
  end
  else
  begin
    Log('Python 3.11 not found in registry.');
    Result := False;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
  begin
    // Pre-install check for Python
    if not IsPythonInstalled() then
    begin
      MsgBox('Python 3.11 is required but was not found on this system. Please install Python 3.11 and run the installer again.', mbError, MB_OK);
      WizardForm.Close;
    end;
    
    // Logic to install Python dependencies via pip
    // This assumes pip is in the path.
    // A more robust solution would use the full path to pip.exe from the registry key found above.
    // ShellExec('open', 'pip', 'install -r "{app}untimeequirements.min.txt"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;
end;

// --- Placeholder for uninstall animation/process ---
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usUninstall then
  begin
    // Example: Show a custom message or launch a feedback form
    // ShellExec('open', 'http://www.berntoutglobal.com/feedback?version={#AppVersion}', '', '', SW_SHOWNORMAL, ewNoWait, ErrorCode);
  end;
end;
