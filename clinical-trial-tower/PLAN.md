# Clinical Trial Control Tower - Complete Solution Plan

> **Vision**: Build a next-generation Agentic AI platform that could fully run a clinical trial end-to-end, with a human study coordinator providing strategic oversight.

---

## 1. Problem Statement

Running a global clinical trial today involves dozens of cross-functional teams, hundreds of manual handoffs, and siloed decision-making across country selection, site management, PI identification, patient enrollment, study execution, and regulatory submissions. A single Phase III oncology trial spans 10+ countries, 40+ sites, and costs $30M+ over 3-4 years. Most operational decisions are reactive: problems are discovered late, escalated slowly, and resolved manually.

**The question**: Could an entirely Agentic AI platform autonomously coordinate a clinical trial, with a human coordinator acting as a strategic overseer rather than a task executor?

---

## 2. Solution Architecture

### 2.1 High-Level Design

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      CLINICAL TRIAL CONTROL TOWER                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                     NEXT-GEN UI/UX LAYER                            │ │
│  │  [Agent Mission Control]  [Cinematic Timeline]  [Command Palette]   │ │
│  └───────────────────────────────┬─────────────────────────────────────┘ │
│                                  │ REST API                              │
│  ┌───────────────────────────────▼─────────────────────────────────────┐ │
│  │                     FASTAPI APPLICATION                              │ │
│  │  /api/study  /api/agents  /api/enrollment  /api/sites  /api/risks   │ │
│  └───────────────────────────────┬─────────────────────────────────────┘ │
│                                  │                                       │
│  ┌───────────────────────────────▼─────────────────────────────────────┐ │
│  │                    6-AGENT ORCHESTRATION LAYER                       │ │
│  │                                                                      │ │
│  │            ┌──────────────────────────────┐                          │ │
│  │            │   MAESTRO (Master Agent)      │                          │ │
│  │            │   Orchestrates + Synthesizes  │                          │ │
│  │            └──────┬──┬──┬──┬──┬───────────┘                          │ │
│  │                   │  │  │  │  │                                       │ │
│  │  ┌────────┐ ┌─────┴┐ ┌┴───┐ ┌┴────┐ ┌────┴──┐                      │ │
│  │  │ Atlas  │ │Pione.│ │Nav.│ │Sent.│ │Compas.│                      │ │
│  │  │Country │ │Feas. │ │PI &│ │Exec.│ │Regul. │                      │ │
│  │  │& Site  │ │Start.│ │Enr.│ │     │ │       │                      │ │
│  │  └────────┘ └──────┘ └────┘ └─────┘ └───────┘                      │ │
│  │                                                                      │ │
│  │  Each agent: [Descriptive] [Predictive] [Simulative]                 │ │
│  │              [Optimization] [Generative] [Agentic]                   │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                  │                                       │
│  ┌───────────────────────────────▼─────────────────────────────────────┐ │
│  │                 DATA MANUFACTURING MODULE                            │ │
│  │  Synthetic trial data: studies, countries, sites, PIs, enrollment,   │ │
│  │  milestones, risks, regulatory docs, simulations, agent actions      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                  CLOUD DEPLOYMENT LAYER                               │ │
│  │  [Docker + Compose]  [Render.yaml]  [Fly.toml]  [GitHub Actions]    │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Backend API | Python 3.12 + FastAPI | Async, type-safe, auto-generated OpenAPI docs |
| Data models | Pydantic v2 | Strict validation, serialization, schema generation |
| Agent framework | Custom Python classes | Full control over task taxonomy, no external LLM dependency for prototype |
| Frontend | React 18 + TypeScript | Component-based, type-safe, industry standard |
| Styling | Tailwind CSS 3 | Utility-first, dark-mode-first, rapid iteration |
| Charts | Recharts | Lightweight, composable, React-native charting |
| Build | Vite 6 | Sub-second HMR, fast production builds |
| Containers | Docker + docker-compose | Reproducible, cloud-portable |
| Cloud hosting | Render / Fly.io / Railway | Free-tier available, Git-integrated deployment |

