# TMI Staging Script
# Copies room video loops and host character sheets into structured environment directories.

$ErrorActionPreference = "Stop"

# Define directories relative to repository root
$repoRoot = Resolve-Path "$PSScriptRoot\..\..\.."
$webPublic = "$repoRoot\apps\web\public"

$envBase = "$webPublic\assets\environments"
$hostDest = "$webPublic\assets\hosts"

# Ensure host folder exists
if (!(Test-Path $hostDest)) {
    New-Item -ItemType Directory -Force -Path $hostDest | Out-Null
}

# Helper function to copy and ensure parent directory
function Copy-EnvironmentAsset($sourcePath, $targetSubfolder) {
    $destFolder = "$envBase\$targetSubfolder"
    if (!(Test-Path $destFolder)) {
        New-Item -ItemType Directory -Force -Path $destFolder | Out-Null
        Write-Host "Created folder: $destFolder"
    }
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination "$destFolder\background.mp4" -Force
        Write-Host "Staged: $(Split-Path $sourcePath -Leaf) -> environments/$targetSubfolder/background.mp4"
    } else {
        Write-Warning "Source asset not found: $sourcePath"
    }
}

# Staging video loops into clean environments structure
Copy-EnvironmentAsset "$repoRoot\World Dance Party\World Dance Party base video.mp4" "dance"
Copy-EnvironmentAsset "$repoRoot\Battles\Battles base video.mp4" "battle"
Copy-EnvironmentAsset "$repoRoot\Cyphers\Cypher base video.mp4" "cypher"
Copy-EnvironmentAsset "$repoRoot\Monday Night Stage\Marcel's Monday Night Stage video base.mp4" "stage"
Copy-EnvironmentAsset "$repoRoot\Deal or Feud 1000\Deal Or Feud 1000 video base.mp4" "gameshow"

# Staging Host portraits
$hostsToCopy = @(
    @{
        Source = "$repoRoot\Big Ace\Big Ace 1.png"
        Dest   = "$hostDest\big-ace.png"
    },
    @{
        Source = "$repoRoot\Michael Charlie\Michael Charlie.png"
        Dest   = "$hostDest\michael-charlie.png"
    }
)

foreach ($item in $hostsToCopy) {
    $src = $item.Source
    $dst = $item.Dest
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "Staged: $(Split-Path $src -Leaf) -> hosts/$(Split-Path $dst -Leaf)"
    } else {
        Write-Warning "Source asset not found: $src"
    }
}

Write-Host "Structured asset staging completed successfully!"
