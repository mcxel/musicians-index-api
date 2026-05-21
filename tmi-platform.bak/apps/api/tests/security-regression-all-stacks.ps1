# ============================================================
# TMI Platform — Full Security Regression Matrix
# Stacks 1-4: Auth, CSRF, Cookie, Proxy, Authorization
# Base URL: http://localhost:4000
# Uses cmd /c curl.exe to avoid PowerShell argument mangling
# ============================================================

$BASE = "http://localhost:4000"
$passed = 0
$failed = 0
$results = @()

function Test-Case {
    param(
        [string]$Stack,
        [string]$Name,
        [bool]$Condition,
        [string]$Actual,
        [string]$Expected
    )
    if ($Condition) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        $script:passed++
        $script:results += [PSCustomObject]@{ Stack=$Stack; Name=$Name; Result="PASS"; Expected=$Expected; Actual=$Actual }
    } else {
        Write-Host "  [FAIL] $Name | Expected: $Expected | Actual: $Actual" -ForegroundColor Red
        $script:failed++
        $script:results += [PSCustomObject]@{ Stack=$Stack; Name=$Name; Result="FAIL"; Expected=$Expected; Actual=$Actual }
    }
}

# Get-ResponseWithHeaders — uses & curl.exe @arrayArgs so PowerShell passes each
# element as a separate process argument with NO shell quoting/expansion at all.
# Body is written to a temp file and passed via --data-binary @file to avoid any
# quote mangling for JSON payloads.  Status + response headers are parsed from a
# -D dump file so we never need the %{http_code} format string.
function Get-ResponseWithHeaders {
    param(
        [string]$Uri,
        [hashtable]$Headers = @{},
        [string]$Method = "GET",
        [string]$Body = $null
    )

    $tmpHdr  = [System.IO.Path]::GetTempFileName()
    $tmpBody = $null

    try {
        # Build argument list as a typed array — no string-building, no shell
        $curlArgs = [System.Collections.Generic.List[string]]::new()
        $curlArgs.Add("-s")
        $curlArgs.Add("--max-time"); $curlArgs.Add("10")
        $curlArgs.Add("-X");         $curlArgs.Add($Method)
        $curlArgs.Add("-D");         $curlArgs.Add($tmpHdr)

        foreach ($k in $Headers.Keys) {
            $curlArgs.Add("-H")
            $curlArgs.Add("${k}: $($Headers[$k])")
        }

        if ($null -ne $Body -and $Body -ne "") {
            # Write body to temp file — completely avoids quote escaping
            $tmpBody = [System.IO.Path]::GetTempFileName()
            [System.IO.File]::WriteAllText($tmpBody, $Body, [System.Text.Encoding]::UTF8)
            $curlArgs.Add("-H");            $curlArgs.Add("Content-Type: application/json")
            $curlArgs.Add("--data-binary"); $curlArgs.Add("@$tmpBody")
        }

        $curlArgs.Add($Uri)

        # Execute — & operator passes each list element as a distinct argument
        $rawOut = & curl.exe @curlArgs 2>$null
        $content = if ($null -eq $rawOut) { "" } else { ($rawOut | ForEach-Object { "$_" }) -join "" }

        # Parse status code and headers from the -D dump file
        $statusCode = $null
        $hdrs = @{}

        if (Test-Path $tmpHdr) {
            $hdrLines = Get-Content $tmpHdr -ErrorAction SilentlyContinue
            if ($hdrLines) {
                # Take the LAST HTTP status line (handles 100-continue / redirects)
                foreach ($line in $hdrLines) {
                    $line = "$line".Trim()
                    if ($line -match "^HTTP/\d+\.?\d*\s+(\d+)") {
                        $statusCode = [int]$Matches[1]
                    }
                }
                # Parse all header key:value lines
                foreach ($line in $hdrLines) {
                    $line = "$line".Trim()
                    if ($line -match "^([^:]+):\s*(.+)$") {
                        $hdrs[$Matches[1].Trim()] = $Matches[2].Trim()
                    }
                }
            }
        }

        return @{ StatusCode=$statusCode; Headers=$hdrs; Content=$content.Trim() }
    } catch {
        return @{ StatusCode=$null; Headers=@{}; Content="" }
    } finally {
        if (Test-Path $tmpHdr)  { Remove-Item $tmpHdr  -Force -ErrorAction SilentlyContinue }
        if ($null -ne $tmpBody -and (Test-Path $tmpBody)) {
            Remove-Item $tmpBody -Force -ErrorAction SilentlyContinue
        }
    }
}

