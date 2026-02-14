from fastapi import APIRouter

router = APIRouter()

@router.get("/model-card")
def model_card():
    return {
        "name": "Go-Live Probability",
        "version": "v0-stub",
        "features": ["distance_km", "store_type_chain", "dispense_fee", "tpa_fee", "data_completeness"],
        "training_window": "stubbed for prototype",
        "metrics": {"auc": "n/a", "brier": "n/a"}
    }
