@echo off
ECHO =================================================
ECHO  Starting BerntoutGlobal XXL Application
ECHO =================================================

REM This script assumes it's being run from the root of the installation directory.

SETLOCAL

REM Get the script's directory
SET "SCRIPT_DIR=%~dp0"

ECHO Starting Python Runtime Server...
start "API Server" /D "%SCRIPT_DIR%untime" python api_server.py

ECHO Starting Next.js Web Server...
REM The standalone Next.js server is started with Node.
start "Web Server" /D "%SCRIPT_DIR%\web" node server.js

ECHO.
ECHO Servers are starting in the background.
ECHO Please allow a few moments for them to initialize.
ECHO You can access the application at http://localhost:3000

ENDLOCAL

timeout /t 10
