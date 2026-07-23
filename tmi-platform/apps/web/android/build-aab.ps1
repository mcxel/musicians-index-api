Write-Host "=== TMI Android AAB Build Script (PowerShell) ==="
Write-Host "Cleaning previous build artifacts..."
.\gradlew.bat clean

Write-Host "Building Release App Bundle (versionCode 9, versionName 1.0.9)..."
.\gradlew.bat bundleRelease

Write-Host "Build complete! Your signed .aab file is located at:" -ForegroundColor Green
Write-Host "app/build/outputs/bundle/release/app-release.aab" -ForegroundColor Green
