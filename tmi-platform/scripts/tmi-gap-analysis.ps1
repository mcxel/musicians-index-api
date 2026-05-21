# TMI GAP ANALYSIS
# Compares artifact truth against current implementation
# PowerShell 5 Compatible - ASCII Only

Write-Host "=== TMI GAP ANALYSIS ===" -ForegroundColor Cyan
Write-Host ""

# Initialize counters
$totalArtifacts = 0
$implemented = 0
$missing = 0
$partial = 0
$missingRoutes = 0
$missingComponents = 0
$missingEngines = 0

# Initialize collections
$gapReport = @()
$routeGapReport = @()
$engineGapReport = @()
$uiGapReport = @()
$buildPriority = @{
    P0 = @()
    P1 = @()
    P2 = @()
}

Write-Host "[PHASE 1] Loading artifact truth..." -ForegroundColor Yellow
Write-Host ""

# Load artifact inventories
$auditPath = "tmi-platform/audits/tmi"

if (-not (Test-Path $auditPath)) {
    Write-Host "[ERROR] Audit path not found: $auditPath" -ForegroundColor Red
    exit 1
}

$artifactInventoryPath = "$auditPath/tmi-artifact-inventory.json"
$routeMapPath = "$auditPath/tmi-route-map.json"
$homepageMapPath = "$auditPath/tmi-homepage-map.json"
$componentMapPath = "$auditPath/tmi-component-map.json"
$engineMapPath = "$auditPath/tmi-engine-map.json"

# Read JSON files
$artifactInventory = @()
$routeMap = @{}
$homepageMap = @{}
$componentMap = @{}
$engineMap = @{}

if (Test-Path $artifactInventoryPath) {
    $artifactInventory = Get-Content $artifactInventoryPath -Raw | ConvertFrom-Json
    $totalArtifacts = $artifactInventory.Count
    Write-Host "  [OK] Loaded artifact inventory: $totalArtifacts artifacts" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Artifact inventory not found" -ForegroundColor Red
    exit 1
}

if (Test-Path $routeMapPath) {
    $routeMap = Get-Content $routeMapPath -Raw | ConvertFrom-Json
    Write-Host "  [OK] Loaded route map: $($routeMap.PSObject.Properties.Count) categories" -ForegroundColor Green
}

if (Test-Path $homepageMapPath) {
    $homepageMap = Get-Content $homepageMapPath -Raw | ConvertFrom-Json
    Write-Host "  [OK] Loaded homepage map: $($homepageMap.PSObject.Properties.Count) variants" -ForegroundColor Green
}

if (Test-Path $componentMapPath) {
    $componentMap = Get-Content $componentMapPath -Raw | ConvertFrom-Json
    Write-Host "  [OK] Loaded component map: $($componentMap.PSObject.Properties.Count) types" -ForegroundColor Green
}

if (Test-Path $engineMapPath) {
    $engineMap = Get-Content $engineMapPath -Raw | ConvertFrom-Json
    Write-Host "  [OK] Loaded engine map: $($engineMap.PSObject.Properties.Count) engines" -ForegroundColor Green
}

Write-Host ""
Write-Host "[PHASE 2] Scanning current implementation..." -ForegroundColor Yellow
Write-Host ""

# Scan current implementation
$webAppPath = "tmi-platform/apps/web/src"
$implementedRoutes = @()
$implementedComponents = @()
$implementedEngines = @()

if (Test-Path "$webAppPath/app") {
    $routeFiles = Get-ChildItem -Path "$webAppPath/app" -Recurse -Filter "page.tsx" -ErrorAction SilentlyContinue
    foreach ($file in $routeFiles) {
        $routePath = $file.DirectoryName -replace [regex]::Escape("$webAppPath/app"), ""
        $routePath = $routePath -replace "\\", "/"
        $implementedRoutes += $routePath
    }
    Write-Host "  [OK] Found $($implementedRoutes.Count) implemented routes" -ForegroundColor Green
}

if (Test-Path "$webAppPath/components") {
    $componentFiles = Get-ChildItem -Path "$webAppPath/components" -Recurse -Include "*.tsx","*.ts" -ErrorAction SilentlyContinue
    foreach ($file in $componentFiles) {
        $componentName = $file.BaseName
        $implementedComponents += $componentName
    }
    Write-Host "  [OK] Found $($implementedComponents.Count) implemented components" -ForegroundColor Green
}

if (Test-Path "$webAppPath/engines") {
    $engineFiles = Get-ChildItem -Path "$webAppPath/engines" -Recurse -Include "*.ts" -ErrorAction SilentlyContinue
    foreach ($file in $engineFiles) {
        $engineName = $file.BaseName
        $implementedEngines += $engineName
    }
    Write-Host "  [OK] Found $($implementedEngines.Count) implemented engines" -ForegroundColor Green
}

