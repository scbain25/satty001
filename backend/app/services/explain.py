from typing import Dict, Any, List

def top_five(X: Dict[str, float]) -> List[Dict[str, Any]]:
    # naive readable factors for prototype
    factors = []
    if X.get("distance_km") and X["distance_km"] > 20:
        factors.append({"name": "distance_km", "readable": "Long distance to entity"})
    if X.get("dispense_fee", 0) > 6.0:
        factors.append({"name": "dispense_fee", "readable": "High dispense fee"})
    if X.get("store_type_chain", 0) == 1.0:
        factors.append({"name": "store_type_chain", "readable": "Chain store familiarity"})
    if X.get("data_completeness", 0) < 0.5:
        factors.append({"name": "data_completeness", "readable": "Low data completeness"})
    if not factors:
        factors.append({"name": "baseline", "readable": "No major risks detected"})
    return factors[:5]
