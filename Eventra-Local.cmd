@echo off
REM Eventra — local launcher (double-click to run).
REM Starts Eventra Business locally in preview + file-persistence mode.
REM No Shopify, no Supabase, no external services. Close the window or press
REM Ctrl-C to stop.
cd /d "%~dp0"
echo Starting Eventra (local preview + file persistence)...
echo A browser-ready URL will appear below. Open it in your browser.
echo.
call npm run start:local
pause
