# Eventra - remove the Windows Desktop + Start Menu shortcuts. Leaves the app itself
# untouched (this only deletes the .lnk files it created).
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/windows/uninstall-shortcuts.ps1
$ErrorActionPreference = 'Stop'
$name = 'Eventra Business'

$desktop  = [Environment]::GetFolderPath('Desktop')
$programs  = [Environment]::GetFolderPath('Programs')
$startDir  = Join-Path $programs 'Eventra'

$targets = @(
  (Join-Path $desktop "$name.lnk"),
  (Join-Path $startDir "$name.lnk")
)
foreach ($t in $targets) {
  if (Test-Path $t) { Remove-Item $t -Force; Write-Host "  removed: $t" }
}
# Remove the Start Menu folder if now empty.
if ((Test-Path $startDir) -and -not (Get-ChildItem $startDir -Force)) {
  Remove-Item $startDir -Force
  Write-Host "  removed folder: $startDir"
}
Write-Host "Done. Eventra shortcuts removed (the app is unchanged)."
