# Generates assets/eventra.ico for the Windows shortcuts (brand indigo calendar mark).
# Reproducible: run `pwsh scripts/windows/make-icon.ps1` (or Windows PowerShell).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root    = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$outDir  = Join-Path $root 'assets'
$icoPath = Join-Path $outDir 'eventra.ico'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$size = 256
$bmp  = New-Object System.Drawing.Bitmap $size, $size
$g    = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)

function New-RoundedPath([int]$x,[int]$y,[int]$w,[int]$h,[int]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

$indigo  = [System.Drawing.ColorTranslator]::FromHtml('#4f46e5')
$indigoD = [System.Drawing.ColorTranslator]::FromHtml('#4338ca')
$white   = [System.Drawing.Color]::White
$band    = [System.Drawing.ColorTranslator]::FromHtml('#c7d2fe')

# App tile
$tile = New-RoundedPath 8 8 240 240 56
$g.FillPath((New-Object System.Drawing.SolidBrush $indigo), $tile)

# Calendar body
$body = New-RoundedPath 56 64 144 136 20
$g.FillPath((New-Object System.Drawing.SolidBrush $white), $body)
# Header band
$hdr = New-RoundedPath 56 64 144 40 20
$g.FillPath((New-Object System.Drawing.SolidBrush $band), $hdr)
# Rings
$penR = New-Object System.Drawing.Pen $indigoD, 8
$g.DrawLine($penR, 92, 44, 92, 76)
$g.DrawLine($penR, 164, 44, 164, 76)
# Center check circle
$g.FillEllipse((New-Object System.Drawing.SolidBrush $indigo), 100, 118, 56, 56)
$penC = New-Object System.Drawing.Pen $white, 10
$penC.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$penC.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLines($penC, @(
  (New-Object System.Drawing.Point 114,146),
  (New-Object System.Drawing.Point 124,156),
  (New-Object System.Drawing.Point 142,134)
))
$g.Dispose()

# Save as .ico (icon from the bitmap handle)
$hIcon = $bmp.GetHicon()
$icon  = [System.Drawing.Icon]::FromHandle($hIcon)
$fs    = [System.IO.File]::Create($icoPath)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$bmp.Dispose()

Write-Output "Wrote $icoPath"