Write-Host ""
Write-Host "[PHASE 3] Analyzing homepage gaps..." -ForegroundColor Yellow
Write-Host ""

# Check homepage variants
$requiredHomepages = @("HOMEPAGE_1", "HOMEPAGE_1-2", "HOMEPAGE_2", "HOMEPAGE_3", "HOMEPAGE_4", "HOMEPAGE_4-5", "HOMEPAGE_5", "HOMEPAGE_FINAL")
$missingHomepages = @()

foreach ($homepage in $requiredHomepages) {
    $homepageRoute = "/home" + ($homepage -replace "HOMEPAGE_", "" -replace "-", "-")
    $found = $false
    
    foreach ($route in $implementedRoutes) {
        if ($route -match "home") {
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        $missingHomepages += $homepage
        $routeGapReport += [PSCustomObject]@{
            type = "HOMEPAGE"
            name = $homepage
            status = "MISSING"
            priority = "P0"
            route = $homepageRoute
        }
        $buildPriority.P0 += "Homepage: $homepage"
        $missingRoutes++
    }
}

Write-Host "  [ANALYSIS] Missing homepages: $($missingHomepages.Count)" -ForegroundColor $(if ($missingHomepages.Count -eq 0) { "Green" } else { "Yellow" })

Write-Host ""
Write-Host "[PHASE 4] Analyzing route gaps..." -ForegroundColor Yellow
Write-Host ""

# Check major routes
$requiredRoutes = @{
    "booking" = "P0"
    "billboards" = "P0"
    "ticketing" = "P0"
    "nft" = "P1"
    "ranking" = "P0"
    "xp" = "P1"
    "achievements" = "P1"
    "rewards" = "P1"
    "sponsors" = "P0"
    "advertisers" = "P0"
    "games" = "P0"
    "shows" = "P0"
    "cypher" = "P0"
    "articles" = "P0"
    "magazine" = "P0"
    "artists" = "P0"
    "fans" = "P0"
    "performers" = "P0"
    "venues" = "P0"
    "hosts" = "P1"
    "audio" = "P1"
    "video" = "P1"
    "beats" = "P1"
    "production" = "P2"
}

foreach ($route in $requiredRoutes.Keys) {
    $found = $false
    $priority = $requiredRoutes[$route]
    
    foreach ($implRoute in $implementedRoutes) {
        if ($implRoute -match $route) {
            $found = $true
            $implemented++
            break
        }
    }
    
    if (-not $found) {
        $routeGapReport += [PSCustomObject]@{
            type = "ROUTE"
            name = $route
            status = "MISSING"
            priority = $priority
            route = "/$route"
        }
        
        switch ($priority) {
            "P0" { $buildPriority.P0 += "Route: /$route" }
            "P1" { $buildPriority.P1 += "Route: /$route" }
            "P2" { $buildPriority.P2 += "Route: /$route" }
        }
        
        $missingRoutes++
        $missing++
    }
}

Write-Host "  [ANALYSIS] Missing routes: $missingRoutes" -ForegroundColor $(if ($missingRoutes -eq 0) { "Green" } else { "Yellow" })

Write-Host ""
Write-Host "[PHASE 5] Analyzing component gaps..." -ForegroundColor Yellow
Write-Host ""

# Check UI components
$requiredComponents = @{
    "Card" = "P0"
    "Canvas" = "P0"
    "Widget" = "P1"
    "HUD" = "P0"
    "Frame" = "P1"
    "Layout" = "P0"
    "Overlay" = "P1"
    "Navigation" = "P0"
    "Control" = "P0"
    "Button" = "P0"
    "Chevron" = "P1"
    "Slider" = "P1"
}

foreach ($component in $requiredComponents.Keys) {
    $found = $false
    $priority = $requiredComponents[$component]
    
    foreach ($implComp in $implementedComponents) {
        if ($implComp -match $component) {
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        $uiGapReport += [PSCustomObject]@{
            type = "COMPONENT"
            name = $component
            status = "MISSING"
          priority = $priority
        }
        
        switch ($priority) {
            "P0" { $buildPriority.P0 += "Component: $component" }
            "P1" { $buildPriority.P1 += "Component: $component" }
            "P2" { $buildPriority.P2 += "Component: $component" }
        }
        
        $missingComponents++
    }
}

Write-Host "  [ANALYSIS] Missing components: $missingComponents" -ForegroundColor $(if ($missingComponents -eq 0) { "Green" } else { "Yellow" })

Write-Host ""
Write-Host "[PHASE 6] Analyzing engine gaps..." -ForegroundColor Yellow
Write-Host ""

# Check engines
$requiredEngines = @{
    "booking" = "P0"
    "ticketing" = "P0"
    "nft" = "P1"
    "ranking" = "P0"
    "xp" = "P1"
    "achievement" = "P1"
    "reward" = "P1"
    "feed" = "P0"
    "production" = "P2"
    "cypher" = "P0"
    "game" = "P0"
}

foreach ($engine in $requiredEngines.Keys) {
    $found = $false
    $priority = $requiredEngines[$engine]
    
    foreach ($implEngine in $implementedEngines) {
        if ($implEngine -match $engine) {
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        $engineGapReport += [PSCustomObject]@{
            type = "ENGINE"
            name = $engine
            status = "MISSING"
            priority = $priority
      }
        
        switch ($priority) {
            "P0" { $buildPriority.P0 += "Engine: $engine" }
            "P1" { $buildPriority.P1 += "Engine: $engine" }
            "P2" { $buildPriority.P2 += "Engine: $engine" }
        }
        
        $missingEngines++
    }
}

Write-Host "  [ANALYSIS] Missing engines: $missingEngines" -ForegroundColor $(if ($missingEngines -eq 0) { "Green" } else { "Yellow" })

Write-Host ""
Write-Host "[PHASE 7] Generating gap reports..." -ForegroundColor Yellow
Write-Host ""

# Combine all gaps
$gapReport = $routeGapReport + $uiGapReport + $engineGapReport

# Save reports
$outputDir = "tmi-platform/audits/tmi"

$gapReport | ConvertTo-Json -Depth 10 | Out-File "$outputDir/tmi-gap-report.json" -Encoding UTF8
$buildPriority | ConvertTo-Json -Depth 10 | Out-File "$outputDir/tmi-build-priority.json" -Encoding UTF8
$routeGapReport | ConvertTo-Json -Depth 10 | Out-File "$outputDir/tmi-route-gap-report.json" -Encoding UTF8
$engineGapReport | ConvertTo-Json -Depth 10 | Out-File "$outputDir/tmi-engine-gap-report.json" -Encoding UTF8
$uiGapReport | ConvertTo-Json -Depth 10 | Out-File "$outputDir/tmi-ui-gap-report.json" -Encoding UTF8

Write-Host "  [OK] Saved: tmi-gap-report.json" -ForegroundColor Green
Write-Host "  [OK] Saved: tmi-build-priority.json" -ForegroundColor Green
Write-Host "  [OK] Saved: tmi-route-gap-report.json" -ForegroundColor Green
Write-Host "  [OK] Saved: tmi-engine-gap-report.json" -ForegroundColor Green
Write-Host "  [OK] Saved: tmi-ui-gap-report.json" -ForegroundColor Green

Write-Host ""
Write-Host "=== GAP ANALYSIS COMPLETE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "TOTAL_ARTIFACTS=$totalArtifacts" -ForegroundColor Cyan
Write-Host "IMPLEMENTED=$implemented" -ForegroundColor Cyan
Write-Host "MISSING=$missing" -ForegroundColor Cyan
Write-Host "PARTIAL=$partial" -ForegroundColor Cyan
Write-Host "MISSING_ROUTES=$missingRoutes" -ForegroundColor Yellow
Write-Host "MISSING_COMPONENTS=$missingComponents" -ForegroundColor Yellow
Write-Host "MISSING_ENGINES=$missingEngines" -ForegroundColor Yellow
Write-Host "BUILD_PRIORITY_P0=$($buildPriority.P0.Count)" -ForegroundColor Red
Write-Host "BUILD_PRIORITY_P1=$($buildPriority.P1.Count)" -ForegroundColor Yellow
Write-Host "BUILD_PRIORITY_P2=$($buildPriority.P2.Count)" -ForegroundColor Cyan
Write-Host "SAFE_FOR_IMPLEMENTATION=$(if ($buildPriority.P0.Count -eq 0) { 'YES' } else { 'NO' })" -ForegroundColor $(if ($buildPriority.P0.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "[SUCCESS] Gap analysis complete" -ForegroundColor Green
Write-Host "[OUTPUT] $outputDir" -ForegroundColor Cyan
Write-Host ""

# Display P0 priorities
if ($buildPriority.P0.Count -gt 0) {
    Write-Host "[P0 PRIORITIES] Critical missing items:" -ForegroundColor Red
    foreach ($item in $buildPriority.P0) {
        Write-Host "  - $item" -ForegroundColor Red
    }
    Write-Host ""
}

exit 0
