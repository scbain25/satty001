from typing import Dict, Any, List
import math

def build_features(opportunity: Dict[str, Any], signals: List[Dict[str, Any]] | None = None) -> Dict[str, float]:
    d = opportunity.get("data", {})
    f: Dict[str, float] = {}
    f["distance_km"] = float(d.get("distance_km")) if d.get("distance_km") is not None else float("nan")
    f["store_type_chain"] = 1.0 if d.get("store_type") in {"CVS","WAG","WMT"} else 0.0
    f["dispense_fee"] = (d.get("known_dispense_fee_cents") or 0)/100.0
    f["tpa_fee"] = (d.get("known_tpa_fee_cents") or 0)/100.0
    
    # Realistic data completeness calculation
    # Based on what data we have: distance, fees, EMR, store type
    completeness = 0.0
    if not math.isnan(f["distance_km"]):
        completeness += 0.30  # Distance data available
    if f["dispense_fee"] > 0:
        completeness += 0.25  # Dispense fee known
    if f["tpa_fee"] > 0:
        completeness += 0.20  # TPA fee known
    if d.get("emr"):
        completeness += 0.15  # EMR system known
    if d.get("store_type"):
        completeness += 0.10  # Store type known
    
    f["data_completeness"] = min(1.0, completeness)  # Cap at 100%
    return f
