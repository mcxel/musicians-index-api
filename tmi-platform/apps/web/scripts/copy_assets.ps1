# TMI Staging Script
# Copies room video loops and host character sheets into the web application public folders.

$ErrorActionPreference = "Stop"

# Define directories relative to repository root
$repoRoot = Resolve-Path "$PSScriptRoot\..\..\.."
$webPublic = "$repoRoot\apps\web\public"

$venueDest = "$webPublic\assets\venues"
$hostDest = "$webPublic\assets\hosts"

# Ensure destination folders exist
if (!(Test-Path $venueDest)) {
    New-Item -ItemType Directory -Force -Path $venueDest | Out-Null
    Write-Host "Created venue asset destination: $venueDest"
}
if (!(Test-Path $hostDest)) {
    New-Item -ItemType Directory -Force -Path $hostDest | Out-Null
    Write-Host "Created host asset destination: $hostDest"
}

# Define copies: Source -> Destination
$filesToCopy = @(
    @{
        Source = "$repoRoot\World Dance Party\World Dance Party base video.mp4"
        Dest   = "$venueDest\world-dance-party.mp4"
    },
    @{
        Source = "$repoRoot\Battles\Battles base video.mp4"
        Dest   = "$venueDest\battle-arena.mp4"
    },
    @{
        Source = "$repoRoot\Cyphers\Cypher base video.mp4"
        Dest   = "$venueDest\cypher-arena.mp4"
    },
    @{
        Source = "$repoRoot\Monday Night Stage\Marcel's Monday Night Stage video base.mp4"
        Dest   = "$venueDest\monday-stage.mp4"
    },
    @{
        Source = "$repoRoot\Deal or Feud 1000\Deal Or Feud 1000 video base.mp4"
        Dest   = "$venueDest\deal-or-feud.mp4"
    },
    @{
        Source = "$repoRoot\Big Ace\Big Ace 1.png"
        Dest   = "$hostDest\big-ace.png"
    },
    @{
        Source = "$repoRoot\Michael Charlie\Michael Charlie.png"
        Dest   = "$hostDest\michael-charlie.png"
    }
)

foreach ($item in $filesToCopy) {
    $src = $item.Source
    $dst = $item.Dest
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "Staged: $(Split-Path $src -Leaf) -> $(Split-Path $dst -Leaf)"
    } else {
        Write-Warning "Source asset not found: $src"
    }
}

Write-Host "Asset staging completed successfully!"
