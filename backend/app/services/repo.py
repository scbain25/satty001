from typing import Dict, Any, List
from datetime import datetime
import uuid

_OPPS: Dict[str, Dict[str, Any]] = {}

def create_opportunity(data: Dict[str, Any]) -> Dict[str, Any]:
    oid = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    opp = {
        "id": oid,
        "covered_entity_id": data.get("covered_entity_id", "CE-UNKNOWN"),
        "pharmacy_npi": data.get("pharmacy_npi", "NPI-UNKNOWN"),
        "status_stage": "INTAKE",
        "created_at": now,
        "updated_at": now,
        "data": data,
        "scores": []
    }
    _OPPS[oid] = opp
    return opp

def list_opportunities() -> List[Dict[str, Any]]:
    return list(_OPPS.values())

def get_opportunity(oid: str) -> Dict[str, Any] | None:
    return _OPPS.get(oid)

def save_score(oid: str, score: Dict[str, Any]):
    opp = _OPPS[oid]
    opp["scores"].append(score)
    opp["updated_at"] = datetime.utcnow().isoformat()

def seed():
    # Clear existing opportunities to allow fresh seed
    _OPPS.clear()
    
    # 37 pharmacies total: 70% high (26), 20% medium (7), 10% low (4)
    # Realistic data with varied NPIs, realistic names, and natural fee structures
    pharmacies = [
        # HIGH PROBABILITY (70%+) - 26 pharmacies
        # Very close chain stores (<3km) with competitive fees ($2.50-$4.50)
        {"npi": "1234567890", "name": "CVS Pharmacy #1234 - 1245 Main St", "entity": "HOSP-REGION-A", "store": "CVS", "distance": 0.4, "dispense": 325, "tpa": 75, "emr": "Epic"},
        {"npi": "1987654321", "name": "Walgreens #5678 - 892 Commerce Blvd", "entity": "HOSP-REGION-A", "store": "WAG", "distance": 0.7, "dispense": 340, "tpa": 78, "emr": "Epic"},
        {"npi": "1122334455", "name": "Walmart Pharmacy #234 - 1450 Market Ave", "entity": "HOSP-REGION-B", "store": "WMT", "distance": 1.1, "dispense": 295, "tpa": 68, "emr": "Cerner"},
        {"npi": "2233445566", "name": "CVS Pharmacy #567 - 678 Oak Street", "entity": "HOSP-REGION-A", "store": "CVS", "distance": 1.3, "dispense": 355, "tpa": 82, "emr": "Epic"},
        {"npi": "3344556677", "name": "Walgreens #9012 - 234 River Road", "entity": "HOSP-REGION-C", "store": "WAG", "distance": 1.6, "dispense": 365, "tpa": 84, "emr": "Allscripts"},
        {"npi": "4455667788", "name": "CVS Pharmacy #890 - 456 Park Drive", "entity": "HOSP-REGION-B", "store": "CVS", "distance": 1.9, "dispense": 375, "tpa": 87, "emr": "Epic"},
        {"npi": "5566778899", "name": "Walmart Pharmacy #456 - 789 North Ave", "entity": "HOSP-REGION-A", "store": "WMT", "distance": 2.1, "dispense": 310, "tpa": 72, "emr": "Cerner"},
        {"npi": "6677889900", "name": "Walgreens #3456 - 321 Hill Street", "entity": "HOSP-REGION-C", "store": "WAG", "distance": 2.3, "dispense": 385, "tpa": 89, "emr": "Epic"},
        {"npi": "7788990011", "name": "CVS Pharmacy #123 - 567 Market Square", "entity": "HOSP-REGION-A", "store": "CVS", "distance": 0.5, "dispense": 330, "tpa": 76, "emr": "Allscripts"},
        {"npi": "8899001122", "name": "Walmart Pharmacy #789 - 890 East Blvd", "entity": "HOSP-REGION-B", "store": "WMT", "distance": 0.9, "dispense": 320, "tpa": 74, "emr": "Epic"},
        {"npi": "9900112233", "name": "Walgreens #7890 - 123 Westgate Plaza", "entity": "HOSP-REGION-C", "store": "WAG", "distance": 1.2, "dispense": 350, "tpa": 81, "emr": "Cerner"},
        {"npi": "1011121314", "name": "CVS Pharmacy #456 - 234 Harbor Way", "entity": "HOSP-REGION-A", "store": "CVS", "distance": 1.5, "dispense": 360, "tpa": 83, "emr": "Epic"},
        {"npi": "1213141516", "name": "Walmart Pharmacy #123 - 567 South St", "entity": "HOSP-REGION-B", "store": "WMT", "distance": 1.8, "dispense": 300, "tpa": 70, "emr": "Allscripts"},
        {"npi": "1314151617", "name": "Walgreens #2345 - 890 Maple Avenue", "entity": "HOSP-REGION-C", "store": "WAG", "distance": 2.0, "dispense": 370, "tpa": 85, "emr": "Epic"},
        {"npi": "1415161718", "name": "CVS Pharmacy #789 - 123 Elmwood Drive", "entity": "HOSP-REGION-A", "store": "CVS", "distance": 2.2, "dispense": 380, "tpa": 88, "emr": "Cerner"},
        {"npi": "1516171819", "name": "Walmart Pharmacy #567 - 456 Lakeside Blvd", "entity": "HOSP-REGION-B", "store": "WMT", "distance": 0.6, "dispense": 315, "tpa": 73, "emr": "Epic"},
        {"npi": "1617181920", "name": "Walgreens #4567 - 789 Bridge Street", "entity": "HOSP-REGION-C", "store": "WAG", "distance": 0.8, "dispense": 390, "tpa": 90, "emr": "Allscripts"},
        {"npi": "1718192021", "name": "CVS Pharmacy #234 - 234 Greenfield Rd", "entity": "HOSP-REGION-A", "store": "CVS", "distance": 1.0, "dispense": 395, "tpa": 91, "emr": "Epic"},
        {"npi": "1819202122", "name": "Walmart Pharmacy #890 - 567 Fairview Ave", "entity": "HOSP-REGION-B", "store": "WMT", "distance": 1.4, "dispense": 305, "tpa": 71, "emr": "Cerner"},
        {"npi": "1920212223", "name": "Walgreens #5678 - 123 Brookside Lane", "entity": "HOSP-REGION-C", "store": "WAG", "distance": 1.7, "dispense": 345, "tpa": 80, "emr": "Epic"},
        {"npi": "2021222324", "name": "CVS Pharmacy #345 - 890 Highland Drive", "entity": "HOSP-REGION-A", "store": "CVS", "distance": 2.4, "dispense": 400, "tpa": 92, "emr": "Allscripts"},
        {"npi": "2122232425", "name": "Walmart Pharmacy #234 - 234 Midtown Plaza", "entity": "HOSP-REGION-B", "store": "WMT", "distance": 2.5, "dispense": 325, "tpa": 75, "emr": "Epic"},
        {"npi": "2223242526", "name": "Walgreens #6789 - 567 Summit Boulevard", "entity": "HOSP-REGION-C", "store": "WAG", "distance": 2.6, "dispense": 410, "tpa": 95, "emr": "Cerner"},
        {"npi": "2324252627", "name": "CVS Pharmacy #567 - 123 Valley View Rd", "entity": "HOSP-REGION-A", "store": "CVS", "distance": 0.3, "dispense": 405, "tpa": 93, "emr": "Epic"},
        {"npi": "2425262728", "name": "Walmart Pharmacy #345 - 456 Pinecrest St", "entity": "HOSP-REGION-B", "store": "WMT", "distance": 2.7, "dispense": 290, "tpa": 67, "emr": "Allscripts"},
        {"npi": "2526272829", "name": "Walgreens #8901 - 789 Millbrook Avenue", "entity": "HOSP-REGION-C", "store": "WAG", "distance": 0.2, "dispense": 415, "tpa": 96, "emr": "Epic"},
        
        # MEDIUM PROBABILITY (50-69%) - 7 pharmacies
        # Medium distance (8-18km) chain stores or close independent stores with moderate fees ($4.50-$6.50)
        {"npi": "3031323334", "name": "CVS Pharmacy #890 - 1234 Westfield Blvd", "entity": "HOSP-REGION-D", "store": "CVS", "distance": 11.2, "dispense": 485, "tpa": 112, "emr": "Epic"},
        {"npi": "3132333435", "name": "Walgreens #1234 - 5678 Northridge Way", "entity": "HOSP-REGION-D", "store": "WAG", "distance": 13.5, "dispense": 495, "tpa": 115, "emr": "Cerner"},
        {"npi": "3233343536", "name": "Community Care Pharmacy - 234 Main St", "entity": "HOSP-REGION-E", "store": "Independent", "distance": 9.8, "dispense": 545, "tpa": 126, "emr": "Epic"},
        {"npi": "3334353637", "name": "Walmart Pharmacy #567 - 8901 Crossroads Dr", "entity": "HOSP-REGION-D", "store": "WMT", "distance": 14.7, "dispense": 475, "tpa": 110, "emr": "Allscripts"},
        {"npi": "3435363738", "name": "CVS Pharmacy #234 - 3456 Riverside Plaza", "entity": "HOSP-REGION-E", "store": "CVS", "distance": 10.3, "dispense": 505, "tpa": 117, "emr": "Epic"},
        {"npi": "3536373839", "name": "Family Health Pharmacy - 678 Oak Ave", "entity": "HOSP-REGION-D", "store": "Independent", "distance": 8.5, "dispense": 575, "tpa": 133, "emr": "Cerner"},
        {"npi": "3637383940", "name": "Walgreens #2345 - 9012 Meadowbrook Ln", "entity": "HOSP-REGION-E", "store": "WAG", "distance": 12.8, "dispense": 515, "tpa": 119, "emr": "Epic"},
        
        # LOW PROBABILITY (30-49%) - 4 pharmacies
        # Far distances (28-48km) or high fees ($5.50-$7.50)
        {"npi": "4041424344", "name": "Rural Health Pharmacy - 123 County Rd 45", "entity": "HOSP-REGION-F", "store": "Independent", "distance": 32.4, "dispense": 625, "tpa": 145, "emr": "Epic"},
        {"npi": "4142434445", "name": "Walgreens #3456 - 456 Mountain View Hwy", "entity": "HOSP-REGION-F", "store": "WAG", "distance": 39.7, "dispense": 495, "tpa": 115, "emr": "Cerner"},
        {"npi": "4243444546", "name": "Heritage Pharmacy - 789 Heritage Lane", "entity": "HOSP-REGION-F", "store": "Independent", "distance": 36.2, "dispense": 655, "tpa": 152, "emr": "Allscripts"},
        {"npi": "4344454647", "name": "CVS Pharmacy #456 - 1234 Outskirts Blvd", "entity": "HOSP-REGION-F", "store": "CVS", "distance": 42.8, "dispense": 485, "tpa": 112, "emr": "Epic"},
    ]
    
    for pharm in pharmacies:
        create_opportunity({
            "covered_entity_id": pharm["entity"],
            "pharmacy_npi": pharm["npi"],
            "pharmacy_name": pharm["name"],
            "tpa_vendor": "MacroHelix",
            "emr": pharm["emr"],
            "distance_km": pharm["distance"],
            "store_type": pharm["store"],
            "known_dispense_fee_cents": pharm["dispense"],
            "known_tpa_fee_cents": pharm["tpa"]
        })
