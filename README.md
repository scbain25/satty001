# MacroHelix AI Implementation Prototype

## Quickstart, no Docker
1. Backend
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

2. Frontend
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

Open http://localhost:5173

## With Docker
```bash
docker compose up --build
```

## Cursor Agent prompts
- Bootstrap repo:
  - Create Python FastAPI service as in backend/app, expose endpoints in this README.
  - Replace stub scoring with LightGBM model trained on a synthetic dataset, keep the same API schema.
  - Add unit tests for services.features and services.scorer.
- Frontend enhancements:
  - Replace inline styles with Tailwind, add a Kanban view grouping by stage.
  - Add a form to create a new opportunity.
  - Add SHAP bar chart using top_factors when real model is wired.
- Data:
  - Create a script to generate 1k synthetic opportunities with realistic distributions and write them to a JSON file, then load into the in-memory repo on startup.