---

## 3. The 6-Agent System

### 3.1 Agent Overview

| # | Agent | Codename | Scope | Color |
|---|-------|----------|-------|-------|
| 1 | **Master Orchestrator** | Maestro | Cross-domain coordination, study-level synthesis, resource allocation, multi-agent dispatch | Purple `#8b5cf6` |
| 2 | **Country & Site Selection** | Atlas | Country evaluation (regulatory, patient pool, cost), site identification, site portfolio management | Cyan `#06b6d4` |
| 3 | **Feasibility & Study Startup** | Pioneer | Protocol feasibility analysis, startup timeline management, site readiness assessment | Amber `#f59e0b` |
| 4 | **PI & Patient Enrollment** | Navigator | PI identification/matching, recruitment strategy, enrollment forecasting, screen-fail analysis | Emerald `#10b981` |
| 5 | **Study Execution** | Sentinel | Data quality monitoring, adverse event detection, protocol deviation response, monitoring optimization | Red `#ef4444` |
| 6 | **Regulatory & Submissions** | Compass | Regulatory intelligence, document generation, submission tracking, compliance monitoring | Pink `#ec4899` |

### 3.2 Agent Interaction Model

```
                    Human Study Coordinator
                           │
                    ┌──────▼──────┐
                    │   Maestro   │  ← Approvals, strategic decisions,
                    │   (Master)  │    contextual judgment
                    └──┬──┬──┬──┬─┘
                       │  │  │  │
              ┌────────┘  │  │  └────────┐
              │     ┌─────┘  └─────┐     │
          ┌───▼──┐ ┌▼────┐  ┌─────▼┐ ┌──▼───┐
          │Atlas │ │Pion.│  │Navig.│ │Sent. │ ┌───────┐
          │      │ │     │  │      │ │      │ │Compass│
          └──────┘ └─────┘  └──────┘ └──────┘ └───────┘
              ▲        ▲        ▲        ▲        ▲
              └────────┴────────┴────────┴────────┘
                     Cross-agent data sharing
```

**Flow**:
1. Specialist agents continuously monitor their domain and generate actions
2. Actions requiring human oversight are flagged with `human_action_required = true`
3. The Master Agent (Maestro) detects cross-domain issues and coordinates multi-agent responses
4. The human coordinator reviews, approves, or redirects via the Agent Stream or Command Palette
5. Agents autonomously execute routine tasks (CAPA forms, safety reports, documents)

### 3.3 The 6-Tier Task Taxonomy

Every agent implements all 6 task types. This taxonomy covers the full spectrum from passive observation to autonomous action:

| Tier | Task Type | Question | When Used | Example Output |
|------|-----------|----------|-----------|---------------|
| 1 | **Descriptive** | What happened? | Continuous monitoring, status reports, dashboards | "Study is at 38% enrollment (304/801) with 27 active sites across 5 approved countries" |
| 2 | **Predictive** | What will happen? | Risk scoring, timeline forecasting, trend detection | "P(on-time completion) = 72%. Site XYZ has 65% probability of underperformance" |
| 3 | **Simulative** | What could happen? | Scenario planning, Monte Carlo analysis, what-if modeling | "Adding 5 sites in Germany: median 3.8-month acceleration, cost +$1.5M, success 84% -> 91%" |
| 4 | **Optimization** | What should we do? | Resource allocation, sequencing, portfolio management | "Close 2 underperforming sites, redistribute targets to top 5. Net gain: +15 pts/month" |
| 5 | **Generative** | Create artifacts | Document drafting, report generation, material creation | "Generated IND Annual Safety Report covering 150 patients across 10 countries" |
| 6 | **Agentic** | Do it autonomously | Workflow triggers, escalations, corrective actions | "Detected deviation cluster -> auto-generated CAPA forms, notified sites, updated log" |

