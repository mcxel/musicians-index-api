# INFRASTRUCTURE SMOKE TEST SCRIPT
# Tests all infrastructure module APIs and persistence

Write-Host "=== INFRASTRUCTURE SMOKE TEST ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$results = @()

# Test 1: WillDoIt Dispatch Creation
Write-Host "[TEST 1] WillDoIt Dispatch Creation..." -ForegroundColor Yellow
try {
    $dispatchBody = @{
        requesterModule = "thunderworld"
        requestType = "construction"
        workerQuantityMode = "exact"
        workerTypes = @("electrician", "plumber")
        workerCount = 2
        location = "ThunderWorld Arena - Section B"
        urgency = "medium"
    notes = "Smoke test dispatch"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/dispatch/create" -Method POST -Body $dispatchBody -ContentType "application/json" -ErrorAction Stop
    
    if ($response.ok) {
        Write-Host "  ✅ PASS - Dispatch created: $($response.dispatch.requestId)" -ForegroundColor Green
        $results += @{ Test = "WillDoIt Dispatch"; Status = "PASS"; Id = $response.dispatch.requestId }
    } else {
        Write-Host "  ❌ FAIL - Response not OK" -ForegroundColor Red
        $results += @{ Test = "WillDoIt Dispatch"; Status = "FAIL"; Error = "Response not OK" }
    }
} catch {
    Write-Host "  ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Test = "WillDoIt Dispatch"; Status = "FAIL"; Error = $_.Exception.Message }
}

Write-Host ""

# Test 2: LLC Workforce Request
Write-Host "[TEST 2] LLC Workforce Funding Request..." -ForegroundColor Yellow
try {
    $workforceBody = @{
        requesterModule = "willdoit"
        requesterPerson = "Marcel Dickens"
        requestType = "contractor_payment"
        accountingCategory = "workforce"
        fundingSource = "operating_account"
        workerCount = 3
        estimatedCostLow = 5000
        estimatedCostHigh = 7500
        notes = "Smoke test workforce request"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/workforce/request" -Method POST -Body $workforceBody -ContentType "application/json" -ErrorAction Stop
    
    if ($response.ok) {
        Write-Host "  ✅ PASS - Workforce request created: $($response.request.requestId)" -ForegroundColor Green
        $results += @{ Test = "LLC Workforce"; Status = "PASS"; Id = $response.request.requestId }
    } else {
        Write-Host "  ❌ FAIL - Response not OK" -ForegroundColor Red
        $results += @{ Test = "LLC Workforce"; Status = "FAIL"; Error = "Response not OK" }
    }
} catch {
    Write-Host "  ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Test = "LLC Workforce"; Status = "FAIL"; Error = $_.Exception.Message }
}

Write-Host ""

# Test 3: Owner Dashboard Feed
Write-Host "[TEST 3] Owner Dashboard Feed Aggregation..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/owner-feed" -Method GET -ErrorAction Stop
    
    if ($response.ok -and $response.feed) {
        $feedCount = $response.feed.Count
        Write-Host "  ✅ PASS - Feed retrieved: $feedCount items" -ForegroundColor Green
        $results += @{ Test = "Owner Dashboard Feed"; Status = "PASS"; Count = $feedCount }
    } else {
        Write-Host "  ❌ FAIL - Feed not returned" -ForegroundColor Red
        $results += @{ Test = "Owner Dashboard Feed"; Status = "FAIL"; Error = "Feed not returned" }
    }
} catch {
    Write-Host "  ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Test = "Owner Dashboard Feed"; Status = "FAIL"; Error = $_.Exception.Message }
}

Write-Host ""

# Test 4: Verify Persistence Files Exist
Write-Host "[TEST 4] Verify Persistence Files..." -ForegroundColor Yellow
$persistenceFiles = @(
    "apps/willdoit/data/dispatch-records.json",
    "apps/willdoit/data/dispatch-events.json",
    "apps/bernoutglobal-llc/data/workforce-ledger.json",
    "apps/bernoutglobal-llc/data/workforce-requests.json"
)

$allExist = $true
foreach ($file in $persistenceFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file MISSING" -ForegroundColor Red
        $allExist = $false
    }
}

if ($allExist) {
    $results += @{ Test = "Persistence Files"; Status = "PASS" }
} else {
    $results += @{ Test = "Persistence Files"; Status = "FAIL"; Error = "Some files missing" }
}

Write-Host ""
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host ""

$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host "PASSED: $passCount" -ForegroundColor Green
Write-Host "FAILED: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "✅ ALL TESTS PASSED - Infrastructure Ready" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ SOME TESTS FAILED - Review errors above" -ForegroundColor Red
    exit 1
}
