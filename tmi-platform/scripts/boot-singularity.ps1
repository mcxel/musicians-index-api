$repoRoot = "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"

Write-Host "INITIALIZING TMI STACK..." -ForegroundColor Yellow

# DB OBSERVATORY (optional)
$dbCmd = @"
cd '$repoRoot'
`$env:NODE_OPTIONS='--max-old-space-size=6144'
Write-Host '=== DB OBSERVATORY ===' -ForegroundColor Cyan
pnpm exec prisma studio --port 5555
"@

Start-Process powershell -ArgumentList "-NoExit","-Command",$dbCmd

Start-Sleep -Seconds 3

# API
$apiCmd = @"
cd '$repoRoot\apps\api'
`$env:NODE_OPTIONS='--max-old-space-size=6144'
`$env:PORT='4000'
Write-Host '=== API ===' -ForegroundColor Magenta
pnpm run start:dev
"@

Start-Process powershell -ArgumentList "-NoExit","-Command",$apiCmd

Start-Sleep -Seconds 5

# WEB
$webCmd = @"
cd '$repoRoot\apps\web'
`$env:NODE_OPTIONS='--max-old-space-size=6144'
Write-Host '=== WEB ===' -ForegroundColor Green
pnpm run dev
"@

Start-Process powershell -ArgumentList "-NoExit","-Command",$webCmd

Write-Host "Boot sequence launched." -ForegroundColor Green