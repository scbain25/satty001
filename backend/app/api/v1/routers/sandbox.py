from fastapi import APIRouter, HTTPException
from app.schemas import SandboxRequest
from app.services import repo, features, scorer, explain

router = APIRouter()

@router.post("/score/{opportunity_id}")
def sandbox_score(opportunity_id: str, req: SandboxRequest):
    opp = repo.get_opportunity(opportunity_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    X = features.build_features(opp, [])
    X.update({k:v for k,v in req.overrides.items()})
    p, d, (p10,p50,p90) = scorer.score(X)
    tf = explain.top_five(X)
    return {"p_go_live": p, "days_to_live": d, "profit_p10": p10, "profit_p50": p50, "profit_p90": p90, "top_factors": tf}
