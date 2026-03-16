param()

# Fast check: fail if any file under apps/web imports @prisma/client
$matches = Get-ChildItem .\apps\web\src -Recurse -File -Filter *.ts* -ErrorAction SilentlyContinue | Select-String -Pattern '@prisma/client' -SimpleMatch
if ($matches) {
  Write-Error "FORBIDDEN: apps/web imports @prisma/client"
  $matches | ForEach-Object { Write-Output "Found: $($_.Path):$($_.LineNumber) -> $($_.Line.Trim())" }
  exit 1
} else {
  Write-Output 'OK: no prisma imports in web'
  exit 0
}
