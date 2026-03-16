# Run gates and capture output
$ErrorActionPreference = "Continue"
New-Item -ItemType Directory -Force ".\tmi-platform\_logs" | Out-Null
& ".\tmi-platform\scripts\gates.ps1" *>&1 | Tee-Object -FilePath ".\tmi-platform\_logs\gates-latest.txt"
