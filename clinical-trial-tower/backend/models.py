"""
Pydantic models for the Clinical Trial Control Tower.
Defines the complete data schema for studies, sites, countries, enrollment, and agent actions.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────

class StudyPhase(str, Enum):
    PHASE_I = "Phase I"
    PHASE_II = "Phase II"
    PHASE_III = "Phase III"
    PHASE_IV = "Phase IV"


class StudyStatus(str, Enum):
    PLANNING = "Planning"
    STARTUP = "Startup"
    ENROLLING = "Enrolling"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    CLOSED = "Closed"


class TherapeuticArea(str, Enum):
    ONCOLOGY = "Oncology"
    CARDIOLOGY = "Cardiology"
    NEUROLOGY = "Neurology"
    IMMUNOLOGY = "Immunology"
    RARE_DISEASE = "Rare Disease"
    INFECTIOUS_DISEASE = "Infectious Disease"
    ENDOCRINOLOGY = "Endocrinology"


class AgentType(str, Enum):
    MASTER = "master"
    COUNTRY_SITE = "country_site"
    FEASIBILITY_STARTUP = "feasibility_startup"
    PI_ENROLLMENT = "pi_enrollment"
    EXECUTION = "execution"
    REGULATORY = "regulatory"


class TaskType(str, Enum):
    DESCRIPTIVE = "descriptive"
    PREDICTIVE = "predictive"
    SIMULATIVE = "simulative"
    OPTIMIZATION = "optimization"
    GENERATIVE = "generative"
    AGENTIC = "agentic"


class Severity(str, Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    CRITICAL = "critical"


class SiteStatus(str, Enum):
    IDENTIFIED = "Identified"
    SELECTED = "Selected"
    ACTIVATED = "Activated"
    ENROLLING = "Enrolling"
    CLOSED = "Closed"


class CountryStatus(str, Enum):
    CANDIDATE = "Candidate"
    SELECTED = "Selected"
    REGULATORY_SUBMITTED = "Regulatory Submitted"
    APPROVED = "Approved"
    REJECTED = "Rejected"


# ─── Data Models ──────────────────────────────────────────────

class PrincipalInvestigator(BaseModel):
    id: str
    name: str
    institution: str
    country: str
    specialty: str
    h_index: int = Field(ge=0, le=150)
    trial_experience: int = Field(ge=0, description="Number of prior trials")
    enrollment_track_record: float = Field(ge=0, le=1, description="Historical enrollment hit rate")
    availability_score: float = Field(ge=0, le=1)


class Site(BaseModel):
    id: str
    name: str
    country_code: str
    country_name: str
    city: str
    pi: PrincipalInvestigator
    status: SiteStatus
    target_enrollment: int
    current_enrollment: int = 0
    screen_fail_rate: float = Field(ge=0, le=1)
    enrollment_rate_per_month: float = Field(ge=0)
    quality_score: float = Field(ge=0, le=100)
    activation_date: Optional[date] = None
    first_patient_in: Optional[date] = None
    protocol_deviations: int = 0
    adverse_events: int = 0
    lat: float = 0.0
    lon: float = 0.0


class Country(BaseModel):
    code: str
    name: str
    region: str
    regulatory_score: float = Field(ge=0, le=100)
    patient_pool_size: int
    prevalence_per_100k: float
    avg_approval_days: int
    cost_index: float = Field(ge=0, le=2, description="1.0 = baseline")
    infrastructure_score: float = Field(ge=0, le=100)
    status: CountryStatus
    sites_count: int = 0
    regulatory_submission_date: Optional[date] = None
    regulatory_approval_date: Optional[date] = None


class EnrollmentSnapshot(BaseModel):
    date: date
    screened: int
    screen_failed: int
    enrolled: int
    randomized: int
    completed: int
    discontinued: int
    target: int


class Milestone(BaseModel):
    id: str
    name: str
    category: str  # regulatory, enrollment, execution, data
    planned_date: date
    predicted_date: Optional[date] = None
    actual_date: Optional[date] = None
    status: str  # on_track, at_risk, delayed, completed
    confidence: float = Field(ge=0, le=1)
    owner_agent: AgentType


class RegulatoryDocument(BaseModel):
    id: str
    name: str
    doc_type: str  # IND, IB, CSR, ICF, protocol
    country: str
    status: str  # drafting, review, submitted, approved
    submission_date: Optional[date] = None
    approval_date: Optional[date] = None
    generated_by_agent: bool = False


class RiskItem(BaseModel):
    id: str
    category: str
    description: str
    probability: float = Field(ge=0, le=1)
    impact: str  # low, medium, high, critical
    mitigation: str
    owner_agent: AgentType
    status: str  # open, mitigated, escalated, closed


class AgentAction(BaseModel):
    id: str
    timestamp: datetime
    agent_type: AgentType
    agent_name: str
    task_type: TaskType
    title: str
    description: str
    severity: Severity
    data: Dict[str, Any] = {}
    human_action_required: bool = False
    human_response: Optional[str] = None
    confidence: float = Field(ge=0, le=1, default=0.85)


class SimulationScenario(BaseModel):
    id: str
    name: str
    description: str
    parameters: Dict[str, Any]
    outcome_enrollment_months: float
    outcome_total_cost: float
    outcome_probability_success: float
    created_by_agent: AgentType


class Study(BaseModel):
    id: str
    protocol_number: str
    name: str
    phase: StudyPhase
    therapeutic_area: TherapeuticArea
    indication: str
    molecule: str
    sponsor: str
    status: StudyStatus
    target_enrollment: int
    current_enrollment: int = 0
    countries: List[Country] = []
    sites: List[Site] = []
    enrollment_timeline: List[EnrollmentSnapshot] = []
    milestones: List[Milestone] = []
    regulatory_documents: List[RegulatoryDocument] = []
    risks: List[RiskItem] = []
    simulations: List[SimulationScenario] = []
    start_date: date
    estimated_primary_completion: date
    estimated_study_completion: date
    budget_total_usd: float
    budget_spent_usd: float = 0.0


# ─── API Request/Response Models ─────────────────────────────

class AgentQuery(BaseModel):
    query: str
    study_id: str
    context: Dict[str, Any] = {}


class AgentResponse(BaseModel):
    agent_type: AgentType
    agent_name: str
    response: str
    actions_taken: List[AgentAction] = []
    recommendations: List[str] = []
    data: Dict[str, Any] = {}
    confidence: float


class SimulationRequest(BaseModel):
    study_id: str
    scenario_name: str
    parameters: Dict[str, Any] = {}


class DashboardSummary(BaseModel):
    study: Study
    agent_actions: List[AgentAction]
    enrollment_forecast: List[EnrollmentSnapshot]
    top_risks: List[RiskItem]
    pending_human_actions: List[AgentAction]
    kpis: Dict[str, Any]
