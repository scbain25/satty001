from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class OpportunityIn(BaseModel):
    covered_entity_id: str
    pharmacy_npi: str
    tpa_vendor: Optional[str] = None
    emr: Optional[str] = None
    distance_km: Optional[float] = None
    store_type: Optional[str] = None
    known_dispense_fee_cents: Optional[int] = None
    known_tpa_fee_cents: Optional[int] = None

class Opportunity(BaseModel):
    id: str
    status_stage: str = "INTAKE"
    created_at: datetime
    updated_at: datetime
    data: OpportunityIn

class ScoreOut(BaseModel):
    opportunity_id: str
    scored_at: datetime
    model_version: str
    p_go_live: float
    days_to_live: int
    profit_p10: float
    profit_p50: float
    profit_p90: float
    top_factors: List[Dict[str, Any]]

class SandboxRequest(BaseModel):
    overrides: Dict[str, Any] = {}

class OpportunityCard(BaseModel):
    id: str
    pharmacyName: str
    entityName: str
    stage: str
    distanceKm: float | None = None
    pGoLive: float
    profitP10: float
    profitP90: float
    topFactors: List[Dict[str, Any]]
    dispenseFee: float | None = None
    tpaFee: float | None = None
    dataCompleteness: float | None = None