### 3.4 Detailed Agent Capabilities

#### Agent 1: Maestro (Master Orchestrator)

| Task Type | Capability |
|-----------|-----------|
| Descriptive | Daily study health summary aggregating KPIs across all domains |
| Predictive | Study completion forecast using enrollment velocity and site activation trends |
| Simulative | Multi-scenario comparison (baseline, accelerated, cost-optimized, risk-mitigated) |
| Optimization | Cross-domain resource allocation (budget, sites, countries) |
| Generative | Executive summary reports synthesizing insights from all 5 specialists |
| Agentic | Multi-agent coordination dispatching tasks to specialists for complex issues |

#### Agent 2: Atlas (Country & Site Selection)

| Task Type | Capability |
|-----------|-----------|
| Descriptive | Country performance scorecard (regulatory score, patient pool, cost index, infrastructure) |
| Predictive | Site activation delay prediction, site underperformance risk scoring |
| Simulative | Country/site expansion scenario analysis with Monte Carlo (10,000 iterations) |
| Optimization | Site portfolio optimization using multi-objective algorithm (rate, quality, cost) |
| Generative | Site selection reports, competitive landscape analysis, country dossiers |
| Agentic | Autonomous backup site identification when enrollment stalls detected |

#### Agent 3: Pioneer (Feasibility & Study Startup)

| Task Type | Capability |
|-----------|-----------|
| Descriptive | Protocol complexity scoring, startup progress tracking, readiness dashboards |
| Predictive | Site activation timeline forecasting with confidence intervals |
| Simulative | Protocol amendment impact analysis (patient pool, timeline, cost) |
| Optimization | Startup sequence optimization using critical path analysis |
| Generative | Feasibility questionnaires, PI qualification checklists, equipment matrices |
| Agentic | Automated site readiness assessment (READY/CONDITIONAL/NOT READY) with notifications |

#### Agent 4: Navigator (PI & Patient Enrollment)

| Task Type | Capability |
|-----------|-----------|
| Descriptive | Weekly enrollment pulse (screened, enrolled, screen-fail rate, PI track records) |
| Predictive | Bayesian enrollment completion probability, per-country velocity forecasts |
| Simulative | Recruitment strategy simulation (digital ads, PI referrals, EMR pre-screening) |
| Optimization | PI-site matching using multi-factor algorithm (h-index, experience, track record) |
| Generative | Localized recruitment materials (brochures, social media, referral letters) |
| Agentic | Enrollment stall detection -> auto-trigger PI calls, backup channels, forecast update |

#### Agent 5: Sentinel (Study Execution)

| Task Type | Capability |
|-----------|-----------|
| Descriptive | Data quality dashboard (completeness, query rate, deviations, adverse events) |
| Predictive | Adverse event trend detection, GCP finding risk prediction |
| Simulative | Protocol amendment operational impact (cost, dropout, timeline) |
| Optimization | Risk-based monitoring visit schedule (30% reduction, maintained quality) |
| Generative | DSMB reports, aggregate safety tables, interim analysis summaries |
| Agentic | Protocol deviation cluster detection -> auto-CAPA, corrective notices, log updates |

#### Agent 6: Compass (Regulatory & Submissions)

| Task Type | Capability |
|-----------|-----------|
| Descriptive | Regulatory landscape summary (approvals, pending, documents, compliance status) |
| Predictive | Regulatory approval timeline forecasting (ML model, 12,000+ historical submissions) |
| Simulative | Regulatory strategy simulation (sequential vs. parallel vs. hybrid submission) |
| Optimization | Submission sequencing optimization using critical path analysis |
| Generative | CTA packages, IND safety reports, protocol amendments, ICF revisions |
| Agentic | Regulatory guideline change detection -> impact assessment, amendment drafting, alerts |

---

## 4. Data Manufacturing Module

### 4.1 Purpose

