$max = 20
$i = 0
$up = $false
do {
    Start-Sleep -Seconds 2
    $i++
    try {
        $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/healthz' -UseBasicParsing -TimeoutSec 3
        Write-Host "SERVER_UP: $($r.StatusCode)"
        $up = $true
        break
    } catch {
        Write-Host "Attempt $i/$max - waiting..."
    }
} while ($i -lt $max)

if (-not $up) {
    Write-Host "SERVER_TIMEOUT after $max attempts"
    exit 1
}
exit 0
