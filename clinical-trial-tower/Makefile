.PHONY: dev api web build clean test

# ─── Development ──────────────────────────────────────────────

dev: api web  ## Start both API and frontend in development mode
	@echo "Starting development servers..."

api:  ## Start FastAPI backend
	cd backend && pip install -r requirements.txt && cd .. && \
	uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

web:  ## Start React frontend
	cd frontend && npm install && npm run dev

# ─── Docker ───────────────────────────────────────────────────

build:  ## Build Docker containers
	docker compose build

up:  ## Start Docker containers
	docker compose up -d

down:  ## Stop Docker containers
	docker compose down

logs:  ## View container logs
	docker compose logs -f

# ─── Setup ────────────────────────────────────────────────────

setup:  ## First-time setup
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

# ─── Quality ──────────────────────────────────────────────────

test-api:  ## Test API endpoints
	curl -s http://localhost:8000/healthz | python -m json.tool
	curl -s http://localhost:8000/api/study/kpis | python -m json.tool
	curl -s http://localhost:8000/api/agents | python -m json.tool

clean:  ## Clean build artifacts
	rm -rf frontend/dist frontend/node_modules backend/__pycache__

help:  ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
