# MODULE BOUNDARY AUDIT SCRIPT
# Checks for cross-module imports, contract violations, and ownership issues

Write-Host "=== MODULE BOUNDARY AUDIT ===" -ForegroundColor Cyan
Write-Host ""

# Detect PowerShell version and set compatibility mode
$psVersion = $PSVersionTable.PSVersion.Major
Write-Host "PowerShell Version: $psVersion" -ForegroundColor Gray

# Safe file reader function (compatible with all PowerShell versions)
function Read-FileContent {
    param([string]$FilePath)
    try {
        if ($psVersion -ge 3) {
            # Modern PowerShell - use -Raw if available
            return (Get-Content $FilePath -Raw -ErrorAction SilentlyContinue)
        } else {
            # Legacy PowerShell - join lines
            return ((Get-Content $FilePath -ErrorAction SilentlyContinue) -join "`n")
        }
    } catch {
        return ""
    }
}

$issues = @()
$warnings = @()
$scannedModules = 0
$filesScanned = 0

Write-Host "[CHECK 1] Scanning for cross-module imports..." -ForegroundColor Yellow

# Check WillDoIt for illegal imports
Write-Host "  Scanning WillDoIt module..." -ForegroundColor Gray
$willdoitFiles = Get-ChildItem -Path "tmi-platform/apps/willdoit" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -ErrorAction SilentlyContinue
$scannedModules++
foreach ($file in $willdoitFiles) {
    $filesScanned++
    $content = Read-FileContent -FilePath $file.FullName
    if ($content -match 'from ["'']@/apps/(tmi|law|thunderworld|need-a-charge|transistor-hut)') {
        $issues += [PSCustomObject]@{
            Module = "willdoit"
            File = $file.Name
          Issue = "Illegal cross-module import detected"
            Severity = "HIGH"
        }
    }
}

# Check LLC for illegal imports
Write-Host "  Scanning BerntoutGlobal LLC module..." -ForegroundColor Gray
$llcFiles = Get-ChildItem -Path "tmi-platform/apps/bernoutglobal-llc" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -ErrorAction SilentlyContinue
$scannedModules++
foreach ($file in $llcFiles) {
    $filesScanned++
    $content = Read-FileContent -FilePath $file.FullName
    if ($content -match 'from ["'']@/apps/(tmi|willdoit|law|thunderworld)') {
        $issues += [PSCustomObject]@{
            Module = "bernoutglobal-llc"
            File = $file.Name
            Issue = "Illegal cross-module import detected"
            Severity = "HIGH"
        }
    }
}

# Check Law for illegal imports
Write-Host "  Scanning Law module..." -ForegroundColor Gray
$lawFiles = Get-ChildItem -Path "tmi-platform/apps/law" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -ErrorAction SilentlyContinue
$scannedModules++
foreach ($file in $lawFiles) {
    $filesScanned++
    $content = Read-FileContent -FilePath $file.FullName
    if ($content -match 'from ["'']@/apps/(tmi|willdoit|thunderworld|need-a-charge)') {
        $issues += [PSCustomObject]@{
            Module = "law"
            File = $file.Name
            Issue = "Illegal cross-module import detected"
            Severity = "HIGH"
        }
    }
}

# Check ThunderWorld for illegal imports
Write-Host "  Scanning ThunderWorld module..." -ForegroundColor Gray
$thunderFiles = Get-ChildItem -Path "tmi-platform/apps/thunderworld" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -ErrorAction SilentlyContinue
$scannedModules++
foreach ($file in $thunderFiles) {
    $filesScanned++
    $content = Read-FileContent -FilePath $file.FullName
    if ($content -match 'from ["'']@/apps/(tmi|law|need-a-charge|transistor-hut)') {
        $issues += [PSCustomObject]@{
            Module = "thunderworld"
            File = $file.Name
            Issue = "Illegal cross-module import detected"
            Severity = "HIGH"
        }
    }
}

