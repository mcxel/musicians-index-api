$base = "c:/Users/Admin/Documents/BerntoutGlobal XXL/tmi-platform"
$paths = @(
  "$base/apps/web/.next",
  "$base/apps/web/.turbo",
  "$base/apps/api/.turbo",
  "$base/.turbo",
  "$base/node_modules/.cache",
  "$base/apps/web/node_modules/.cache",
  "$base/apps/api/node_modules/.cache"
)
foreach ($p in $paths) {
  if (Test-Path $p) {
    Remove-Item -Recurse -Force $p -ErrorAction SilentlyContinue
    Write-Host "CLEARED: $p"
  } else {
    Write-Host "NOT FOUND: $p"
  }
}
Write-Host "Cache clear complete."
