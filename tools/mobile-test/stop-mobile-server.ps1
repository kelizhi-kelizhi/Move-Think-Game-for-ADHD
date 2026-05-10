$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $scriptDir "mobile-server.pid"

if (-not (Test-Path $pidFile)) {
  Write-Host "No PID file found. The mobile test server may already be stopped."
  exit 0
}

$pidText = Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $pidText) {
  Remove-Item $pidFile -Force
  Write-Host "Removed empty PID file."
  exit 0
}

$process = Get-Process -Id ([int]$pidText) -ErrorAction SilentlyContinue
if ($process) {
  Stop-Process -Id $process.Id
  Write-Host "Stopped mobile test server. PID: $($process.Id)"
} else {
  Write-Host "PID $pidText is not running."
}

Remove-Item $pidFile -Force
