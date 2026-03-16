param(
    [Parameter(Mandatory = $true)][int]$Port,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listeners) {
    Write-Host "Port $Port is already free."
    exit 0
}

$processIds = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($processId in $processIds) {
    try {
        $process = Get-Process -Id $processId -ErrorAction Stop
        Write-Host "Stopping PID $processId ($($process.ProcessName)) on port $Port"
        Stop-Process -Id $processId -Force:$Force.IsPresent
    } catch {
        Write-Host "Failed to stop PID ${processId}: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Start-Sleep -Milliseconds 500
$after = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($after) {
    Write-Host "Port $Port is still occupied." -ForegroundColor Red
    exit 1
}

Write-Host "Port $Port is now free." -ForegroundColor Green
exit 0
