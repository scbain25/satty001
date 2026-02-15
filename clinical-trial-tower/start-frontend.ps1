# Start the Clinical Trial Control Tower Frontend
# Run this in a SECOND terminal: .\start-frontend.ps1

$ErrorActionPreference = "SilentlyContinue"
$root = $PSScriptRoot
Set-Location "$root\frontend"

Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
npm install --silent 2>$null

Write-Host ""
Write-Host "Starting frontend on http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+K in the browser to talk to agents!" -ForegroundColor Green
Write-Host ""

npx vite --host 0.0.0.0 *>&1
