param(
    [string]$ApiBase = "http://localhost:4000/api",
    [string]$WebBase = "http://localhost:3001",
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [string]$SmokeSpec = "tests/e2e/phase13_5.spec.ts"
)

$ErrorActionPreference = "Stop"

function Probe {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Url
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        Write-Host "[$Name] STATUS=$($response.StatusCode)"
        $body = ($response.Content | Out-String).Trim()
        if ($body) {
            Write-Host "[$Name] BODY=$body"
        }
        return ($response.StatusCode -eq 200)
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { -1 }
        $detail = if ($_.ErrorDetails.Message) { $_.ErrorDetails.Message } else { $_.Exception.Message }
        Write-Host "[$Name] STATUS=$status" -ForegroundColor Red
        Write-Host "[$Name] BODY=$detail" -ForegroundColor Red
        return $false
    }
}

& (Join-Path $PSScriptRoot "prove-runtime.ps1") -ApiBase $ApiBase -WebBase $WebBase -WorkspaceRoot $WorkspaceRoot
if ($LASTEXITCODE -ne 0) {
    Write-Host "Runtime proof failed; contest proof stopped." -ForegroundColor Red
    exit $LASTEXITCODE
}

$contestPageOk = Probe -Name "contest-page" -Url "$WebBase/contest"
$contestApiOk = Probe -Name "contest-seasons" -Url "$ApiBase/contest/seasons"

if (-not $contestPageOk -or -not $contestApiOk) {
    Write-Host "Contest route proof failed." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $WorkspaceRoot $SmokeSpec))) {
    Write-Host "Smoke spec not found: $SmokeSpec" -ForegroundColor Red
    exit 1
}

Set-Location $WorkspaceRoot
$env:E2E_BASE_URL = $WebBase
pnpm exec playwright test $SmokeSpec --workers=1 --reporter=line
exit $LASTEXITCODE
