@echo off
setlocal
chcp 65001 >nul
title Eventra - Mobile (Consumer PWA)
cd /d "%~dp0"

echo Starting Eventra Mobile (local host for the Consumer PWA)...
echo It will open automatically in a phone-sized app window.
echo Close this window or press Ctrl-C to stop.
echo.

call npm run start:mobile -- %*
set "EXITCODE=%ERRORLEVEL%"

if not "%EXITCODE%"=="0" (
  echo.
  echo Eventra Mobile exited with code %EXITCODE%.
  pause
)
endlocal & exit /b %EXITCODE%
