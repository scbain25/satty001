from typing import Dict, Any
import math, random

def score(X: Dict[str, float]) -> tuple[float, int, tuple[float,float,float]]:
    # Realistic scoring model based on pharmacy characteristics
    base = 0.55  # Base probability
    
    # Distance impact: closer is better, exponential decay
    if not math.isnan(X.get("distance_km", float("nan"))):
        distance_penalty = min(X["distance_km"] / 50.0, 0.35)  # Max 35% penalty for very far
        base -= distance_penalty
    
    # Fee impact: lower fees are better, but less impact than distance
    dispense_fee = X.get("dispense_fee", 0)
    fee_penalty = max((dispense_fee - 3.0) * 0.04, 0)  # Penalty starts at $3.00
    base -= min(fee_penalty, 0.15)  # Max 15% penalty for high fees
    
    # Chain stores have better infrastructure and relationships
    if X.get("store_type_chain", 0) == 1.0:
        base += 0.08  # Chain stores get 8% boost
    else:
        base -= 0.05  # Independent stores have 5% penalty
    
    # Data completeness: better data = better predictions
    data_quality = X.get("data_completeness", 0)
    base += (data_quality - 0.5) * 0.25  # Up to 12.5% boost for complete data
    
    # TPA fee impact (smaller than dispense fee)
    tpa_fee = X.get("tpa_fee", 0)
    tpa_penalty = max((tpa_fee - 0.75) * 0.02, 0)  # Penalty starts at $0.75
    base -= min(tpa_penalty, 0.08)  # Max 8% penalty
    
    # Clamp probability between 5% and 95%
    p_go = max(0.05, min(0.95, base))
    
    # Days to go-live: higher probability = faster implementation
    days = int(120 - (p_go - 0.3) * 150)  # Range: 30-120 days
    days = max(30, min(120, days))
    
    # Realistic profit estimation
    # Average prescription revenue ~$12-15, minus fees and costs
    revenue_per_rx = 13.50  # Average revenue per prescription
    cost_per_rx = 1.20  # Fixed costs (inventory, overhead)
    net_per_rx = revenue_per_rx - dispense_fee - tpa_fee - cost_per_rx
    net_per_rx = max(1.50, net_per_rx)  # Minimum $1.50 net per prescription
    
    # Volume: higher probability pharmacies typically have more volume
    # Base volume 80-200 prescriptions/month, correlated with probability
    base_volume = 80
    volume_boost = int((p_go - 0.3) * 200)  # Up to 200 additional scripts
    monthly_volume = base_volume + volume_boost
    
    # Monthly profit (P50)
    p50 = monthly_volume * net_per_rx
    
    # Uncertainty ranges: P10 (conservative) and P90 (optimistic)
    # Volume uncertainty: ±25% for P10/P90
    # Net margin uncertainty: ±10% for P10/P90
    p10_volume = int(monthly_volume * 0.75)
    p90_volume = int(monthly_volume * 1.25)
    p10_net = net_per_rx * 0.90
    p90_net = net_per_rx * 1.10
    
    p10 = p10_volume * p10_net
    p90 = p90_volume * p90_net
    
    return round(p_go, 3), days, (round(p10, 2), round(p50, 2), round(p90, 2))
