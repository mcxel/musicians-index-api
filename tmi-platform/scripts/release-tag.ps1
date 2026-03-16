Param(
  [string]$Prefix = "release/web",
  [string]$Message = "Release tag"
)

$ErrorActionPreference = "Stop"

function Git($args) { git $args; if ($LASTEXITCODE -ne 0) { throw "git $args failed" } }

# Ensure clean working tree
$status = git status --porcelain
if ($status) {
  Write-Host "❌ Working tree not clean. Commit/stash first." -ForegroundColor Red
  exit 1
}

$today = Get-Date -Format "yyyy-MM-dd"
$existing = git tag --list "$Prefix-$today-*" | Measure-Object | Select-Object -ExpandProperty Count
$seq = "{0:D2}" -f ($existing + 1)

$tag = "$Prefix-$today-$seq"

Git "tag -a $tag -m `"$Message`""
Git "push origin $tag"

Write-Host "✅ Created & pushed tag: $tag" -ForegroundColor Green
