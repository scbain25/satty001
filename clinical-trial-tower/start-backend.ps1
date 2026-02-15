# Start the Clinical Trial Control Tower Backend
# Run this in one terminal: .\start-backend.ps1

$ErrorActionPreference = "SilentlyContinue"
$root = $PSScriptRoot
Set-Location $root

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r backend\requirements.txt --quiet 2>$null

Write-Host ""
Write-Host "Starting backend API on http://localhost:8000" -ForegroundColor Green
Write-Host "API docs at http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""

# Run uvicorn - redirect stderr to stdout so PowerShell doesn't show false errors
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 *>&1
