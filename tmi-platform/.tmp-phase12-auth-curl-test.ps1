# Cookie + CSRF Header Inspection Script

$base = "http://localhost:4000"

Write-Host "=== GET CSRF COOKIE ==="
curl.exe -i "$base/api/auth/csrf"

Write-Host "=== LOGIN RESPONSE HEADERS ==="
curl.exe -i -X POST "$base/api/auth/login" `
  -H "Content-Type: application/json" `
  -H "x-csrf-token: testtoken" `
  -d "{\"email\":\"test@test.com\",\"password\":\"123456\"}"

Write-Host "=== SESSION HEADERS ==="
curl.exe -i "$base/api/auth/session"

Write-Host "=== LOGOUT HEADERS ==="
curl.exe -i -X POST "$base/api/auth/logout"

Write-Host "=== COOKIE HEADER TEST COMPLETE ==="
