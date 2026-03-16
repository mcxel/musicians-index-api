Param(
  [Parameter(Mandatory=$true)][string]$Tag,
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

function Git($args) { git $args; if ($LASTEXITCODE -ne 0) { throw "git $args failed" } }

Write-Host "⚠️ Rolling back $Branch to tag $Tag" -ForegroundColor Yellow

Git "fetch --all --tags"
Git "checkout $Branch"
Git "reset --hard $Tag"
Git "push --force-with-lease origin $Branch"

Write-Host "✅ Rolled back $Branch to $Tag" -ForegroundColor Green
