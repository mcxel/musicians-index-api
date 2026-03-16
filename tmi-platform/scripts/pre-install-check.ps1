# BerntoutGlobal XXL - Pre-Install Dependency Check

# This script is intended to be run by the Inno Setup installer.
# It checks for critical dependencies.
# Exit 0 for success, Exit 1 for failure.

function Test-Python {
    try {
        $pythonVersion = python --version 2>&1
        if ($pythonVersion -match "Python 3\.(10|11|12)") {
            Write-Host "Success: Found compatible Python version ($pythonVersion)"
            return $true
        } else {
            Write-Host "Error: Found incompatible Python version ($pythonVersion). Version 3.10+ is required."
            return $false
        }
    }
    catch {
        Write-Host "Error: 'python' command not found. Please install Python 3.10+ and ensure it is in your PATH."
        return $false
    }
}

Write-Host "--- Running Pre-Install Checks ---"

if (Test-Python) {
    Write-Host "--- All checks passed! ---"
    exit 0
} else {
    Write-Host "--- Prerequisite check failed. ---"
    # The Inno Setup script will handle showing a message box.
    exit 1
}
