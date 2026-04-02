# Phase 12 Security Regression Script (PowerShell)
# Non-interactive tests for auth, csrf, cookies, proxy abuse, authz boundaries

$base = "http://localhost:4000"

Write-Host "=== HEALTH CHECK ==="
curl.exe -i "$base/api/healthz"

Write-Host "=== SESSION CHECK (no cookie) ==="
curl.exe -i "$base/api/auth/session"

Write-Host "=== LOGIN INVALID ==="
curl.exe -i -X POST "$base/api/auth/login" `
  -H "Content-Type: application/json" `
  -H "x-csrf-token: badtoken" `
  -d "{\"email\":\"nope@example.com\",\"password\":\"badpass123\"}"

Write-Host "=== LOGIN CROSS ORIGIN BLOCK TEST ==="
curl.exe -i -X POST "$base/api/auth/login" `
  -H "Origin: http://evil.local" `
  -H "Content-Type: application/json" `
  -H "x-csrf-token: badtoken" `
  -d "{\"email\":\"nope@example.com\",\"password\":\"badpass123\"}"

Write-Host "=== LOGOUT WITHOUT SESSION ==="
curl.exe -i -X POST "$base/api/auth/logout"

Write-Host "=== CSRF MISSING TOKEN TEST ==="
curl.exe -i -X POST "$base/api/auth/login" `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"test@test.com\",\"password\":\"123456\"}"

Write-Host "=== PROXY ABUSE TESTS ==="
curl.exe -i "$base/api/proxy?url=http://localhost:4000"
curl.exe -i "$base/api/proxy?url=http://127.0.0.1"
curl.exe -i "$base/api/proxy?url=http://169.254.169.254"
curl.exe -i "$base/api/proxy?url=file:///etc/passwd"
curl.exe -i "$base/api/proxy?url=http://example.com@localhost"

Write-Host "=== AUTHORIZATION BOUNDARY TEST ==="
curl.exe -i "$base/api/users/me"
curl.exe -i "$base/api/admin"
curl.exe -i "$base/api/wallet"
curl.exe -i "$base/api/notifications"

Write-Host "=== DONE ==="