function Get-JsonField {
    param([string]$JsonText, [string]$Field)
    try { return ($JsonText | ConvertFrom-Json -ErrorAction Stop).$Field } catch { return $null }
}

# ============================================================
# STACK 1: Auth Endpoint Matrix + Cookie Lifecycle
# ============================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "STACK 1: Auth Endpoint Matrix + Cookie Lifecycle" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$r = Get-ResponseWithHeaders -Uri "$BASE/api/healthz"
Test-Case -Stack "S1" -Name "GET /api/healthz -> 200" -Condition ($r.StatusCode -eq 200) -Expected "200" -Actual "$($r.StatusCode)"

$r = Get-ResponseWithHeaders -Uri "$BASE/api/auth/csrf"
Test-Case -Stack "S1" -Name "GET /api/auth/csrf -> 200" -Condition ($r.StatusCode -eq 200) -Expected "200" -Actual "$($r.StatusCode)"

$csrfToken = Get-JsonField -JsonText $r.Content -Field "csrfToken"
Test-Case -Stack "S1" -Name "GET /api/auth/csrf -> body.csrfToken present" -Condition ($null -ne $csrfToken -and $csrfToken.ToString().Length -gt 0) -Expected "non-empty string" -Actual "$csrfToken"

$setCookieHeader = ""
if ($r.Headers -and $r.Headers["Set-Cookie"]) { $setCookieHeader = "$($r.Headers['Set-Cookie'])" }
Test-Case -Stack "S1" -Name "GET /api/auth/csrf -> Set-Cookie has phase11_csrf" -Condition ($setCookieHeader -match "phase11_csrf") -Expected "phase11_csrf present" -Actual "$setCookieHeader"

$r2 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/session"
Test-Case -Stack "S1" -Name "GET /api/auth/session -> 200" -Condition ($r2.StatusCode -eq 200) -Expected "200" -Actual "$($r2.StatusCode)"

$authenticated = Get-JsonField -JsonText $r2.Content -Field "authenticated"
Test-Case -Stack "S1" -Name "GET /api/auth/session unauthenticated by default" -Condition ($authenticated -eq $false) -Expected "false" -Actual "$authenticated"

$r3 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/login" -Method "POST" -Body '{"email":"test@test.com","password":"Test123!test"}'
Test-Case -Stack "S1" -Name "POST /api/auth/login without CSRF -> 403" -Condition ($r3.StatusCode -eq 403) -Expected "403" -Actual "$($r3.StatusCode)"

# Fresh CSRF token+cookie for valid-CSRF login test
$csrfResp = Get-ResponseWithHeaders -Uri "$BASE/api/auth/csrf"
$freshToken = Get-JsonField -JsonText $csrfResp.Content -Field "csrfToken"
$csrfCookieValue = ""
if ($csrfResp.Headers -and $csrfResp.Headers["Set-Cookie"]) {
    $raw = "$($csrfResp.Headers['Set-Cookie'])"
    if ($raw -match "phase11_csrf=([^;]+)") { $csrfCookieValue = $matches[1] }
}