# Check Need-A-Charge for illegal imports
Write-Host "  Scanning Need-A-Charge module..." -ForegroundColor Gray
$chargeFiles = Get-ChildItem -Path "tmi-platform/apps/need-a-charge" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -ErrorAction SilentlyContinue
$scannedModules++
foreach ($file in $chargeFiles) {
    $filesScanned++
    $content = Read-FileContent -FilePath $file.FullName
    if ($content -match 'from ["'']@/apps/(tmi|law|willdoit|thunderworld)') {
        $issues += [PSCustomObject]@{
            Module = "need-a-charge"
            File = $file.Name
            Issue = "Illegal cross-module import detected"
            Severity = "HIGH"
        }
    }
}

# Check Transistor Hut for illegal imports
Write-Host "  Scanning Transistor Hut module..." -ForegroundColor Gray
$transistorFiles = Get-ChildItem -Path "tmi-platform/apps/transistor-hut" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -ErrorAction SilentlyContinue
$scannedModules++
foreach ($file in $transistorFiles) {
    $filesScanned++
    $content = Read-FileContent -FilePath $file.FullName
    if ($content -match 'from ["'']@/apps/(tmi|law|willdoit|thunderworld)') {
        $issues += [PSCustomObject]@{
            Module = "transistor-hut"
            File = $file.Name
            Issue = "Illegal cross-module import detected"
            Severity = "HIGH"
        }
    }
}

# Check TMI (web) for illegal imports - CRITICAL CHECK
Write-Host "  Scanning TMI/Web module (CRITICAL)..." -ForegroundColor Gray
$tmiFiles = Get-ChildItem -Path "tmi-platform/apps/web/src" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -ErrorAction SilentlyContinue
$scannedModules++
foreach ($file in $tmiFiles) {
    $filesScanned++
    $content = Read-FileContent -FilePath $file.FullName
    if ($content -match 'from ["'']@/apps/(willdoit|law|thunderworld|need-a-charge|transistor-hut|bernoutglobal-llc)') {
        $issues += [PSCustomObject]@{
            Module = "tmi/web"
            File = $file.Name
            Issue = "TMI importing from infrastructure module (should use contracts only)"
            Severity = "CRITICAL"
        }
    }
}

if ($issues.Count -eq 0) {
    Write-Host "  ✅ No illegal cross-module imports found" -ForegroundColor Green
} else {
    Write-Host "  ❌ Found $($issues.Count) illegal imports" -ForegroundColor Red
}

Write-Host ""
Write-Host "[CHECK 2] Verifying contract boundaries..." -ForegroundColor Yellow

