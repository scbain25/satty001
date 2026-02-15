# Clinical Trial Control Tower

> A next-generation **Agentic AI platform** that demonstrates how 6 specialized AI agents could autonomously run a clinical trial end-to-end, with a human study coordinator providing oversight and complementary operational decisions.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLINICAL TRIAL CONTROL TOWER                      │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                   MASTER AGENT (Maestro)                       │  │
│  │        Orchestrates all specialists, cross-domain insights     │  │
│  └────────┬──────┬──────┬──────┬──────┬──────────────────────────┘  │
│           │      │      │      │      │                              │
│  ┌────────▼┐ ┌───▼────┐ ┌▼─────┐ ┌───▼──┐ ┌▼──────────┐           │
│  │  Atlas  │ │Pioneer │ │Navig.│ │Senti.│ │ Compass   │           │
│  │Country &│ │Feasib. │ │PI &  │ │Study │ │Regulatory │           │
│  │  Site   │ │Startup │ │Enroll│ │Exec. │ │Submission │           │
│  └─────────┘ └────────┘ └──────┘ └──────┘ └───────────┘           │
│                                                                      │
│  Each agent performs 6 task types:                                    │
│  [Descriptive] [Predictive] [Simulative]                             │
│  [Optimization] [Generative] [Agentic]                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │              DATA MANUFACTURING MODULE                         │  │
│  │   Synthetic clinical trial data generator for training/demo    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │              NEXT-GEN UI/UX EXPERIENCE                         │  │
│  │   [Agent Mission Control] [Trial Timeline] [Command Palette]  │  │
│  └────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The 6 Agents

| Agent | Codename | Role | Key Tasks |
|-------|----------|------|-----------|
| **Master Orchestrator** | Maestro | Coordinates all agents, synthesizes cross-domain insights | Study health summaries, completion forecasting, resource optimization, cross-agent coordination |
| **Country & Site Selection** | Atlas | Evaluates countries and selects optimal trial sites | Country scoring, site risk prediction, expansion simulations, portfolio optimization |
| **Feasibility & Startup** | Pioneer | Protocol feasibility analysis and study startup management | Complexity analysis, activation forecasting, readiness assessment, startup sequencing |
| **PI & Patient Enrollment** | Navigator | PI matching and patient recruitment strategy | Enrollment pulse, completion probability, recruitment simulations, PI optimization |
| **Study Execution** | Sentinel | Ongoing trial monitoring and quality assurance | Data quality dashboards, AE trend detection, monitoring optimization, deviation response |
| **Regulatory & Submissions** | Compass | Regulatory intelligence and document management | Landscape summaries, approval forecasting, document generation, compliance alerts |

---

## 6-Tier Task Taxonomy

Each agent can perform all 6 task types:

| Task Type | Question It Answers | Example |
|-----------|-------------------|---------|
| **Descriptive** | What happened? | "Study is at 65% enrollment with 28 active sites" |
| **Predictive** | What will happen? | "P(on-time completion) = 72%, 3 sites at risk" |
| **Simulative** | What could happen? | "Adding 5 sites in Germany: +3.8 months acceleration" |
| **Optimization** | What should we do? | "Close 2 underperforming sites, boost top 5 performers" |
| **Generative** | Create something | "Generated CTA packages for 10 countries" |
| **Agentic** | Do it autonomously | "Detected deviation cluster → auto-generated CAPA forms" |

---

## Data Manufacturing Module

The synthetic data generator (`backend/data_manufacturing/generator.py`) creates internally-consistent, realistic clinical trial data including:

- **Studies**: Phase I-IV with realistic parameters per phase
- **Countries**: 18 countries with calibrated regulatory scores, patient pools, cost indices
- **Sites**: 40-120 per study with geo-coded locations, PI profiles, quality metrics
- **Principal Investigators**: Region-appropriate names, h-indices, track records
- **Enrollment Timelines**: S-curve models with noise, screen-fail patterns
- **Milestones**: 14 standard milestones with predicted vs actual dates
- **Regulatory Documents**: Global + country-specific with status tracking
- **Risk Register**: Contextual risks with probability/impact scoring
- **Monte Carlo Simulations**: 5 scenario variants with cost/timeline/probability outcomes
- **Agent Action Stream**: 60+ realistic agent actions across all task types

All data is seeded for reproducibility and can be regenerated via API:
```bash
curl -X POST http://localhost:8000/api/data/regenerate?seed=123
```

---

## Next-Gen UI/UX Innovations

### Innovation 1: Agent Mission Control Stream
A real-time, Slack-like feed showing what each AI agent is thinking, deciding, and doing. Each agent has a distinct identity (icon, color, codename). Human coordinators can:
- Filter by agent or task type
- Expand any action for full details
- **Approve, Review, or Reject** actions requiring human oversight
- See confidence scores and severity indicators

### Innovation 2: Cinematic Trial Timeline
Not a boring Gantt chart. A horizontal gradient track with:
- **Pulsing "TODAY" marker** showing current position
- **Milestone dots** color-coded by status (completed/on-track/at-risk/delayed)
- **AI-predicted dates** shown as translucent extensions
- **Hover tooltips** with planned vs predicted vs actual dates
- **Confidence scores** per milestone

