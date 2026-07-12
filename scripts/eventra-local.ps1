# Eventra - local launcher (PowerShell). Equivalent to Eventra-Local.cmd.
# Forces UTF-8 output so Unicode/colors render regardless of console defaults.
#   pwsh scripts/eventra-local.ps1            # default port 3000
#   pwsh scripts/eventra-local.ps1 4000       # custom port
#   pwsh scripts/eventra-local.ps1 -NoOpen
param(
  [int]$Port = 3000,
  [switch]$NoOpen
)
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new() } catch {}
$OutputEncoding = [System.Text.UTF8Encoding]::new()

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Starting Eventra (local preview + file persistence)..." -ForegroundColor Cyan
Write-Host "A browser will open automatically at http://localhost:$Port/app"
Write-Host "Press Ctrl-C to stop." -ForegroundColor DarkGray
Write-Host ""

$fwd = @("$Port")
if ($NoOpen) { $fwd += "--no-open" }

& npm run start:local -- @fwd
$code = $LASTEXITCODE
if ($code -ne 0) {
  Write-Host ""
  Write-Host "Eventra exited with code $code. See docs/LOCAL_USAGE.md (Troubleshooting)." -ForegroundColor Yellow
}
exit $code