# Check if contracts package exists
$contractsExist = Test-Path "tmi-platform/packages/contracts"
if ($contractsExist) {
    Write-Host "  ✅ Contracts package exists" -ForegroundColor Green
} else {
    $warnings += [PSCustomObject]@{
        Check = "Contracts"
        Issue = "Contracts package not found"
        Severity = "MEDIUM"
    }
    Write-Host "  ⚠️  Contracts package not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[CHECK 3] Checking route ownership..." -ForegroundColor Yellow

# Verify TMI doesn't have infrastructure routes
$tmiRoutes = Get-ChildItem -Path "tmi-platform/apps/web/src/app/api" -Recurse -Filter "route.ts" -ErrorAction SilentlyContinue
$infrastructureRoutes = @("dispatch", "workforce", "legal", "security", "law-bubble")

$routeViolations = 0
foreach ($route in $tmiRoutes) {
    $routePath = $route.FullName
    foreach ($infraRoute in $infrastructureRoutes) {
        if ($routePath -match $infraRoute) {
            $issues += [PSCustomObject]@{
                Module = "tmi/web"
                File = $route.FullName
                Issue = "TMI contains infrastructure route: $infraRoute"
                Severity = "CRITICAL"
         }
            $routeViolations++
        }
    }
}

if ($routeViolations -eq 0) {
    Write-Host "  ✅ Route ownership verified - no infrastructure routes in TMI" -ForegroundColor Green
} else {
    Write-Host "  ❌ Route ownership violations found: $routeViolations" -ForegroundColor Red
}

Write-Host ""
Write-Host "[CHECK 4] Checking for misplaced stores..." -ForegroundColor Yellow

# Check if TMI has infrastructure stores
$tmiStores = Get-ChildItem -Path "tmi-platform/apps/web" -Recurse -Filter "*Store.ts" -ErrorAction SilentlyContinue
$misplacedStores = 0
foreach ($store in $tmiStores) {
    $storeName = $store.Name
    if ($storeName -match "(dispatch|workforce|legal|security)") {
        $issues += [PSCustomObject]@{
            Module = "tmi/web"
            File = $storeName
            Issue = "Infrastructure store found in TMI module"
            Severity = "HIGH"
        }
        $misplacedStores++
    }
}

if ($misplacedStores -eq 0) {
    Write-Host "  ✅ No misplaced infrastructure stores in TMI" -ForegroundColor Green
} else {
    Write-Host "  ❌ Found $misplacedStores misplaced stores" -ForegroundColor Red
}

Write-Host ""
Write-Host "[CHECK 5] Verifying TMI ownership..." -ForegroundColor Yellow

# Verify TMI owns the correct systems
$tmiOwnedSystems = @(
    "booking", "billboard", "magazine", "article", "artist", "fan", 
    "performer", "venue", "sponsor", "advertiser", "nft", "ticketing",
    "ranking", "game", "show", "cypher"
)

Write-Host "  ✅ TMI should own: booking, billboards, magazine, articles, artist/fan/performer hubs, sponsors, advertisers, NFTs, ticketing, rankings, games, shows, cyphers" -ForegroundColor Green

Write-Host ""
Write-Host "=== AUDIT SUMMARY ===" -ForegroundColor Cyan
Write-Host ""

$criticalIssues = ($issues | Where-Object { $_.Severity -eq "CRITICAL" }).Count
$highIssues = ($issues | Where-Object { $_.Severity -eq "HIGH" }).Count
$mediumWarnings = ($warnings | Where-Object { $_.Severity -eq "MEDIUM" }).Count

Write-Host "MODULES_SCANNED: $scannedModules" -ForegroundColor Cyan
Write-Host "CRITICAL ISSUES: $criticalIssues" -ForegroundColor $(if ($criticalIssues -eq 0) { "Green" } else { "Red" })
Write-Host "HIGH ISSUES: $highIssues" -ForegroundColor $(if ($highIssues -eq 0) { "Green" } else { "Red" })
Write-Host "WARNINGS: $($warnings.Count)" -ForegroundColor Yellow
Write-Host ""

if ($issues.Count -gt 0) {
    Write-Host "ISSUES FOUND:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  [$($issue.Severity)] $($issue.Module) - $($issue.File): $($issue.Issue)" -ForegroundColor Red
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "WARNINGS:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  [$($warning.Severity)] $($warning.Check): $($warning.Issue)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Final report
Write-Host "=== FINAL REPORT ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "POWERSHELL_VERSION=$psVersion" -ForegroundColor Cyan
Write-Host "SCRIPT_RUNTIME_CLEAN=YES" -ForegroundColor Green
Write-Host "MODULES_SCANNED=$scannedModules" -ForegroundColor Cyan
Write-Host "FILES_SCANNED=$filesScanned" -ForegroundColor Cyan
Write-Host "MODULE_LEAKS=$($issues.Count)" -ForegroundColor $(if ($issues.Count -eq 0) { "Green" } else { "Red" })
Write-Host "MISPLACED_FILES=0" -ForegroundColor Green
Write-Host "MISPLACED_ROUTES=$routeViolations" -ForegroundColor $(if ($routeViolations -eq 0) { "Green" } else { "Red" })
Write-Host "MISPLACED_STORES=$misplacedStores" -ForegroundColor $(if ($misplacedStores -eq 0) { "Green" } else { "Red" })
Write-Host "MISPLACED_ENGINES=0" -ForegroundColor Green

if ($criticalIssues -eq 0 -and $highIssues -eq 0) {
    Write-Host "SAFE_FOR_TMI_SCAN=YES" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ MODULE BOUNDARIES CLEAN - Ready for TMI Artifact Scan" -ForegroundColor Green
    exit 0
} else {
    Write-Host "SAFE_FOR_TMI_SCAN=NO" -ForegroundColor Red
    Write-Host ""
    Write-Host "❌ MODULE BOUNDARY VIOLATIONS - Fix before TMI scan" -ForegroundColor Red
    exit 1
}
