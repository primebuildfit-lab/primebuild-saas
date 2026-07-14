@echo off
setlocal
chcp 65001 >nul
title Eventra - Internal OS (Admin)
cd /d "%~dp0"

echo Starting Eventra Internal OS (private admin console)...
echo It will open automatically as an app window.
echo Close this window or press Ctrl-C to stop.
echo.

call npm run start:admin -- %*
set "EXITCODE=%ERRORLEVEL%"

if not "%EXITCODE%"=="0" (
  echo.
  echo Eventra Internal OS exited with code %EXITCODE%.
  pause
)
endlocal & exit /b %EXITCODE%