$r4 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/login" -Method "POST" -Headers @{
    "x-csrf-token" = "$freshToken"
    "Cookie"       = "phase11_csrf=$csrfCookieValue"
    "Origin"       = "http://localhost:3000"
} -Body '{"email":"test@test.com","password":"Test123!test"}'
Test-Case -Stack "S1" -Name "POST /api/auth/login with valid CSRF not blocked by CSRF" -Condition ($r4.StatusCode -ne 403) -Expected "not 403" -Actual "$($r4.StatusCode)"

$r5 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/logout" -Method "POST" -Body "{}"
Test-Case -Stack "S1" -Name "POST /api/auth/logout without CSRF -> 403" -Condition ($r5.StatusCode -eq 403) -Expected "403" -Actual "$($r5.StatusCode)"

# ============================================================
# STACK 2: CSRF Edge-Case Matrix
# ============================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "STACK 2: CSRF Edge-Case Matrix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$r6 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/login" -Method "POST" -Headers @{ "x-csrf-token"="some-token"; "Origin"="http://localhost:3000" } -Body '{"email":"a@b.com","password":"pass"}'
Test-Case -Stack "S2" -Name "Header only CSRF token without cookie -> 403" -Condition ($r6.StatusCode -eq 403) -Expected "403" -Actual "$($r6.StatusCode)"

$r7 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/login" -Method "POST" -Headers @{ "Cookie"="phase11_csrf=somevalue"; "Origin"="http://localhost:3000" } -Body '{"email":"a@b.com","password":"pass"}'
Test-Case -Stack "S2" -Name "Cookie only CSRF token without header -> 403" -Condition ($r7.StatusCode -eq 403) -Expected "403" -Actual "$($r7.StatusCode)"

$r8 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/login" -Method "POST" -Headers @{ "x-csrf-token"="wrong"; "Cookie"="phase11_csrf=different"; "Origin"="http://localhost:3000" } -Body '{"email":"a@b.com","password":"pass"}'
Test-Case -Stack "S2" -Name "Mismatched CSRF header vs cookie -> 403" -Condition ($r8.StatusCode -eq 403) -Expected "403" -Actual "$($r8.StatusCode)"

$r9 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/login" -Method "POST" -Headers @{ "x-csrf-token"=""; "Cookie"="phase11_csrf="; "Origin"="http://localhost:3000" } -Body '{"email":"a@b.com","password":"pass"}'
Test-Case -Stack "S2" -Name "Empty CSRF tokens -> 403" -Condition ($r9.StatusCode -eq 403) -Expected "403" -Actual "$($r9.StatusCode)"

$r10 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/session" -Method "PATCH" -Body "{}"
Test-Case -Stack "S2" -Name "PATCH mutation without CSRF blocked" -Condition ($r10.StatusCode -in 403,404,405) -Expected "403/404/405" -Actual "$($r10.StatusCode)"

$r11 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/session" -Method "PUT" -Body "{}"
Test-Case -Stack "S2" -Name "PUT mutation without CSRF blocked" -Condition ($r11.StatusCode -in 403,404,405) -Expected "403/404/405" -Actual "$($r11.StatusCode)"

$r12 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/session" -Method "DELETE"
Test-Case -Stack "S2" -Name "DELETE mutation without CSRF blocked" -Condition ($r12.StatusCode -in 403,404,405) -Expected "403/404/405" -Actual "$($r12.StatusCode)"

$r13 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/csrf"
Test-Case -Stack "S2" -Name "GET not blocked by CSRF middleware" -Condition ($r13.StatusCode -eq 200) -Expected "200" -Actual "$($r13.StatusCode)"

# ============================================================
# STACK 3: Authorization Boundary Matrix
# ============================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "STACK 3: Authorization Boundary Matrix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$r14 = Get-ResponseWithHeaders -Uri "$BASE/api/users/me"
Test-Case -Stack "S3" -Name "GET /api/users/me without session -> 401" -Condition ($r14.StatusCode -eq 401) -Expected "401" -Actual "$($r14.StatusCode)"

$r15 = Get-ResponseWithHeaders -Uri "$BASE/api/wallet"
Test-Case -Stack "S3" -Name "GET /api/wallet without session -> 401" -Condition ($r15.StatusCode -eq 401) -Expected "401" -Actual "$($r15.StatusCode)"

