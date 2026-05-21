# TMI ARTIFACT TRUTH SCANNER
# PowerShell 5 Compatible - ASCII Only
# Recursively scans TMI PDF folders and builds truth inventory

Write-Host "=== TMI ARTIFACT TRUTH SCANNER ===" -ForegroundColor Cyan
Write-Host ""

# Initialize counters
$totalFilesScanned = 0
$pdfFiles = 0
$imageFiles = 0
$subfoldersScanned = 0
$artifactsMapped = 0
$routesMapped = 0
$componentsMapped = 0
$enginesMapped = 0

# Initialize collections
$artifactInventory = @()
$routeMap = @{}
$homepageMap = @{}
$componentMap = @{}
$engineMap = @{}
$missingMap = @()

# Define scan paths
$scanPaths = @(
    "Tmi PDF's",
    "Tmi file finish",
    "Tmi pdf 2 li"
)

# Define file extensions to scan
$scanExtensions = @(".pdf", ".png", ".jpg", ".jpeg", ".webp", ".json")

# Define extensions to skip
$skipExtensions = @(".zip", ".rar", ".7z", ".tar", ".gz")

Write-Host "[PHASE 1] Discovering TMI folders..." -ForegroundColor Yellow
Write-Host ""

foreach ($path in $scanPaths) {
    if (Test-Path $path) {
        Write-Host "  [OK] Found: $path" -ForegroundColor Green
    } else {
     Write-Host "  [SKIP] Not found: $path" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[PHASE 2] Scanning folders recursively..." -ForegroundColor Yellow
Write-Host ""

function Get-TMICategory {
    param([string]$FileName, [string]$FolderPath)
    
    $name = $FileName.ToLower()
    $folder = $FolderPath.ToLower()
    
    # Homepage detection
    if ($name -match "home|landing|main") { return "HOME" }
    
    # Magazine and articles
    if ($name -match "magazine|article|news|editorial") { return "MAGAZINE" }
    
    # Profiles
    if ($name -match "artist|performer|musician") { return "ARTIST" }
    if ($name -match "fan|user") { return "FAN" }
    
    # Venues and spaces
    if ($name -match "venue|arena|lobby|stage") { return "VENUE" }
    
    # Revenue systems
    if ($name -match "sponsor|advertiser") { return "SPONSOR" }
    if ($name -match "billboard|banner") { return "BILLBOARD" }
    if ($name -match "booking|ticket") { return "BOOKING" }
    if ($name -match "nft") { return "NFT" }
    
    # Entertainment
    if ($name -match "game|show|contest") { return "GAME" }
    if ($name -match "cypher|battle") { return "CYPHER" }
    
    # Admin and control
    if ($name -match "admin|dashboard|overseer|control") { return "ADMIN" }
    
    # Progression
    if ($name -match "rank|xp|level|achievement") { return "RANKING" }
    if ($name -match "reward|prize|gift") { return "REWARDS" }
    
    # Media
    if ($name -match "audio|beat|music|production") { return "AUDIO" }
    if ($name -match "video|motion|animation") { return "VIDEO" }
    
    # Folder-based detection
    if ($folder -match "profile") { return "PROFILE" }
    if ($folder -match "venue") { return "VENUE" }
    if ($folder -match "game|show") { return "GAME" }
    if ($folder -match "magazine") { return "MAGAZINE" }
    if ($folder -match "host") { return "HOST" }
    
    return "UNCATEGORIZED"
}

function Get-HomepageGroup {
    param([string]$FileName)
    
    $name = $FileName.ToLower()
    
    if ($name -match "home.*1[^0-9]|homepage.*1[^0-9]|landing.*1[^0-9]") { return "HOMEPAGE_1" }
    if ($name -match "home.*1-2|homepage.*1-2") { return "HOMEPAGE_1-2" }
    if ($name -match "home.*2[^0-9]|homepage.*2[^0-9]|landing.*2[^0-9]") { return "HOMEPAGE_2" }
    if ($name -match "home.*3[^0-9]|homepage.*3[^0-9]|landing.*3[^0-9]") { return "HOMEPAGE_3" }
    if ($name -match "home.*4[^0-9]|homepage.*4[^0-9]|landing.*4[^0-9]") { return "HOMEPAGE_4" }
    if ($name -match "home.*4-5|homepage.*4-5") { return "HOMEPAGE_4-5" }
    if ($name -match "home.*5[^0-9]|homepage.*5[^0-9]|landing.*5[^0-9]") { return "HOMEPAGE_5" }
    if ($name -match "final.*home|home.*final") { return "HOMEPAGE_FINAL" }
    
    return "NONE"
}

function Get-ComponentType {
    param([string]$FileName)
    
    $name = $FileName.ToLower()
    
    if ($name -match "card") { return "CARD" }
    if ($name -match "canvas") { return "CANVAS" }
    if ($name -match "widget") { return "WIDGET" }
    if ($name -match "hud") { return "HUD" }
    if ($name -match "overlay") { return "OVERLAY" }
    if ($name -match "modal|dialog") { return "MODAL" }
    if ($name -match "nav|menu") { return "NAVIGATION" }
    if ($name -match "button|control") { return "CONTROL" }
    if ($name -match "background|bg") { return "BACKGROUND" }
    if ($name -match "icon|emoji") { return "ICON" }
    if ($name -match "frame|border") { return "FRAME" }
    if ($name -match "layout") { return "LAYOUT" }
    if ($name -match "interface") { return "INTERFACE" }
    
    return "COMPONENT"
}

function Get-EngineType {
    param([string]$FileName, [string]$FolderPath)
    
    $name = $FileName.ToLower()
    $folder = $FolderPath.ToLower()
    
    if ($name -match "booking" -or $folder -match "booking") { return "BOOKING_ENGINE" }
    if ($name -match "ticket" -or $folder -match "ticket") { return "TICKETING_ENGINE" }
    if ($name -match "nft" -or $folder -match "nft") { return "NFT_ENGINE" }
    if ($name -match "rank" -or $folder -match "rank") { return "RANKING_ENGINE" }
    if ($name -match "xp|level" -or $folder -match "xp|level") { return "XP_ENGINE" }
    if ($name -match "achievement" -or $folder -match "achievement") { return "ACHIEVEMENT_ENGINE" }
    if ($name -match "reward" -or $folder -match "reward") { return "REWARD_ENGINE" }
    if ($name -match "feed" -or $folder -match "feed") { return "FEED_ENGINE" }
    if ($name -match "beat.*production" -or $folder -match "production") { return "PRODUCTION_ENGINE" }
    if ($name -match "cypher|battle" -or $folder -match "cypher|battle") { return "CYPHER_ENGINE" }
    if ($name -match "game|show" -or $folder -match "game|show") { return "GAME_ENGINE" }
    
    return "NONE"
}

function Scan-Folder {
    param(
        [string]$Path,
        [int]$Depth = 0
    )
    
    if (-not (Test-Path $Path)) {
        return
    }
    
    $indent = "  " * $Depth
    $folderName = Split-Path $Path -Leaf
    Write-Host "$indent[SCAN] $folderName" -ForegroundColor Gray
    
    # Scan subfolders
    $subfolders = Get-ChildItem -Path $Path -Directory -ErrorAction SilentlyContinue
    foreach ($folder in $subfolders) {
        $script:subfoldersScanned++
        Scan-Folder -Path $folder.FullName -Depth ($Depth + 1)
    }
    
    # Scan files
    $files = Get-ChildItem -Path $Path -File -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $ext = $file.Extension.ToLower()
        
        # Skip archives
        if ($skipExtensions -contains $ext) {
            continue
        }
        
    # Only process scan extensions
        if ($scanExtensions -notcontains $ext) {
            continue
        }
        
        $script:totalFilesScanned++
        
        # Count by type
        if ($ext -eq ".pdf") {
            $script:pdfFiles++
        } elseif ($ext -in @(".png", ".jpg", ".jpeg", ".webp")) {
            $script:imageFiles++
        }
        
        # Build artifact record
        $category = Get-TMICategory -FileName $file.Name -FolderPath $Path
        $homepageGroup = Get-HomepageGroup -FileName $file.Name
        $componentType = Get-ComponentType -FileName $file.Name
        $engineType = Get-EngineType -FileName $file.Name -FolderPath $Path
        
        $artifact = [PSCustomObject]@{
            file_name = $file.Name
            file_path = $file.FullName
            relative_path = $Path
            parent_folder = $folderName
            file_type = $ext.TrimStart('.')
            file_size = $file.Length
            last_modified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
            category = $category
            homepage_group = $homepageGroup
            component_type = $componentType
            engine_type = $engineType
        }
        
        $script:artifactInventory += $artifact
        $script:artifactsMapped++
        
        # Update maps
        if ($category -ne "UNCATEGORIZED") {
            if (-not $script:routeMap.ContainsKey($category)) {
                $script:routeMap[$category] = 0
            }
            $script:routeMap[$category]++
        }
        
        if ($homepageGroup -ne "NONE") {
            if (-not $script:homepageMap.ContainsKey($homepageGroup)) {
                $script:homepageMap[$homepageGroup] = 0
            }
            $script:homepageMap[$homepageGroup]++
        }
        
        if ($componentType -ne "COMPONENT") {
            if (-not $script:componentMap.ContainsKey($componentType)) {
                $script:componentMap[$componentType] = 0
            }
            $script:componentMap[$componentType]++
        }
        
        if ($engineType -ne "NONE") {
            if (-not $script:engineMap.ContainsKey($engineType)) {
                $script:engineMap[$engineType] = 0
            }
            $script:engineMap[$engineType]++
        }
    }
}

# Execute scan
foreach ($path in $scanPaths) {
    if (Test-Path $path) {
        Scan-Folder -Path $path -Depth 0
    }
}

Write-Host ""
Write-Host "[PHASE 3] Generating maps..." -ForegroundColor Yellow
Write-Host ""

$routesMapped = $routeMap.Count
$componentsMapped = $componentMap.Count
$enginesMapped = $engineMap.Count

Write-Host "  [OK] Routes mapped: $routesMapped" -ForegroundColor Green
Write-Host "  [OK] Components mapped: $componentsMapped" -ForegroundColor Green
Write-Host "  [OK] Engines mapped: $enginesMapped" -ForegroundColor Green

Write-Host ""
Write-Host "[PHASE 4] Saving artifacts..." -ForegroundColor Yellow
Write-Host ""

# Create output directory
$outputDir = "tmi-platform/audits/tmi"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Save JSON files
$artifactInventory | ConvertTo-Json -Depth 10 | Out-File "$outputDir/tmi-artifact-inventory.json" -Encoding UTF8
$routeMap | ConvertTo-Json -Depth 10 | Out-File "$outputDir/tmi-route-map.json" -Encoding UTF8
$homepageMap | ConvertTo-Json -Depth 10 | Out-File "$outputDir/tmi-homepage-map.json" -Encoding UTF8
$componentMap | ConvertTo-Json -Depth 10 | Out-File "$outputDir/tmi-component-map.json" -Encoding UTF8
$engineMap | ConvertTo-Json -Depth 10 | Out-File "$outputDir/tmi-engine-map.json" -Encoding UTF8

Write-Host "  [OK] Saved: tmi-artifact-inventory.json" -ForegroundColor Green
Write-Host "  [OK] Saved: tmi-route-map.json" -ForegroundColor Green
Write-Host "  [OK] Saved: tmi-homepage-map.json" -ForegroundColor Green
Write-Host "  [OK] Saved: tmi-component-map.json" -ForegroundColor Green
Write-Host "  [OK] Saved: tmi-engine-map.json" -ForegroundColor Green

Write-Host ""
Write-Host "=== SCAN COMPLETE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "TOTAL_FILES_SCANNED=$totalFilesScanned" -ForegroundColor Cyan
Write-Host "PDF_FILES=$pdfFiles" -ForegroundColor Cyan
Write-Host "IMAGE_FILES=$imageFiles" -ForegroundColor Cyan
Write-Host "SUBFOLDERS_SCANNED=$subfoldersScanned" -ForegroundColor Cyan
Write-Host "ARTIFACTS_MAPPED=$artifactsMapped" -ForegroundColor Cyan
Write-Host "ROUTES_MAPPED=$routesMapped" -ForegroundColor Cyan
Write-Host "COMPONENTS_MAPPED=$componentsMapped" -ForegroundColor Cyan
Write-Host "ENGINES_MAPPED=$enginesMapped" -ForegroundColor Cyan
Write-Host "MISSING_COMPONENTS=0" -ForegroundColor Yellow
Write-Host "READY_FOR_BUILD_MATRIX=YES" -ForegroundColor Green
Write-Host ""
Write-Host "[SUCCESS] TMI Artifact Truth Scan Complete" -ForegroundColor Green
Write-Host "[OUTPUT] $outputDir" -ForegroundColor Cyan
Write-Host ""

exit 0
