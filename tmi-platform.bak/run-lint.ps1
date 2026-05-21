Set-Location "c:/Users/Admin/Documents/BerntoutGlobal XXL/tmi-platform/apps/web"
pnpm run lint
$code = $LASTEXITCODE
Write-Host ""
Write-Host "========================================="
Write-Host "LINT EXIT CODE: $code"
if ($code -eq 0) {
  Write-Host "STATUS: PASSED - lint exits 0"
} else {
  Write-Host "STATUS: FAILED - lint exits $code"
}
Write-Host "========================================="