The data manufacturing module generates sophisticated, internally-consistent synthetic clinical trial data. It serves three purposes:

1. **Training**: Provides realistic data to develop and test agent logic
2. **Demonstration**: Powers the live demo without requiring real clinical data
3. **Benchmarking**: Enables reproducible testing across configurations via seeded randomization

### 4.2 Data Model

```
Study
├── protocol_number, phase, therapeutic_area, indication, molecule, sponsor
├── status, target_enrollment, current_enrollment, budget
├── Countries[] (10)
│   ├── regulatory_score, patient_pool, avg_approval_days, cost_index
│   └── status (Candidate → Selected → Submitted → Approved)
├── Sites[] (45)
│   ├── city, country, lat/lon, status, quality_score
│   ├── enrollment_rate, screen_fail_rate, protocol_deviations
│   └── PrincipalInvestigator
│       ├── name, institution, specialty
│       └── h_index, trial_experience, enrollment_track_record
├── EnrollmentTimeline[] (monthly snapshots)
│   └── screened, enrolled, randomized, completed, discontinued, target
├── Milestones[] (14)
│   └── planned_date, predicted_date, actual_date, status, confidence
├── RegulatoryDocuments[] (36)
│   └── type, country, status, submission_date, generated_by_agent
├── Risks[] (6-12)
│   └── category, probability, impact, mitigation, owner_agent
└── Simulations[] (5 scenarios)
    └── parameters, outcome_months, outcome_cost, outcome_success_probability
```

### 4.3 Reference Data

The module contains curated reference data for realism:

- **18 countries** with calibrated regulatory scores, approval timelines, cost indices, and infrastructure ratings (US, UK, DE, FR, JP, AU, CA, BR, IN, KR, ES, PL, MX, ZA, IL, CN, IT, NL)
- **100+ cities** with real latitude/longitude coordinates
- **Region-appropriate PI names** (18 cultures) with institution name templates
- **7 therapeutic areas** with 3-5 indications each, including real prevalence rates
- **Risk templates** contextually populated with actual country/site names
- **S-curve enrollment models** calibrated to real-world enrollment patterns

### 4.4 Synthetic Data Characteristics

| Feature | Implementation |
|---------|---------------|
| **Enrollment curves** | Logistic S-curve with Gaussian noise, phase-dependent parameters |
| **Screen-fail rates** | Per-site rates 15-45%, correlated with indication complexity |
| **Milestone tracking** | 14 milestones with planned, predicted (AI), and actual dates |
| **Budget modeling** | $30K-$120K per patient, cost-adjusted by country, phase-dependent |
| **PI profiles** | h-index (8-65), trial experience (2-30), enrollment track record (40-95%) |
| **Regulatory timelines** | Country-calibrated approval days with stochastic delay modeling |
| **Reproducibility** | All randomization seeded; `seed=42` always produces identical data |
| **Regeneration** | API endpoint `POST /api/data/regenerate?seed=N` creates fresh data instantly |

### 4.5 Default Demo Configuration

The default demo generates a **Phase III Oncology** trial:

| Parameter | Value |
|-----------|-------|
| Protocol | NSCLC-BRX-4821-PhaseIII-593 |
| Indication | Non-Small Cell Lung Cancer |
| Molecule | BRX-4821 |
| Phase | Phase III |
| Countries | 10 |
| Sites | 45 |
| Target enrollment | 801 patients |
| Current enrollment | 304 (38%) |
| Active sites | 27 enrolling |
| Budget | $31.4M total, $12.8M spent |
| Milestones | 7/14 completed |
| Open risks | 3 |
| Agent actions | 60 |

---

## 5. Next-Gen UI/UX Experience

### 5.1 Design Philosophy

The UI breaks from the traditional "dashboard with charts" paradigm. Instead of presenting static data panels, it creates an experience where the human coordinator is a **participant in an intelligent system** -- observing agent reasoning, conversing with agents, and making strategic decisions.

