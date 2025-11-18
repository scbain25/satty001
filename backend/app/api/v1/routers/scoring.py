from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.schemas import ScoreOut
from app.services import repo, features, scorer, explain

router = APIRouter()

@router.post("/{opportunity_id}", response_model=ScoreOut)
def score_opportunity(opportunity_id: str):
    opp = repo.get_opportunity(opportunity_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    X = features.build_features(opp, [])
    p, days, (p10,p50,p90) = scorer.score(X)
    tf = explain.top_five(X)
    score = {
        "opportunity_id": opportunity_id,
        "scored_at": datetime.utcnow(),
        "model_version": "v0-stub",
        "p_go_live": p,
        "days_to_live": days,
        "profit_p10": p10,
        "profit_p50": p50,
        "profit_p90": p90,
        "top_factors": tf
    }
    repo.save_score(opportunity_id, score)
    return score