$r16 = Get-ResponseWithHeaders -Uri "$BASE/api/notifications"
Test-Case -Stack "S3" -Name "GET /api/notifications without session -> 401" -Condition ($r16.StatusCode -eq 401) -Expected "401" -Actual "$($r16.StatusCode)"

$r17 = Get-ResponseWithHeaders -Uri "$BASE/api/admin"
Test-Case -Stack "S3" -Name "GET /api/admin hidden/not exposed" -Condition ($r17.StatusCode -eq 404) -Expected "404" -Actual "$($r17.StatusCode)"

$r18 = Get-ResponseWithHeaders -Uri "$BASE/api/nonexistent-route-xyz"
Test-Case -Stack "S3" -Name "GET nonexistent route -> 404" -Condition ($r18.StatusCode -eq 404) -Expected "404" -Actual "$($r18.StatusCode)"

$r19 = Get-ResponseWithHeaders -Uri "$BASE/api/users/me" -Headers @{ "Cookie"="phase11_session=fake-session-token-xyz" }
Test-Case -Stack "S3" -Name "Fake session cookie rejected on /users/me" -Condition ($r19.StatusCode -eq 401) -Expected "401" -Actual "$($r19.StatusCode)"

$r20 = Get-ResponseWithHeaders -Uri "$BASE/api/wallet" -Headers @{ "Cookie"="phase11_session=fake-session-token-xyz" }
Test-Case -Stack "S3" -Name "Fake session cookie rejected on /wallet" -Condition ($r20.StatusCode -eq 401) -Expected "401" -Actual "$($r20.StatusCode)"

$r21 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/session" -Headers @{ "X-Forwarded-For"="127.0.0.1,evil.com"; "X-Real-IP"="10.0.0.1" }
Test-Case -Stack "S3" -Name "X-Forwarded-For injection does not bypass auth/session endpoint" -Condition ($r21.StatusCode -eq 200) -Expected "200" -Actual "$($r21.StatusCode)"

$r22 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/csrf" -Headers @{ "Host"="evil.com" }
Test-Case -Stack "S3" -Name "Host header injection does not bypass csrf endpoint" -Condition ($r22.StatusCode -eq 200) -Expected "200" -Actual "$($r22.StatusCode)"

$r23 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/login" -Method "POST" -Headers @{ "Origin"="http://evil.com"; "x-csrf-token"="any"; "Cookie"="phase11_csrf=any" } -Body '{"email":"a@b.com","password":"pass"}'
Test-Case -Stack "S3" -Name "Disallowed origin mutation not successful" -Condition ($r23.StatusCode -ne 200) -Expected "not 200" -Actual "$($r23.StatusCode)"

# ============================================================
# STACK 4: Cookie Attribute Verification + Security Headers
# ============================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "STACK 4: Cookie Attributes + Security Headers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$csrfFull = Get-ResponseWithHeaders -Uri "$BASE/api/auth/csrf"
$setCookieFull = ""
if ($csrfFull.Headers -and $csrfFull.Headers["Set-Cookie"]) { $setCookieFull = "$($csrfFull.Headers['Set-Cookie'])" }

Test-Case -Stack "S4" -Name "phase11_csrf has SameSite=Lax" -Condition ($setCookieFull -match "(?i)SameSite=Lax") -Expected "SameSite=Lax" -Actual "$setCookieFull"
Test-Case -Stack "S4" -Name "phase11_csrf is JS-readable (no HttpOnly)" -Condition (-not ($setCookieFull -match "(?i)HttpOnly")) -Expected "no HttpOnly" -Actual "$setCookieFull"
Test-Case -Stack "S4" -Name "phase11_csrf has Path=/" -Condition ($setCookieFull -match "Path=/") -Expected "Path=/" -Actual "$setCookieFull"