**Design principles**:
- **Dark-mode first**: Deep navy/charcoal background (`#0a0e1a`) with glass-morphism cards
- **Agent identity**: Each agent has a distinct icon, color, and codename
- **Conversation over dashboards**: Natural language interaction replaces chart-staring
- **Action-oriented**: Every insight connects to an actionable decision
- **Confidence transparency**: Every AI output shows a confidence score

### 5.2 UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: Logo, Study Info, Live Status, Cmd+K, Pending Badge │
├──────────────────────────────────────────────────────────────┤
│  KPI STRIP: 7 metric cards with circular progress indicators │
├────────────┬─────────────────────────────────────────────────┤
│            │  TAB BAR: [Overview] [Sites & Countries] [Sims] │
│  AGENT     ├─────────────────────────────────────────────────┤
│  MISSION   │  TRIAL TIMELINE (horizontal, cinematic)         │
│  CONTROL   ├─────────────────────────────────────────────────┤
│  STREAM    │  ENROLLMENT CHART    │  RISK RADAR              │
│  (380px    │  (actuals + forecast)│  (register with severity)│
│  sticky)   │                      │                          │
│            │                      │                          │
└────────────┴──────────────────────┴──────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  COMMAND PALETTE (overlay, triggered by Ctrl+K)              │
│  [Search bar] + [Suggested queries] + [Conversation thread]  │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Innovation 1: Agent Mission Control Stream

**What it is**: A persistent left-panel feed (like Slack or a mission control log) showing real-time agent activities.

**Why it matters**: Instead of checking separate dashboards, the coordinator sees a unified stream of everything the AI system is doing -- decisions made, risks detected, documents generated, actions taken.

**Features**:
- Real-time scrolling feed of 60+ agent actions
- Each action shows: agent icon + color, task type badge, title, severity dot, confidence bar
- Filter chips to focus on a specific agent or task type
- Expandable cards revealing full description and reasoning
- **Approve / Review / Reject** buttons on actions requiring human oversight
- Amber highlight for pending human actions
- Sticky positioning so it remains visible while scrolling other content

### 5.4 Innovation 2: Cinematic Trial Timeline

**What it is**: A horizontal gradient timeline showing all 14 milestones with a pulsing "TODAY" marker.

**Why it matters**: Traditional Gantt charts are cluttered and static. This timeline shows at a glance where the trial is, what's on track, and where the AI predicts problems.

**Features**:
- Gradient progress track (blue) up to the current date
- Pulsing "TODAY" marker with animated ring
- Milestone dots color-coded: green (completed), blue (on-track), amber (at-risk), red (delayed)
- AI-predicted date offsets shown as translucent extensions from each milestone
- Hover tooltips with planned vs predicted vs actual dates, confidence scores, and owning agent
- Date range labels showing study start to estimated completion

### 5.5 Innovation 3: Spotlight Command Palette (Ctrl+K)

**What it is**: A Spotlight/CMD+K modal for natural language conversation with the agent system.

**Why it matters**: This replaces the "find the right dashboard" paradigm with "just ask." The coordinator types a question, and the system routes it to the most relevant agent, returning a structured response with confidence scores.

**Features**:
- Keyboard shortcut `Ctrl+K` to open/close
- Pre-populated suggested queries covering all task types
- Auto-routing: queries containing "enrollment" go to Navigator, "regulatory" goes to Compass, etc.
- Conversational thread showing user messages and agent responses
- Agent identity shown (icon, color, codename) in each response
- Confidence score per response
- Actionable recommendations listed below each response
- Agent icon strip at the bottom showing which agents are available

**Example queries**:
- "Show me the enrollment status" -> Navigator (Descriptive)
- "What is our biggest risk right now?" -> Maestro (Descriptive)
- "Predict when we will hit enrollment target" -> Navigator (Predictive)
- "Simulate adding 5 sites in Germany" -> Atlas (Simulative)
- "Optimize our site portfolio" -> Atlas (Optimization)
- "Generate a regulatory summary for FDA" -> Compass (Generative)

