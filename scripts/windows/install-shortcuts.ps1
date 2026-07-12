# Eventra - install Windows Desktop + Start Menu shortcuts (per-user, no admin).
# Idempotent: re-running refreshes the shortcuts. Removes with uninstall-shortcuts.ps1.
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/windows/install-shortcuts.ps1
$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmdPath = Join-Path $root 'Eventra-Local.cmd'
$icoPath = Join-Path $root 'assets\eventra.ico'
$name    = 'Eventra Business'

if (-not (Test-Path $cmdPath)) { throw "Launcher not found: $cmdPath" }
if (-not (Test-Path $icoPath)) {
  Write-Host "Icon missing - generating..."
  & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'make-icon.ps1')
}

$sh = New-Object -ComObject WScript.Shell

function New-Shortcut([string]$linkPath) {
  $dir = Split-Path -Parent $linkPath
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $lnk = $sh.CreateShortcut($linkPath)
  $lnk.TargetPath       = $cmdPath
  $lnk.WorkingDirectory = $root
  $lnk.IconLocation     = "$icoPath,0"
  $lnk.Description       = 'Eventra Business - local marketing planning (preview + file persistence)'
  $lnk.WindowStyle      = 1
  $lnk.Save()
  Write-Host "  created: $linkPath"
}

# 1) Desktop
$desktop = [Environment]::GetFolderPath('Desktop')
New-Shortcut (Join-Path $desktop "$name.lnk")

# 2) Start Menu (in an 'Eventra' program folder)
$programs = [Environment]::GetFolderPath('Programs')
$startDir = Join-Path $programs 'Eventra'
New-Shortcut (Join-Path $startDir "$name.lnk")

Write-Host ""
Write-Host "Done. Launch Eventra from the Desktop icon or Start Menu > Eventra > $name."
