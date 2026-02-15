# Running the Clinical Trial Control Tower

> Step-by-step instructions for running the application locally on Windows, with Docker, or in the cloud.

---

## Prerequisites

| Tool | Version | Check Command | Install |
|------|---------|---------------|---------|
| Python | 3.10+ | `python --version` | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | `npm --version` | Comes with Node.js |
| Docker *(optional)* | 24+ | `docker --version` | [docker.com](https://www.docker.com/products/docker-desktop/) |

---

## Option 1: PowerShell Startup Scripts (Recommended for Windows)

The project includes ready-made PowerShell scripts that handle dependency installation, suppress false error messages, and start the services cleanly.

### Method A: Two Terminals (Most Reliable)

Open **Terminal 1** (backend):

```powershell
cd clinical-trial-tower
.\start-backend.ps1
```

Open **Terminal 2** (frontend):

```powershell
cd clinical-trial-tower
.\start-frontend.ps1
```

### Method B: Single Terminal (Both Services)

```powershell
cd clinical-trial-tower
.\start.ps1
```

This script:
1. Checks that Python and Node.js are installed
2. Installs Python dependencies (`pip install -r backend/requirements.txt`)
3. Installs Node dependencies (`npm install`)
4. Starts the backend API as a background job on port 8000
5. Starts the frontend dev server as a background job on port 5173
6. Streams logs from both services
7. Cleans up both services on `Ctrl+C`

### What You Should See

After starting, open your browser to:

| Service | URL | What It Shows |
|---------|-----|--------------|
| **Frontend** | http://localhost:5173 | The Control Tower UI |
| **Backend API** | http://localhost:8000 | Raw JSON (health check) |
| **API Docs** | http://localhost:8000/docs | Interactive Swagger docs |

The frontend connects to the backend via Vite's built-in proxy (configured in `frontend/vite.config.ts`), so all `/api/*` requests from the browser are automatically forwarded to port 8000.

---

## Option 2: Manual Commands (Any OS)

If you prefer running commands directly instead of using the scripts:

### Step 1: Install Backend Dependencies

```bash
cd clinical-trial-tower
pip install -r backend/requirements.txt
```

### Step 2: Start the Backend

```bash
cd clinical-trial-tower
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

> **Windows Note**: PowerShell displays uvicorn's log output in red because uvicorn writes to stderr. This is cosmetic -- the server is running correctly. The `start-backend.ps1` script suppresses this with `*>&1`.

### Step 3: Verify the Backend

Open a new terminal and run:

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:8000/healthz"

# Or with curl
curl http://localhost:8000/healthz
```

Expected response:

```json
{
    "status": "ok",
    "timestamp": "2026-02-15T12:26:37.221373",
    "agents": 6
}
```

### Step 4: Install Frontend Dependencies

```bash
cd clinical-trial-tower/frontend
npm install
```

### Step 5: Start the Frontend

```bash
cd clinical-trial-tower/frontend
npm run dev
```

You should see:

```
  VITE v6.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://0.0.0.0:5173/
```

### Step 6: Open the Application

Navigate to **http://localhost:5173** in your browser.

---

## Option 3: Docker Compose

If you have Docker installed, this is the simplest option -- no Python or Node installation needed on your machine.

```bash
cd clinical-trial-tower
docker compose up --build
```

This builds two containers:
- `api` -- Python backend on port 8000
- `web` -- React frontend on port 5173

To stop:

```bash
docker compose down
```

---

## Option 4: Cloud Deployment

### Render.com (Free Tier)

1. Push your code to GitHub
2. Go to [render.com/deploy](https://render.com/deploy)
3. Connect your GitHub repository
4. Select the `clinical-trial-tower` directory
5. Render auto-detects the `render.yaml` blueprint and deploys two services

### Fly.io

```bash
cd clinical-trial-tower
flyctl launch --config fly.toml
flyctl deploy
```

### Railway

1. Connect your GitHub repo at [railway.app](https://railway.app)
2. Railway auto-detects the Dockerfile and deploys

---

## Verifying the Full Stack

Once both backend and frontend are running, verify everything works:

### 1. Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/healthz"
```

Expected: `{ "status": "ok", "agents": 6 }`

### 2. Study KPIs

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/study/kpis" | ConvertTo-Json
```

Expected: JSON with `enrollment_pct`, `active_sites`, `protocol`, etc.

### 3. Agent List

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/agents" | ConvertTo-Json -Depth 3
```

Expected: Array of 6 agents (Maestro, Atlas, Pioneer, Navigator, Sentinel, Compass)

### 4. Query an Agent

```powershell
$body = @{ query = "What is the enrollment status?"; study_id = "default" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/agents/query" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```

Expected: Agent response with `agent_name`, `response`, `confidence`, `recommendations`

### 5. Frontend UI

Open http://localhost:5173 in your browser. You should see:

- Header with study info (NSCLC-BRX-4821-PhaseIII-593)
- KPI strip showing 7 metric cards
- Agent Mission Control stream on the left
- Trial timeline, enrollment chart, and risk radar in the main area
- Press **Ctrl+K** to open the Command Palette

---

## Troubleshooting

### "Red error text" in PowerShell

**Not a real error.** PowerShell shows any stderr output in red. Both uvicorn and Vite write informational logs to stderr. The `start-backend.ps1` and `start-frontend.ps1` scripts suppress this with the `*>&1` redirect.

### Port already in use

If port 8000 or 5173 is occupied:

```powershell
# Find what's using the port
netstat -ano | findstr :8000

# Kill it by PID
taskkill /PID <pid> /F
```

Or use a different port:

```bash
# Backend on port 8001
python -m uvicorn backend.main:app --port 8001

# Frontend on port 3000 (update vite.config.ts proxy too)
npx vite --port 3000
```

### Module not found errors (Python)

Make sure you run the backend from the `clinical-trial-tower/` directory, not from `backend/`:

```bash
# Correct (from clinical-trial-tower/)
cd clinical-trial-tower
python -m uvicorn backend.main:app --port 8000

# Wrong (from backend/)
cd clinical-trial-tower/backend
python -m uvicorn main:app --port 8000  # Will fail with import errors
```

### npm install fails

Clear the cache and retry:

```bash
cd clinical-trial-tower/frontend
rm -rf node_modules package-lock.json
npm install
```

### Frontend shows "Network Error" or blank data

The backend must be running first. The frontend proxies `/api/*` requests to `http://localhost:8000`. If the backend is not running, API calls will fail silently.

1. Start the backend first
2. Verify with `curl http://localhost:8000/healthz`
3. Then start the frontend

### Docker build fails

Make sure Docker Desktop is running, then:

```bash
cd clinical-trial-tower
docker compose build --no-cache
docker compose up
```

---

## Regenerating Test Data

The data manufacturing module generates synthetic data from a seed. To get fresh data:

### Via API (while running)

```powershell
# New random seed
Invoke-RestMethod -Uri "http://localhost:8000/api/data/regenerate?seed=99" -Method POST

# Back to default
Invoke-RestMethod -Uri "http://localhost:8000/api/data/regenerate?seed=42" -Method POST
```

### Via Python (standalone)

```bash
cd clinical-trial-tower
python test_backend.py
```

This validates the full data manufacturing module and all 6 agents, printing a summary of the generated study.

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start backend | `cd clinical-trial-tower; .\start-backend.ps1` |
| Start frontend | `cd clinical-trial-tower; .\start-frontend.ps1` |
| Start both | `cd clinical-trial-tower; .\start.ps1` |
| Start with Docker | `cd clinical-trial-tower; docker compose up --build` |
| Run backend tests | `cd clinical-trial-tower; python test_backend.py` |
| Build frontend | `cd clinical-trial-tower/frontend; npm run build` |
| Check health | `curl http://localhost:8000/healthz` |
| Open API docs | http://localhost:8000/docs |
| Open the UI | http://localhost:5173 |
| Talk to agents | Press **Ctrl+K** in the UI |