---

## 6. Cloud Deployment Strategy

### 6.1 Deployment Options

| Platform | Config File | Cost | Setup Complexity |
|----------|------------|------|-----------------|
| **Docker local** | `docker-compose.yml` | Free | `docker compose up --build` |
| **Render.com** | `render.yaml` | Free tier | Connect GitHub repo, auto-deploy |
| **Fly.io** | `fly.toml` | Free tier | `flyctl launch && flyctl deploy` |
| **Railway** | Auto-detect | Free tier | Connect GitHub, auto-detect |
| **GitHub Codespaces** | `.devcontainer/` | Free (60 hrs/mo) | Open in Codespace |

### 6.2 Production Architecture (Future)

For a production deployment, the architecture would extend to include:

```
[CDN / Vercel]  →  React Frontend
       │
[API Gateway]   →  FastAPI Backend (auto-scaling)
       │
[LLM Service]   →  GPT-4 / Claude for real NLU + generation
       │
[Vector DB]     →  Pinecone / Weaviate for document retrieval
       │
[PostgreSQL]    →  Persistent study data
       │
[Redis]         →  Agent action cache, real-time events
       │
[Kafka/SQS]     →  Agent event bus for async coordination
```

---

## 7. Project File Structure

```
clinical-trial-tower/
│
├── backend/
│   ├── agents/
│   │   ├── __init__.py                    # Agent registry
│   │   ├── base_agent.py                  # Abstract base with 6-task interface
│   │   ├── master_agent.py                # Maestro - Master Orchestrator
│   │   ├── country_site_agent.py          # Atlas - Country & Site Selection
│   │   ├── feasibility_startup_agent.py   # Pioneer - Feasibility & Startup
│   │   ├── pi_enrollment_agent.py         # Navigator - PI & Enrollment
│   │   ├── execution_agent.py             # Sentinel - Study Execution
│   │   └── regulatory_agent.py            # Compass - Regulatory & Submissions
│   ├── data_manufacturing/
│   │   ├── __init__.py
│   │   └── generator.py                   # Synthetic data engine (932 lines)
│   ├── api/
│   │   └── __init__.py
│   ├── __init__.py
│   ├── main.py                            # FastAPI app with 20+ endpoints
│   ├── models.py                          # 30+ Pydantic models
│   ├── requirements.txt                   # Python dependencies
│   └── Dockerfile                         # Container build
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentStream.tsx            # UX #1: Mission Control Stream
│   │   │   ├── TrialTimeline.tsx          # UX #2: Cinematic Timeline
│   │   │   ├── CommandPalette.tsx         # UX #3: Spotlight AI Chat
│   │   │   ├── EnrollmentChart.tsx        # Recharts enrollment analytics
│   │   │   ├── Header.tsx                 # Top bar with live status
│   │   │   ├── KPIStrip.tsx              # 7-card KPI strip
│   │   │   ├── RiskRadar.tsx             # Risk register panel
│   │   │   ├── SimulationPanel.tsx        # Monte Carlo scenario comparison
│   │   │   └── SiteMap.tsx               # Site/country explorer
│   │   ├── hooks/
│   │   │   └── useApi.ts                  # Fetch hooks + agent query hook
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript interfaces + constants
│   │   ├── App.tsx                        # Root layout with tab navigation
│   │   ├── main.tsx                       # React entry point
│   │   ├── index.css                      # Tailwind + custom animations
│   │   └── vite-env.d.ts
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts                     # Vite + API proxy config
│   ├── tailwind.config.js                 # Custom colors, animations
│   ├── postcss.config.js
│   └── Dockerfile
│
├── docker-compose.yml                     # Local multi-container orchestration
├── render.yaml                            # Render.com deployment blueprint
├── fly.toml                               # Fly.io deployment config
├── Makefile                               # Dev convenience commands
├── start.ps1                              # Windows: start both services
├── start-backend.ps1                      # Windows: start backend only
├── start-frontend.ps1                     # Windows: start frontend only
├── test_backend.py                        # Backend validation script
├── PLAN.md                                # This file
├── RUNNING.md                             # Setup and run instructions
└── README.md                              # Project overview
```

