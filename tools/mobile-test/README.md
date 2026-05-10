# Mobile Test Server

Use these scripts when testing the local HTML game from a phone on the same WiFi.

## Start

Double-click:

```bat
start-mobile-server.bat
```

Or run from PowerShell:

```powershell
.\tools\mobile-test\start-mobile-server.ps1
```

The script starts:

```powershell
python -m http.server 8000 --bind 0.0.0.0
```

It prints the phone URL, usually:

```text
http://<computer-lan-ip>:8000/index.html
```

If Windows Firewall asks, allow Python on private networks.

If port `8000` is already listening, the start script reuses that server and records its PID.

## Stop

Double-click:

```bat
stop-mobile-server.bat
```

Or run:

```powershell
.\tools\mobile-test\stop-mobile-server.ps1
```

The start script records the server PID in `mobile-server.pid`; the stop script uses that file and then removes it.