### Innovation 3: Spotlight Command Palette (Ctrl+K)
A Spotlight/CMD+K interface for natural language interaction:
- Type questions like *"What's our enrollment risk in Germany?"*
- Issue commands like *"Simulate adding 3 sites in Japan"*
- Queries are auto-routed to the most relevant specialist agent
- Responses include agent identity, confidence scores, and recommendations
- Suggested queries for quick access

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend API | Python + FastAPI | Agent system, data manufacturing, REST API |
| Frontend | React 18 + TypeScript | Next-gen UI components |
| Styling | Tailwind CSS 3 | Dark-mode-first design system |
| Charts | Recharts | Enrollment analytics, simulation comparison |
| Build | Vite | Fast dev server + production builds |
| Containers | Docker + docker-compose | Reproducible deployments |
| Cloud | Render / Fly.io / Railway | One-click cloud deployment |

---

## Quick Start

### Option 1: Docker (Recommended for Demo)

```bash
cd clinical-trial-tower
docker compose up --build
```
- API: http://localhost:8000
- UI: http://localhost:5173
- API Docs: http://localhost:8000/docs

### Option 2: Local Development

**Backend:**
```bash
cd clinical-trial-tower
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

**Frontend** (separate terminal):
```bash
cd clinical-trial-tower/frontend
npm install
npm run dev
```

### Option 3: Cloud Deployment

**Render.com** (free tier):
1. Push to GitHub
2. Go to https://render.com/deploy
3. Connect your repo, select the `clinical-trial-tower` directory
4. Render will auto-detect the `render.yaml` blueprint

**Fly.io**:
```bash
cd clinical-trial-tower
flyctl launch --config fly.toml
flyctl deploy
```

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/healthz` | GET | Health check |
| `/api/study` | GET | Full study data |
| `/api/study/kpis` | GET | Key performance indicators |
| `/api/agents` | GET | List all agents |
| `/api/agents/query` | POST | Natural language query to agents |
| `/api/agents/{type}/describe` | GET | Descriptive analytics |
| `/api/agents/{type}/predict` | GET | Predictive analytics |
| `/api/agents/{type}/simulate` | GET | Simulation results |
| `/api/agents/{type}/optimize` | GET | Optimization recommendations |
| `/api/agents/{type}/generate` | GET | Generated artifacts |
| `/api/agents/{type}/act` | GET | Autonomous actions |
| `/api/countries` | GET | Country data |
| `/api/sites` | GET | Site data |
| `/api/enrollment` | GET | Enrollment timeline + forecast |
| `/api/milestones` | GET | Study milestones |
| `/api/risks` | GET | Risk register |
| `/api/simulations` | GET | Simulation scenarios |
| `/api/agent-actions` | GET | Agent action stream |
| `/api/agent-actions/pending` | GET | Actions needing human review |
| `/api/data/regenerate` | POST | Regenerate all synthetic data |

Agent types: `master`, `country_site`, `feasibility_startup`, `pi_enrollment`, `execution`, `regulatory`

---

## Project Structure

```
clinical-trial-tower/
├── backend/
│   ├── agents/
│   │   ├── base_agent.py          # Abstract base with 6-task taxonomy
│   │   ├── master_agent.py        # Maestro - Master Orchestrator
│   │   ├── country_site_agent.py  # Atlas - Country & Site Selection
│   │   ├── feasibility_startup_agent.py  # Pioneer - Feasibility & Startup
│   │   ├── pi_enrollment_agent.py # Navigator - PI & Enrollment
│   │   ├── execution_agent.py     # Sentinel - Study Execution
│   │   └── regulatory_agent.py    # Compass - Regulatory & Submissions
│   ├── data_manufacturing/
│   │   └── generator.py           # Sophisticated synthetic data engine
│   ├── main.py                    # FastAPI application
│   ├── models.py                  # Pydantic data models
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentStream.tsx    # UX Innovation #1: Mission Control
│   │   │   ├── TrialTimeline.tsx  # UX Innovation #2: Cinematic Timeline
│   │   │   ├── CommandPalette.tsx # UX Innovation #3: Spotlight AI Chat
│   │   │   ├── EnrollmentChart.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── KPIStrip.tsx
│   │   │   ├── RiskRadar.tsx
│   │   │   ├── SimulationPanel.tsx
│   │   │   └── SiteMap.tsx
│   │   ├── hooks/useApi.ts
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
├── docker-compose.yml
├── render.yaml                    # Render.com one-click deploy
├── fly.toml                       # Fly.io deployment config
├── Makefile                       # Dev commands
└── README.md                      # This file
```

---

## Vision: Fully Agentic Clinical Trials

This prototype demonstrates how an AI-first approach could transform clinical trial management:

1. **From Reactive to Proactive**: Agents continuously monitor, predict, and act rather than waiting for human discovery of issues
2. **From Siloed to Orchestrated**: The Master Agent coordinates cross-domain responses (enrollment + regulatory + site management) in real-time
3. **From Manual to Autonomous**: Routine tasks (CAPA forms, safety reports, recruitment materials) are auto-generated with human approval
4. **From Dashboard to Conversation**: The Command Palette replaces traditional dashboards with natural language interaction
5. **From Historical to Predictive**: Every metric includes AI-predicted future states with confidence intervals

The human study coordinator acts as a **strategic overseer** - approving critical decisions, providing contextual judgment, and handling exceptions - while the agents handle the operational complexity of running a global clinical trial.
