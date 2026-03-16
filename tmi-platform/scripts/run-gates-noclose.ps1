$ErrorActionPreference = "Continue"
$ProgressPreference    = "SilentlyContinue"

$Repo = "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
$Logs = Join-Path $Repo "_logs"
New-Item -ItemType Directory -Force -Path $Logs | Out-Null

function Run-Step([string]$Name, [scriptblock]$Cmd, [string]$LogFile) {
    Write-Host "`n=== $Name ==="

    try {
        # Tee to file AND send to host so function does NOT return pipeline objects
        & $Cmd *>&1 | Tee-Object -FilePath $LogFile | Out-Host
    }
    catch {
        $_ | Out-String | Tee-Object -FilePath $LogFile -Append | Out-Host
    }

    # Force a clean integer exit code
    [int]$code = 0
    if ($LASTEXITCODE -as [int]) {
        $code = [int]$LASTEXITCODE
    }

    Write-Host "$Name`_EXIT:$code"
    return $code
}

Set-Location $Repo
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"

$logInstall = Join-Path $Logs "pnpm-workspace-install-$stamp.log"
$logPromo   = Join-Path $Logs "promo-bridge-typecheck-$stamp.log"
$logGates   = Join-Path $Logs "gates-full-$stamp.log"

# ================= INSTALL =================
$installExit = Run-Step "PNPM_INSTALL" { pnpm -w install } $logInstall
Write-Host "INSTALL_LOG:$logInstall"

if ($installExit -ne 0) {
    Write-Host "Stopping after install failure (window will stay open)."
    Read-Host "Press Enter to close"
    exit $installExit
}

# ================= PROMO TYPECHECK =================
$promoExit = Run-Step "PROMO_TSC" { pnpm -C packages/promo-bridge exec tsc --noEmit } $logPromo
Write-Host "PROMO_LOG:$logPromo"

if ($promoExit -ne 0) {
    Write-Host "Stopping after promo-bridge typecheck failure (window will stay open)."
    Read-Host "Press Enter to close"
    exit $promoExit
}

# ================= FULL GATES =================
$gatesExit = Run-Step "GATES" { pnpm run gates } $logGates
Write-Host "GATES_LOG:$logGates"

Read-Host "All done. Press Enter to close"
exit $gatesExit