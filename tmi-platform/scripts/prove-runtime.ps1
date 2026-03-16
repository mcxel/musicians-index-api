param(
    [string]$ApiBase = "http://localhost:4000/api",
    [string]$WebBase = "http://localhost:3001",
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = "Stop"

function Get-EnvValue {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string]$Key
    )

    if (-not (Test-Path $FilePath)) {
        return $null
    }

    foreach ($line in Get-Content -Path $FilePath) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith("#")) {
            continue
        }
        if ($trimmed -match "^$([regex]::Escape($Key))\s*=\s*(.*)$") {
            $value = $matches[1].Trim()
            if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            return $value
        }
    }

    return $null
}

function Probe {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Url
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        $body = ($response.Content | Out-String).Trim()
        Write-Host "[$Name] STATUS=$($response.StatusCode)"
        if ($body) {
            Write-Host "[$Name] BODY=$body"
        }
        return @{ Ok = ($response.StatusCode -eq 200); Status = $response.StatusCode; Body = $body }
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { -1 }
        $detail = if ($_.ErrorDetails.Message) { $_.ErrorDetails.Message } else { $_.Exception.Message }
        Write-Host "[$Name] STATUS=$status" -ForegroundColor Red
        Write-Host "[$Name] BODY=$detail" -ForegroundColor Red
        return @{ Ok = $false; Status = $status; Body = $detail }
    }
}

& (Join-Path $PSScriptRoot "check-env-sync.ps1") -WorkspaceRoot $WorkspaceRoot
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

$databaseUrl = Get-EnvValue -FilePath (Join-Path $WorkspaceRoot ".env") -Key "DATABASE_URL"
if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "DATABASE_URL not found in root .env" -ForegroundColor Red
    exit 1
}

$dbUri = [System.Uri]$databaseUrl
$dbHost = $dbUri.Host
$dbPort = if ($dbUri.Port -gt 0) { $dbUri.Port } else { 5432 }

$dbCheck = Test-NetConnection -ComputerName $dbHost -Port $dbPort -WarningAction SilentlyContinue
if (-not $dbCheck.TcpTestSucceeded) {
    Write-Host "DB not reachable at ${dbHost}:$dbPort" -ForegroundColor Red
    exit 1
}
Write-Host "DB reachable at ${dbHost}:$dbPort" -ForegroundColor Green

Set-Location $WorkspaceRoot
pnpm -C packages/db exec prisma migrate status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma migrate status failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

$health = Probe -Name "healthz" -Url "$ApiBase/healthz"
$ready = Probe -Name "readyz" -Url "$ApiBase/readyz"
$web = Probe -Name "web" -Url $WebBase

if (-not $health.Ok) {
    Write-Host "healthz is not 200." -ForegroundColor Red
    exit 1
}
if (-not $ready.Ok) {
    Write-Host "readyz is not 200." -ForegroundColor Red
    exit 1
}
if (-not $web.Ok) {
    Write-Host "web is not 200." -ForegroundColor Red
    exit 1
}

Write-Host "Runtime proof passed." -ForegroundColor Green
exit 0
