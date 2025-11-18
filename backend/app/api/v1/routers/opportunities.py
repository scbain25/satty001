from fastapi import APIRouter
from typing import List, Dict, Any
from app.schemas import OpportunityIn, OpportunityCard
from app.services import repo, features, explain, scorer

router = APIRouter()

@router.get("", response_model=List[OpportunityCard])
def list_cards():
    repo.seed()
    cards = []
    for opp in repo.list_opportunities():
        X = features.build_features(opp, [])
        p, d, (p10,p50,p90) = scorer.score(X)
        tf = explain.top_five(X)
        cards.append({
            "id": opp["id"],
            "pharmacyName": opp["data"].get("pharmacy_name", opp["pharmacy_npi"]),
            "entityName": opp["covered_entity_id"],
            "stage": opp["status_stage"],
            "distanceKm": opp["data"].get("distance_km"),
            "pGoLive": p,
            "profitP10": p10,
            "profitP90": p90,
            "topFactors": tf,
            "dispenseFee": X.get("dispense_fee"),
            "tpaFee": X.get("tpa_fee"),
            "dataCompleteness": X.get("data_completeness")
        })
    return cards

@router.post("")
def create_opp(data: OpportunityIn):
    o = repo.create_opportunity(data.dict())
    return {"id": o["id"]}
