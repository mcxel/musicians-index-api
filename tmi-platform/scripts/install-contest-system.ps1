param(
  [Parameter(Mandatory = $true)]
  [string]$SourceRoot,

  [switch]$CopyOnly,
  [switch]$RunMigration
)

$ErrorActionPreference = "Stop"

function Resolve-RepoRoot {
  return (Split-Path -Parent $PSScriptRoot)
}

function Ensure-Directory {
  param([Parameter(Mandatory = $true)][string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Find-UniqueFile {
  param(
    [Parameter(Mandatory = $true)][string]$Root,
    [Parameter(Mandatory = $true)][string]$Name
  )

  $matches = Get-ChildItem -Path $Root -Recurse -File -Filter $Name
  if ($matches.Count -eq 0) {
    throw "Missing required file in source bundle: $Name"
  }
  if ($matches.Count -gt 1) {
    $paths = ($matches | Select-Object -ExpandProperty FullName) -join "`n"
    throw "Multiple files named '$Name' found. Keep one copy in source bundle and retry.`n$paths"
  }
  return $matches[0].FullName
}

function Transfer-File {
  param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination,
    [switch]$CopyMode
  )

  Ensure-Directory -Path (Split-Path -Parent $Destination)
  if (Test-Path -LiteralPath $Destination) {
    Remove-Item -LiteralPath $Destination -Force
  }

  if ($CopyMode) {
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
  } else {
    Move-Item -LiteralPath $Source -Destination $Destination -Force
  }
}

function Append-PrismaSchemaSafely {
  param(
    [Parameter(Mandatory = $true)][string]$ContestSchemaPath,
    [Parameter(Mandatory = $true)][string]$MainSchemaPath
  )

  $mainContent = Get-Content -LiteralPath $MainSchemaPath -Raw
  $appendContent = Get-Content -LiteralPath $ContestSchemaPath -Raw

  if ([string]::IsNullOrWhiteSpace($appendContent)) {
    throw "contest.schema.prisma is empty."
  }

  if ($mainContent -match "model\s+ContestSeason\b") {
    Write-Host "Prisma append skipped: ContestSeason already exists."
    return
  }

  $normalizedMain = $mainContent.TrimEnd()
  $normalizedAppend = $appendContent.Trim()
  $newContent = "$normalizedMain`r`n`r`n// Contest System (appended by install-contest-system.ps1)`r`n$normalizedAppend`r`n"
  Set-Content -LiteralPath $MainSchemaPath -Value $newContent -NoNewline
  Write-Host "Prisma schema appended successfully."
}

function Ensure-AppModuleContestImport {
  param([Parameter(Mandatory = $true)][string]$AppModulePath)

  $content = Get-Content -LiteralPath $AppModulePath -Raw
  $importLine = 'import { ContestModule } from "./modules/contest/contest.module";'

  if ($content -notmatch [regex]::Escape($importLine)) {
    $content = $content -replace '(import \{ UsersModule \} from "\./modules/users/users.module";\r?\n)', ('$1' + $importLine + "`r`n")
  }

  if ($content -notmatch '\bContestModule\b') {
    throw "Unable to register ContestModule in app.module.ts"
  }

  if ($content -match 'imports:\s*\[([^\]]*)\]') {
    $importsSegment = $Matches[1]
    if ($importsSegment -notmatch '\bContestModule\b') {
      $updatedSegment = ($importsSegment.TrimEnd() + ', ContestModule')
      $content = $content -replace 'imports:\s*\[([^\]]*)\]', ('imports: [' + $updatedSegment + ']')
    }
  } else {
    throw "Could not find @Module imports array in app.module.ts"
  }

  Set-Content -LiteralPath $AppModulePath -Value $content -NoNewline
  Write-Host "app.module.ts updated with ContestModule."
}

$repoRoot = Resolve-RepoRoot
$sourcePath = (Resolve-Path -LiteralPath $SourceRoot).Path

$targets = @{
  "ContestBanner.tsx" = Join-Path $repoRoot "apps/web/src/components/contest/ContestBanner.tsx"
  "SponsorInvitePanel.tsx" = Join-Path $repoRoot "apps/web/src/components/contest/SponsorInvitePanel.tsx"
  "SponsorPackageTierCard.tsx" = Join-Path $repoRoot "apps/web/src/components/contest/SponsorPackageTierCard.tsx"
  "SeasonCountdownPanel.tsx" = Join-Path $repoRoot "apps/web/src/components/contest/SeasonCountdownPanel.tsx"
  "RayJourneyHost.tsx" = Join-Path $repoRoot "apps/web/src/components/host/RayJourneyHost.tsx"
  "RayJourneyAvatarSpec.ts" = Join-Path $repoRoot "apps/web/src/components/host/RayJourneyAvatarSpec.ts"
  "HostCuePanel.tsx" = Join-Path $repoRoot "apps/web/src/components/host/HostCuePanel.tsx"
  "page.tsx" = Join-Path $repoRoot "apps/web/src/app/contest/page.tsx"
  "contest.controller.ts" = Join-Path $repoRoot "apps/api/src/modules/contest/contest.controller.ts"
  "contest.service.ts" = Join-Path $repoRoot "apps/api/src/modules/contest/contest.service.ts"
  "contest.module.ts" = Join-Path $repoRoot "apps/api/src/modules/contest/contest.module.ts"
  "contest.dto.ts" = Join-Path $repoRoot "apps/api/src/modules/contest/contest.dto.ts"
  "ContestBots.ts" = Join-Path $repoRoot "apps/api/src/bots/contest/ContestBots.ts"
  "MASTER_MANIFEST.md" = Join-Path $repoRoot "docs/MASTER_MANIFEST.md"
  "COPILOT_WIRING_GUIDE.md" = Join-Path $repoRoot "docs/COPILOT_WIRING_GUIDE.md"
}

$waves = @(
  @{ Name = "Wave 1 - Frontend Components"; Files = @("ContestBanner.tsx", "SeasonCountdownPanel.tsx") },
  @{ Name = "Wave 2 - Sponsor UI"; Files = @("SponsorInvitePanel.tsx", "SponsorPackageTierCard.tsx") },
  @{ Name = "Wave 3 - API + Prisma"; Files = @("contest.controller.ts", "contest.service.ts", "contest.module.ts", "contest.dto.ts") },
  @{ Name = "Wave 4 - Host System"; Files = @("RayJourneyHost.tsx", "RayJourneyAvatarSpec.ts", "HostCuePanel.tsx") },
  @{ Name = "Wave 5 - Admin + Bots"; Files = @("page.tsx", "ContestBots.ts") },
  @{ Name = "Wave 6 - Docs"; Files = @("MASTER_MANIFEST.md", "COPILOT_WIRING_GUIDE.md") }
)

Write-Host "Source bundle: $sourcePath"
Write-Host "Repo root: $repoRoot"
Write-Host "Mode: $(if ($CopyOnly) { 'COPY' } else { 'MOVE' })"

foreach ($wave in $waves) {
  Write-Host "`n=== $($wave.Name) ==="
  foreach ($name in $wave.Files) {
    $source = Find-UniqueFile -Root $sourcePath -Name $name
    $destination = $targets[$name]
    Transfer-File -Source $source -Destination $destination -CopyMode:$CopyOnly
    Write-Host "Installed: $name -> $destination"
  }

  if ($wave.Name -eq "Wave 3 - API + Prisma") {
    $contestSchema = Find-UniqueFile -Root $sourcePath -Name "contest.schema.prisma"
    $mainSchema = Join-Path $repoRoot "packages/db/prisma/schema.prisma"
    Append-PrismaSchemaSafely -ContestSchemaPath $contestSchema -MainSchemaPath $mainSchema

    $appModule = Join-Path $repoRoot "apps/api/src/app.module.ts"
    Ensure-AppModuleContestImport -AppModulePath $appModule
  }
}

if ($RunMigration) {
  Write-Host "`nRunning Prisma migration..."
  Push-Location $repoRoot
  try {
    Push-Location (Join-Path $repoRoot "packages/db")
    try {
      pnpm exec prisma migrate dev --name contest_system_wave3
    } finally {
      Pop-Location
    }
  } finally {
    Pop-Location
  }
}

Write-Host "`nContest system install complete."