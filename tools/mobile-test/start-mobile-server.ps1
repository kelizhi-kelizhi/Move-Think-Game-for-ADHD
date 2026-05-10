$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir "..\..")
$pidFile = Join-Path $scriptDir "mobile-server.pid"
$port = 8000

function Get-ListeningPid {
  $line = netstat -ano | Select-String "0.0.0.0:$port\s+0.0.0.0:0\s+LISTENING" | Select-Object -First 1
  if (-not $line) {
    $line = netstat -ano | Select-String "127.0.0.1:$port\s+.*LISTENING" | Select-Object -First 1
  }
  if (-not $line) { return $null }
  $parts = ($line.ToString().Trim() -split "\s+")
  return $parts[-1]
}

function Get-LocalIPv4 {
  $addresses = ipconfig | Select-String "IPv4" | ForEach-Object {
    ($_ -split ":\s*", 2)[1].Trim()
  }
  $addresses | Where-Object {
    $_ -and $_ -notlike "127.*" -and $_ -notlike "169.254.*" -and $_ -notlike "198.18.*"
  } | Select-Object -First 1
}

if (Test-Path $pidFile) {
  $oldPid = Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($oldPid -and (Get-Process -Id ([int]$oldPid) -ErrorAction SilentlyContinue)) {
    Write-Host "Server already appears to be running. PID: $oldPid"
    $ip = Get-LocalIPv4
    if ($ip) { Write-Host "Open on phone: http://$ip`:$port/index.html" }
    exit 0
  }
  Remove-Item $pidFile -Force
}

$listeningPid = Get-ListeningPid
if ($listeningPid) {
  Write-Host "Port $port is already listening. PID: $listeningPid"
  $listeningPid | Set-Content -Path $pidFile -Encoding ASCII
  $ip = Get-LocalIPv4
  if ($ip) { Write-Host "Open on phone: http://$ip`:$port/index.html" }
  exit 0
}

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
  Write-Error "Python was not found on PATH. Install Python or start another static file server manually."
}

$process = Start-Process `
  -FilePath $python.Source `
  -ArgumentList @("-m", "http.server", "$port", "--bind", "0.0.0.0") `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden `
  -PassThru

$process.Id | Set-Content -Path $pidFile -Encoding ASCII
Start-Sleep -Milliseconds 700

if ($process.HasExited) {
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  Write-Error "Server process exited immediately. Port $port may be blocked or unavailable."
}

$listeningPid = Get-ListeningPid
if (-not $listeningPid) {
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  Write-Error "Server started but port $port is not listening."
}

$ip = Get-LocalIPv4
Write-Host "Mobile test server started."
Write-Host "PID: $($process.Id)"
Write-Host "Project: $projectRoot"
if ($ip) {
  Write-Host "Open on phone: http://$ip`:$port/index.html"
} else {
  Write-Host "Could not detect LAN IP. Run ipconfig and use the WLAN IPv4 address with port $port."
}
Write-Host "If Windows Firewall asks, allow Python on private networks."
