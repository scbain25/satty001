# Clinical Trial Control Tower - Startup Script for Windows
# Usage: .\start.ps1
# This starts both the backend API and frontend dev server.

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Clinical Trial Control Tower" -ForegroundColor Cyan
Write-Host "  Starting services..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

# Check Python
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "[ERROR] Python not found. Please install Python 3.10+." -ForegroundColor Red
    exit 1
}

# Check Node
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "[ERROR] Node.js not found. Please install Node.js 18+." -ForegroundColor Red
    exit 1
}

# Install Python deps
Write-Host "[1/4] Installing Python dependencies..." -ForegroundColor Yellow
pip install -r "$root\backend\requirements.txt" --quiet 2>$null
Write-Host "       Done." -ForegroundColor Green

# Install Node deps
Write-Host "[2/4] Installing Node dependencies..." -ForegroundColor Yellow
Push-Location "$root\frontend"
npm install --silent 2>$null
Pop-Location
Write-Host "       Done." -ForegroundColor Green

# Start backend
Write-Host "[3/4] Starting backend API on http://localhost:8000 ..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 2>&1
} -ArgumentList $root
Write-Host "       Backend started (Job ID: $($backendJob.Id))." -ForegroundColor Green

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start frontend
Write-Host "[4/4] Starting frontend on http://localhost:5173 ..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location "$dir\frontend"
    npx vite --host 0.0.0.0 2>&1
} -ArgumentList $root
Write-Host "       Frontend started (Job ID: $($frontendJob.Id))." -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  All services running!" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "  Press Ctrl+K in the UI to talk to agents" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Yellow

# Keep script alive and stream logs
try {
    while ($true) {
        # Stream backend logs
        Receive-Job -Job $backendJob -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "[API] $_" -ForegroundColor DarkGray
        }
        # Stream frontend logs
        Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "[WEB] $_" -ForegroundColor DarkGray
        }
        Start-Sleep -Milliseconds 500
    }
}
finally {
    Write-Host ""
    Write-Host "Stopping services..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -Force -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -Force -ErrorAction SilentlyContinue
    Write-Host "All services stopped." -ForegroundColor Green
}