---

## 8. API Reference

### 8.1 Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /healthz` | GET | Health check (returns agent count) |
| `GET /api/study` | GET | Full study object with all nested data |
| `GET /api/study/kpis` | GET | Flat KPI object for dashboard cards |

### 8.2 Agent Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/agents` | GET | List all 6 agents with capabilities |
| `POST /api/agents/query` | POST | Natural language query routed to best agent |
| `GET /api/agents/{type}/describe` | GET | Descriptive analytics from specific agent |
| `GET /api/agents/{type}/predict` | GET | Predictive analytics from specific agent |
| `GET /api/agents/{type}/simulate` | GET | Simulation results from specific agent |
| `GET /api/agents/{type}/optimize` | GET | Optimization recommendations from specific agent |
| `GET /api/agents/{type}/generate` | GET | Generated artifacts from specific agent |
| `GET /api/agents/{type}/act` | GET | Autonomous actions from specific agent |

Agent types: `master`, `country_site`, `feasibility_startup`, `pi_enrollment`, `execution`, `regulatory`

### 8.3 Data Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/countries` | GET | All countries with regulatory/cost data |
| `GET /api/sites` | GET | All sites with PI, enrollment, quality data |
| `GET /api/enrollment` | GET | Historical timeline + AI forecast |
| `GET /api/milestones` | GET | 14 milestones with status and dates |
| `GET /api/risks` | GET | Risk register with probability/impact |
| `GET /api/regulatory` | GET | Regulatory documents with status |
| `GET /api/simulations` | GET | 5 Monte Carlo scenario outputs |
| `GET /api/agent-actions` | GET | Agent action stream (filterable) |
| `GET /api/agent-actions/pending` | GET | Actions requiring human review |
| `POST /api/data/regenerate?seed=N` | POST | Regenerate all data with new seed |

---

## 9. What the Human Coordinator Does

In this agentic model, the human study director/coordinator shifts from task executor to strategic overseer:

| Traditional Role | Agentic Role |
|-----------------|-------------|
| Manually check enrollment spreadsheets | Review enrollment forecasts with confidence intervals |
| Email sites about protocol deviations | Approve auto-generated CAPA forms |
| Build PowerPoint status reports | Review AI-generated executive summaries |
| Reactively discover site issues | Receive proactive risk alerts from agents |
| Manually evaluate country options | Review agent-optimized country/site portfolios |
| Track regulatory deadlines in spreadsheets | Receive automated regulatory intelligence alerts |
| Coordinate cross-functional meetings | Review Maestro's multi-agent coordination plans |

The UI surfaces **only the decisions that need human judgment** -- everything else runs autonomously.

---

## 10. Future Enhancements

| Enhancement | Description |
|------------|-------------|
| **Real LLM integration** | Replace rule-based agent logic with GPT-4/Claude for true NLU and generation |
| **Real-time WebSocket** | Stream agent actions to the UI in real-time instead of polling |
| **Persistent database** | PostgreSQL for study data, agent action history |
| **Multi-study support** | Control tower managing a portfolio of trials simultaneously |
| **Document viewer** | Inline preview of AI-generated regulatory documents |
| **Approval workflows** | Structured approval chains with audit trails |
| **Email/Slack integration** | Agent notifications sent to external channels |
| **Historical analytics** | Learning from past trials to improve predictions |
| **RBAC** | Role-based access (medical monitor, CRA, regulatory, sponsor) |
| **Audit trail** | Full traceability of every agent decision and human action |
