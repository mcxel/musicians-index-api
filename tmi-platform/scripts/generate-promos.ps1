# BerntoutGlobal XXL - Promo Code Generator
# Save as tmi-platform/scripts/generate-promos.ps1

param(
    [int]$Count = 10,
    [string]$Type = "FREE_TRIAL_DAYS",
    [int]$Value = 90,
    [int]$MaxUses = 1,
    [int]$DaysValid = 90,
    [string]$CreatedBy = "system"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Promo Code Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Helper function to generate random code
function Generate-RandomCode {
    $chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    $segments = @()
    
    for ($i = 0; $i -lt 4; $i++) {
        $segment = ""
        for ($j = 0; $j -lt 4; $j++) {
            $segment += $chars[(Get-Random -Maximum $chars.Length)]
        }
        $segments += $segment
    }
    
    return "BGX-" + ($segments -join "-")
}

# Helper function to hash code (simple hash for demo)
function Hash-Code {
    param([string]$Code)
    $hash = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Code)
    $hashed = $hash.ComputeHash($bytes)
    return [System.BitConverter]::ToString($hashed) -replace "-", ""
}

# Calculate expiration
$validFrom = Get-Date
$expiresAt = $validFrom.AddDays($DaysValid)

Write-Host "Generating $Count promo codes..." -ForegroundColor Yellow
Write-Host "  Type: $Type" -ForegroundColor Gray
Write-Host "  Value: $Value" -ForegroundColor Gray
Write-Host "  Max Uses: $MaxUses" -ForegroundColor Gray
Write-Host "  Valid for: $DaysValid days" -ForegroundColor Gray
Write-Host "  Created by: $CreatedBy" -ForegroundColor Gray
Write-Host ""

$codes = @()

for ($i = 0; $i -lt $Count; $i++) {
    $rawCode = Generate-RandomCode
    $codeHash = Hash-Code $rawCode
    
    $codeObj = @{
        id = [guid]::NewGuid().ToString()
        codeHash = $codeHash
        displayCode = $rawCode
        type = $Type
        value = $Value
        status = "ACTIVE"
        maxUses = $MaxUses
        usedCount = 0
        validFrom = $validFrom.ToString("yyyy-MM-ddTHH:mm:ssZ")
        expiresAt = $expiresAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
        createdBy = $CreatedBy
        createdAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
    
    $codes += $codeObj
    
    Write-Host "  Generated: $rawCode" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total codes: $($codes.Count)" -ForegroundColor White
Write-Host "Expires: $($expiresAt.ToString('yyyy-MM-dd'))" -ForegroundColor White
Write-Host ""

# Export to JSON
$outputFile = "promo-codes-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$codes | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile

Write-Host "Exported to: $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "NOTE: Save these codes! The display code is shown above." -ForegroundColor Yellow
Write-Host "The file only contains hashes for security." -ForegroundColor Yellow
Write-Host ""

# Show preview table
Write-Host "Code Preview (SAVE THESE):" -ForegroundColor Cyan
Write-Host "-" * 50
foreach ($code in $codes) {
    Write-Host $code.displayCode -ForegroundColor White
}
Write-Host "-" * 50
