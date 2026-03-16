@echo off
ECHO =================================================
ECHO  Launching BerntoutGlobal XXL in Kiosk Mode
ECHO =================================================

REM This script launches the web browser in kiosk mode.
REM It assumes the servers are already running via start-server.bat.

SET "URL=http://localhost:3000/hud?mode=kiosk&module=xxl"

ECHO Checking for running servers...
REM A simple check to see if the port is in use.
netstat -an | find "3000" | find "LISTENING" > nul
if errorlevel 1 (
    ECHO Warning: Server not detected on port 3000.
    ECHO Please run start-server.bat first.
    timeout /t 10
    exit /b
)

ECHO Found server. Launching URL in Kiosk Mode:
ECHO %URL%
ECHO.
ECHO Note: This will attempt to open Microsoft Edge or Chrome in kiosk mode.
ECHO Please ensure one of them is installed.

REM Try to find Microsoft Edge first, then Chrome
SET "edge_path=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
SET "chrome_path=%ProgramFiles%\Google\Chrome\Application\chrome.exe"

IF EXIST "%edge_path%" (
    start "Kiosk" "%edge_path%" --kiosk %URL%
) ELSE IF EXIST "%chrome_path%" (
    start "Kiosk" "%chrome_path%" --kiosk %URL%
) ELSE (
    ECHO ERROR: Neither Microsoft Edge nor Google Chrome could be found.
    ECHO Cannot launch in kiosk mode.
    pause
)