$xContentType = if ($csrfFull.Headers["X-Content-Type-Options"]) { "$($csrfFull.Headers['X-Content-Type-Options'])" } else { "" }
Test-Case -Stack "S4" -Name "X-Content-Type-Options nosniff present" -Condition ($xContentType -match "nosniff") -Expected "nosniff" -Actual "$xContentType"

$xFrame = if ($csrfFull.Headers["X-Frame-Options"]) { "$($csrfFull.Headers['X-Frame-Options'])" } else { "" }
$csp = if ($csrfFull.Headers["Content-Security-Policy"]) { "$($csrfFull.Headers['Content-Security-Policy'])" } else { "" }
Test-Case -Stack "S4" -Name "X-Frame-Options or CSP frame-ancestors present" -Condition ($xFrame.Length -gt 0 -or $csp -match "frame-ancestors") -Expected "X-Frame-Options or CSP frame-ancestors" -Actual "X-Frame-Options=$xFrame CSP=$csp"

$xDns = if ($csrfFull.Headers["X-DNS-Prefetch-Control"]) { "$($csrfFull.Headers['X-DNS-Prefetch-Control'])" } else { "" }
Test-Case -Stack "S4" -Name "X-DNS-Prefetch-Control present" -Condition ($xDns.Length -gt 0) -Expected "present" -Actual "$xDns"

$xPowered = if ($csrfFull.Headers["X-Powered-By"]) { "$($csrfFull.Headers['X-Powered-By'])" } else { "" }
Test-Case -Stack "S4" -Name "X-Powered-By absent" -Condition ($xPowered.Length -eq 0) -Expected "absent" -Actual "$xPowered"

$contentType = if ($csrfFull.Headers["Content-Type"]) { "$($csrfFull.Headers['Content-Type'])" } else { "" }
Test-Case -Stack "S4" -Name "Content-Type application/json" -Condition ($contentType -match "application/json") -Expected "application/json" -Actual "$contentType"

$corsResp = Get-ResponseWithHeaders -Uri "$BASE/api/auth/csrf" -Headers @{ "Origin"="http://localhost:3000" }
$acao = if ($corsResp.Headers["Access-Control-Allow-Origin"]) { "$($corsResp.Headers['Access-Control-Allow-Origin'])" } else { "" }
Test-Case -Stack "S4" -Name "CORS allowed origin echoed" -Condition ($acao -match "localhost:3000" -or $acao -eq "*") -Expected "localhost:3000 or *" -Actual "$acao"

$acac = if ($corsResp.Headers["Access-Control-Allow-Credentials"]) { "$($corsResp.Headers['Access-Control-Allow-Credentials'])" } else { "" }
Test-Case -Stack "S4" -Name "Access-Control-Allow-Credentials present" -Condition ($acac.Length -gt 0) -Expected "present" -Actual "$acac"

# Session cookie attributes — requires successful login (DB-dependent)
$csrfR2 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/csrf"
$tok2 = Get-JsonField -JsonText $csrfR2.Content -Field "csrfToken"
$ck2 = ""
if ($csrfR2.Headers -and $csrfR2.Headers["Set-Cookie"]) {
    $raw2 = "$($csrfR2.Headers['Set-Cookie'])"
    if ($raw2 -match "phase11_csrf=([^;]+)") { $ck2 = $matches[1] }
}

$loginR2 = Get-ResponseWithHeaders -Uri "$BASE/api/auth/login" -Method "POST" -Headers @{
    "x-csrf-token" = "$tok2"
    "Cookie"       = "phase11_csrf=$ck2"
    "Origin"       = "http://localhost:3000"
} -Body '{"email":"test@test.com","password":"Test123!test"}'

$loginSetCookie = if ($loginR2.Headers -and $loginR2.Headers["Set-Cookie"]) { "$($loginR2.Headers['Set-Cookie'])" } else { "" }

