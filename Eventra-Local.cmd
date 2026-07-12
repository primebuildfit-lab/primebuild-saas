@echo off
setlocal
chcp 65001 >nul
title Eventra - Local
cd /d "%~dp0"

echo Starting Eventra (local preview + file persistence)...
echo A browser will open automatically at http://localhost:3000/app
echo Close this window or press Ctrl-C to stop.
echo.

call npm run start:local -- %*
set "EXITCODE=%ERRORLEVEL%"

if not "%EXITCODE%"=="0" (
  echo.
  echo Eventra exited with code %EXITCODE%.
  echo If this was unexpected, see docs\LOCAL_USAGE.md ^(Troubleshooting^).
  pause
)
endlocal & exit /b %EXITCODE%
