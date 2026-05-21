Set-Location "c:/Users/Admin/Documents/BerntoutGlobal XXL/tmi-platform/apps/web"

Write-Host "=== .eslintignore CONTENTS ==="
Get-Content .eslintignore

Write-Host ""
Write-Host "=== CHECKING IF ANALYTICS FILE EXISTS ==="
$analyticsFile = "src/app/admin/analytics/page.tsx"
if (Test-Path $analyticsFile) {
    Write-Host "FILE EXISTS: $analyticsFile"
} else {
    Write-Host "FILE NOT FOUND: $analyticsFile"
    Write-Host "Searching for analytics pages..."
    Get-ChildItem -Recurse -Filter "page.tsx" | Where-Object { $_.FullName -match "analytics" } | Select-Object FullName
}

Write-Host ""
Write-Host "=== RUNNING LINT - ERRORS ONLY ==="
$out = pnpm run lint 2>&1
# Show lines around the error
$lines = $out -split "`n"
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "Error:" -and $lines[$i] -notmatch "Warning:") {
        # Print 3 lines before and after for context
        $start = [Math]::Max(0, $i-3)
        $end = [Math]::Min($lines.Count-1, $i+2)
        $lines[$start..$end] | ForEach-Object { Write-Host $_ }
        Write-Host "---"
    }
}
Write-Host "=== EXIT STATUS: $LASTEXITCODE ==="
