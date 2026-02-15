"""
Clinical Trial Control Tower - FastAPI Application
Main entry point for the agentic AI platform.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional
from datetime import datetime
import os

from .models import (
    AgentQuery, AgentResponse, AgentType, TaskType, DashboardSummary,
    SimulationRequest, Study
)
from .agents import (
    MasterAgent, CountrySiteAgent, FeasibilityStartupAgent,
    PIEnrollmentAgent, ExecutionAgent, RegulatoryAgent
)
from .data_manufacturing import DataManufacturer

# ─── App Setup ────────────────────────────────────────────────

app = FastAPI(
    title="Clinical Trial Control Tower",
    description="Next-generation agentic AI platform for clinical trial management",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Initialize Components ───────────────────────────────────

data_manufacturer = DataManufacturer(seed=42)
demo_data = data_manufacturer.generate_full_demo()
study: Study = demo_data["study"]
agent_actions = demo_data["agent_actions"]
enrollment_forecast = demo_data["enrollment_forecast"]

# Agent Registry
agents = {
    AgentType.MASTER: MasterAgent(),
    AgentType.COUNTRY_SITE: CountrySiteAgent(),
    AgentType.FEASIBILITY_STARTUP: FeasibilityStartupAgent(),
    AgentType.PI_ENROLLMENT: PIEnrollmentAgent(),
    AgentType.EXECUTION: ExecutionAgent(),
    AgentType.REGULATORY: RegulatoryAgent(),
}


# ─── Health Check ─────────────────────────────────────────────

@app.get("/healthz")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat(), "agents": len(agents)}


# ─── Study Endpoints ──────────────────────────────────────────

@app.get("/api/study")
def get_study():
    """Get the current study overview."""
    return study.dict()


@app.get("/api/study/kpis")
def get_kpis():
    """Get key performance indicators for the study."""
    from .models import SiteStatus, CountryStatus
    enrolling_sites = [s for s in study.sites if s.status == SiteStatus.ENROLLING]
    total_rate = sum(s.enrollment_rate_per_month for s in enrolling_sites)
    enrollment_pct = round(study.current_enrollment / max(1, study.target_enrollment) * 100, 1)

    return {
        "enrollment_pct": enrollment_pct,
        "current_enrollment": study.current_enrollment,
        "target_enrollment": study.target_enrollment,
        "active_sites": len(enrolling_sites),
        "total_sites": len(study.sites),
        "approved_countries": len([c for c in study.countries if c.status == CountryStatus.APPROVED]),
        "total_countries": len(study.countries),
        "monthly_enrollment_rate": round(total_rate, 1),
        "budget_spent_pct": round(study.budget_spent_usd / max(1, study.budget_total_usd) * 100, 1),
        "budget_spent": study.budget_spent_usd,
        "budget_total": study.budget_total_usd,
        "open_risks": len([r for r in study.risks if r.status == "open"]),
        "milestones_completed": len([m for m in study.milestones if m.status == "completed"]),
        "total_milestones": len(study.milestones),
        "study_phase": study.phase.value,
        "therapeutic_area": study.therapeutic_area.value,
        "indication": study.indication,
        "molecule": study.molecule,
        "protocol": study.protocol_number,
        "sponsor": study.sponsor,
        "status": study.status.value,
    }


# ─── Agent Endpoints ─────────────────────────────────────────

@app.get("/api/agents")
def list_agents():
    """List all available agents and their capabilities."""
    return [
        {
            "type": agent.agent_type.value,
            "name": agent.name,
            "description": agent.description,
            "capabilities": ["descriptive", "predictive", "simulative", "optimization", "generative", "agentic"],
        }
        for agent in agents.values()
    ]


@app.post("/api/agents/query")
def query_agent(query: AgentQuery) -> AgentResponse:
    """
    Send a natural language query to the agent system.
    The Master Agent routes to the appropriate specialist.
    """
    # Determine which agent to use based on query context
    q = query.query.lower()

    target_agent = None
    if any(w in q for w in ["country", "site", "location", "geography"]):
        target_agent = agents[AgentType.COUNTRY_SITE]
    elif any(w in q for w in ["feasibility", "startup", "protocol", "readiness"]):
        target_agent = agents[AgentType.FEASIBILITY_STARTUP]
    elif any(w in q for w in ["pi", "investigator", "enrollment", "recruit", "patient"]):
        target_agent = agents[AgentType.PI_ENROLLMENT]
    elif any(w in q for w in ["execution", "quality", "deviation", "adverse", "safety", "monitoring"]):
        target_agent = agents[AgentType.EXECUTION]
    elif any(w in q for w in ["regulatory", "submission", "compliance", "fda", "ema", "approval"]):
        target_agent = agents[AgentType.REGULATORY]
    else:
        target_agent = agents[AgentType.MASTER]

    return target_agent.process_query(study, query.query)


@app.get("/api/agents/{agent_type}/describe")
def agent_describe(agent_type: str):
    """Get descriptive analytics from a specific agent."""
    at = _resolve_agent_type(agent_type)
    return agents[at].describe(study)


@app.get("/api/agents/{agent_type}/predict")
def agent_predict(agent_type: str):
    """Get predictive analytics from a specific agent."""
    at = _resolve_agent_type(agent_type)
    return agents[at].predict(study)


@app.get("/api/agents/{agent_type}/simulate")
def agent_simulate(agent_type: str):
    """Get simulation results from a specific agent."""
    at = _resolve_agent_type(agent_type)
    return agents[at].simulate(study)


@app.get("/api/agents/{agent_type}/optimize")
def agent_optimize(agent_type: str):
    """Get optimization recommendations from a specific agent."""
    at = _resolve_agent_type(agent_type)
    return agents[at].optimize(study)


@app.get("/api/agents/{agent_type}/generate")
def agent_generate(agent_type: str):
    """Get generated artifacts from a specific agent."""
    at = _resolve_agent_type(agent_type)
    return agents[at].generate(study)


@app.get("/api/agents/{agent_type}/act")
def agent_act(agent_type: str):
    """Trigger autonomous agent actions."""
    at = _resolve_agent_type(agent_type)
    return agents[at].act(study)


# ─── Data Endpoints ───────────────────────────────────────────

@app.get("/api/countries")
def get_countries():
    """Get all countries in the study."""
    return [c.dict() for c in study.countries]


@app.get("/api/sites")
def get_sites():
    """Get all sites in the study."""
    return [s.dict() for s in study.sites]


@app.get("/api/enrollment")
def get_enrollment():
    """Get enrollment timeline data."""
    return {
        "history": [e.dict() for e in study.enrollment_timeline],
        "forecast": [e.dict() for e in enrollment_forecast],
    }


@app.get("/api/milestones")
def get_milestones():
    """Get study milestones."""
    return [m.dict() for m in study.milestones]


@app.get("/api/risks")
def get_risks():
    """Get risk register."""
    return [r.dict() for r in study.risks]


@app.get("/api/regulatory")
def get_regulatory():
    """Get regulatory documents."""
    return [d.dict() for d in study.regulatory_documents]


@app.get("/api/simulations")
def get_simulations():
    """Get simulation scenarios."""
    return [s.dict() for s in study.simulations]


@app.get("/api/agent-actions")
def get_agent_actions(
    limit: int = Query(default=30, ge=1, le=100),
    agent_type: Optional[str] = None,
    task_type: Optional[str] = None,
):
    """Get the agent action stream with optional filters."""
    actions = agent_actions

    if agent_type:
        actions = [a for a in actions if a.agent_type.value == agent_type]
    if task_type:
        actions = [a for a in actions if a.task_type.value == task_type]

    # Return most recent first
    sorted_actions = sorted(actions, key=lambda a: a.timestamp, reverse=True)[:limit]
    return [a.dict() for a in sorted_actions]


@app.get("/api/agent-actions/pending")
def get_pending_actions():
    """Get actions requiring human review."""
    pending = [a for a in agent_actions if a.human_action_required and not a.human_response]
    return [a.dict() for a in sorted(pending, key=lambda a: a.timestamp, reverse=True)]


# ─── Data Manufacturing Endpoint ─────────────────────────────

@app.post("/api/data/regenerate")
def regenerate_data(seed: int = Query(default=42)):
    """Regenerate all synthetic data with a new seed."""
    global study, agent_actions, enrollment_forecast, data_manufacturer, demo_data

    data_manufacturer = DataManufacturer(seed=seed)
    demo_data = data_manufacturer.generate_full_demo()
    study = demo_data["study"]
    agent_actions = demo_data["agent_actions"]
    enrollment_forecast = demo_data["enrollment_forecast"]

    return {"status": "regenerated", "seed": seed, "study_id": study.id}


# ─── Helpers ──────────────────────────────────────────────────

def _resolve_agent_type(agent_type: str) -> AgentType:
    try:
        return AgentType(agent_type)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Unknown agent type: {agent_type}")


# ─── Serve Frontend (production) ──────────────────────────────

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