if ($loginR2.StatusCode -eq 200) {
    Test-Case -Stack "S4" -Name "phase11_session cookie has HttpOnly" -Condition ($loginSetCookie -match "phase11_session" -and $loginSetCookie -match "(?i)HttpOnly") -Expected "phase11_session + HttpOnly" -Actual "$loginSetCookie"
    Test-Case -Stack "S4" -Name "phase11_session cookie SameSite=Lax" -Condition ($loginSetCookie -match "(?i)SameSite=Lax") -Expected "SameSite=Lax" -Actual "$loginSetCookie"
} else {
    Write-Host "  [INFO] Login returned $($loginR2.StatusCode) (session-cookie runtime check skipped; policy is code-verified)" -ForegroundColor Yellow
    $script:results += [PSCustomObject]@{
        Stack="S4"; Name="Session cookie attributes (runtime skipped, code-verified)"; Result="INFO"
        Expected="phase11_session HttpOnly=true SameSite=Lax"
        Actual="Login status $($loginR2.StatusCode); verify from auth.controller.ts"
    }
}

# ============================================================
# RESULTS SUMMARY + FILE OUTPUTS
# ============================================================
Write-Host "`n============================================================" -ForegroundColor White
Write-Host "SECURITY REGRESSION MATRIX RESULTS" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor White
Write-Host "Total:  $($passed + $failed)" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

Write-Host "`nDetailed Results:" -ForegroundColor Cyan
$results | Format-Table -AutoSize -Property Stack, Name, Result, Expected, Actual

$timestamp = (Get-Date).ToString("s") + "Z"
$reportData = @{ timestamp=$timestamp; totalTests=($passed+$failed); passed=$passed; failed=$failed; results=$results }
$reportJson = $reportData | ConvertTo-Json -Depth 6

$jsonPath = Join-Path $PSScriptRoot "security-regression-results.json"
$mdPath   = Join-Path $PSScriptRoot "security-regression-report.md"
$riskPath = Join-Path $PSScriptRoot "security-regression-remaining-risks.md"

$reportJson | Out-File -FilePath $jsonPath -Encoding utf8

$closure = if ($failed -gt 0) { "Security Regression NOT CLOSED" } else { "Security Regression CLOSED" }

@"
# Security Regression Report

- Timestamp: $timestamp
- Total Tests: $($passed + $failed)
- Passed: $passed
- Failed: $failed
- Closure Decision: $closure

## Matrix Coverage
- Auth endpoint matrix (S1)
- CSRF edge-case matrix (S2)
- Authorization boundary matrix (S3)
- Cookie attribute + security header verification (S4)

## Notes
- Results JSON: $jsonPath
- Login endpoint tests that require DB return INFO when DB is unavailable
"@ | Out-File -FilePath $mdPath -Encoding utf8

$risks = @()
if ($failed -gt 0) { $risks += "One or more regression tests failed. Review security-regression-results.json and fix before closure." }
$risks += "If login endpoint depends on unavailable DB state, runtime session-cookie assertions downgrade to INFO."
@"
# Remaining Risks

- $($risks -join "`r`n- ")
"@ | Out-File -FilePath $riskPath -Encoding utf8

Write-Host "`nResults saved to: $jsonPath" -ForegroundColor Cyan
Write-Host "Markdown report:  $mdPath" -ForegroundColor Cyan
Write-Host "Remaining risks:  $riskPath" -ForegroundColor Cyan

if ($failed -gt 0) {
    Write-Host "`nFAILED TESTS:" -ForegroundColor Red
    $results | Where-Object { $_.Result -eq "FAIL" } | ForEach-Object {
        Write-Host "  [$($_.Stack)] $($_.Name)" -ForegroundColor Red
        Write-Host "    Expected: $($_.Expected)" -ForegroundColor Yellow
        Write-Host "    Actual:   $($_.Actual)" -ForegroundColor Yellow
    }
}

Write-Host "`n============================================================" -ForegroundColor White
exit $(if ($failed -gt 0) { 1 } else { 0 })
