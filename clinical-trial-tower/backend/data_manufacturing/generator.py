"""
Data Manufacturing Module for the Clinical Trial Control Tower.

Generates sophisticated, realistic synthetic clinical trial data including:
- Studies with multi-country, multi-site designs
- Principal investigators with publication track records
- Patient enrollment curves with realistic screen-fail and dropout patterns
- Regulatory timelines calibrated to real-world benchmarks
- Agent action histories showing descriptive/predictive/simulative/optimization/generative/agentic tasks
- Risk registers and milestone trackers
- Monte Carlo simulation outputs

All data is internally consistent and time-coherent.
"""

import random
import math
import hashlib
from datetime import date, datetime, timedelta
from typing import List, Dict, Tuple
from ..models import (
    Study, Site, Country, PrincipalInvestigator, EnrollmentSnapshot,
    Milestone, RegulatoryDocument, RiskItem, AgentAction, SimulationScenario,
    StudyPhase, StudyStatus, TherapeuticArea, AgentType, TaskType,
    Severity, SiteStatus, CountryStatus
)


# ─── Reference Data ──────────────────────────────────────────

COUNTRY_DATA = [
    {"code": "US", "name": "United States", "region": "North America", "reg_score": 88, "approval_days": 30, "cost": 1.0, "infra": 95, "lat": 39.8, "lon": -98.5},
    {"code": "DE", "name": "Germany", "region": "Europe", "reg_score": 85, "approval_days": 45, "cost": 0.85, "infra": 92, "lat": 51.2, "lon": 10.4},
    {"code": "UK", "name": "United Kingdom", "region": "Europe", "reg_score": 87, "approval_days": 35, "cost": 0.90, "infra": 93, "lat": 55.4, "lon": -3.4},
    {"code": "FR", "name": "France", "region": "Europe", "reg_score": 82, "approval_days": 50, "cost": 0.82, "infra": 90, "lat": 46.2, "lon": 2.2},
    {"code": "JP", "name": "Japan", "region": "Asia Pacific", "reg_score": 80, "approval_days": 60, "cost": 1.15, "infra": 94, "lat": 36.2, "lon": 138.3},
    {"code": "AU", "name": "Australia", "region": "Asia Pacific", "reg_score": 86, "approval_days": 40, "cost": 0.88, "infra": 91, "lat": -25.3, "lon": 133.8},
    {"code": "CA", "name": "Canada", "region": "North America", "reg_score": 84, "approval_days": 42, "cost": 0.92, "infra": 90, "lat": 56.1, "lon": -106.3},
    {"code": "BR", "name": "Brazil", "region": "Latin America", "reg_score": 65, "approval_days": 90, "cost": 0.55, "infra": 70, "lat": -14.2, "lon": -51.9},
    {"code": "IN", "name": "India", "region": "Asia Pacific", "reg_score": 62, "approval_days": 85, "cost": 0.35, "infra": 65, "lat": 20.6, "lon": 78.9},
    {"code": "KR", "name": "South Korea", "region": "Asia Pacific", "reg_score": 78, "approval_days": 55, "cost": 0.70, "infra": 88, "lat": 35.9, "lon": 127.8},
    {"code": "ES", "name": "Spain", "region": "Europe", "reg_score": 79, "approval_days": 48, "cost": 0.72, "infra": 85, "lat": 40.5, "lon": -3.7},
    {"code": "PL", "name": "Poland", "region": "Europe", "reg_score": 74, "approval_days": 55, "cost": 0.50, "infra": 78, "lat": 51.9, "lon": 19.1},
    {"code": "MX", "name": "Mexico", "region": "Latin America", "reg_score": 60, "approval_days": 95, "cost": 0.45, "infra": 62, "lat": 23.6, "lon": -102.6},
    {"code": "ZA", "name": "South Africa", "region": "Africa", "reg_score": 58, "approval_days": 100, "cost": 0.40, "infra": 60, "lat": -30.6, "lon": 22.9},
    {"code": "IL", "name": "Israel", "region": "Middle East", "reg_score": 83, "approval_days": 38, "cost": 0.80, "infra": 89, "lat": 31.0, "lon": 34.9},
    {"code": "CN", "name": "China", "region": "Asia Pacific", "reg_score": 68, "approval_days": 75, "cost": 0.50, "infra": 82, "lat": 35.9, "lon": 104.2},
    {"code": "IT", "name": "Italy", "region": "Europe", "reg_score": 77, "approval_days": 52, "cost": 0.75, "infra": 84, "lat": 41.9, "lon": 12.6},
    {"code": "NL", "name": "Netherlands", "region": "Europe", "reg_score": 86, "approval_days": 38, "cost": 0.88, "infra": 93, "lat": 52.1, "lon": 5.3},
]

CITIES = {
    "US": ["Boston", "Houston", "San Francisco", "New York", "Philadelphia", "Chicago", "Seattle", "Durham", "Baltimore", "Los Angeles"],
    "DE": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Heidelberg", "Cologne"],
    "UK": ["London", "Oxford", "Cambridge", "Manchester", "Edinburgh", "Birmingham"],
    "FR": ["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux"],
    "JP": ["Tokyo", "Osaka", "Kyoto", "Nagoya", "Fukuoka"],
    "AU": ["Sydney", "Melbourne", "Brisbane", "Perth"],
    "CA": ["Toronto", "Montreal", "Vancouver", "Ottawa"],
    "BR": ["São Paulo", "Rio de Janeiro", "Brasília", "Belo Horizonte"],
    "IN": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"],
    "KR": ["Seoul", "Busan", "Daegu", "Incheon"],
    "ES": ["Madrid", "Barcelona", "Valencia", "Seville"],
    "PL": ["Warsaw", "Krakow", "Wroclaw", "Gdansk"],
    "MX": ["Mexico City", "Guadalajara", "Monterrey"],
    "ZA": ["Johannesburg", "Cape Town", "Durban"],
    "IL": ["Tel Aviv", "Jerusalem", "Haifa"],
    "CN": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen"],
    "IT": ["Rome", "Milan", "Florence", "Naples"],
    "NL": ["Amsterdam", "Rotterdam", "Utrecht", "The Hague"],
}

CITY_COORDS = {
    "Boston": (42.36, -71.06), "Houston": (29.76, -95.37), "San Francisco": (37.77, -122.42),
    "New York": (40.71, -74.01), "Philadelphia": (39.95, -75.17), "Chicago": (41.88, -87.63),
    "Seattle": (47.61, -122.33), "Durham": (35.99, -78.90), "Baltimore": (39.29, -76.61),
    "Los Angeles": (34.05, -118.24), "Berlin": (52.52, 13.40), "Munich": (48.14, 11.58),
    "Hamburg": (53.55, 9.99), "Frankfurt": (50.11, 8.68), "Heidelberg": (49.40, 8.69),
    "Cologne": (50.94, 6.96), "London": (51.51, -0.13), "Oxford": (51.75, -1.25),
    "Cambridge": (52.21, 0.12), "Manchester": (53.48, -2.24), "Edinburgh": (55.95, -3.19),
    "Birmingham": (52.49, -1.89), "Paris": (48.86, 2.35), "Lyon": (45.76, 4.84),
    "Marseille": (43.30, 5.37), "Toulouse": (43.60, 1.44), "Bordeaux": (44.84, -0.58),
    "Tokyo": (35.68, 139.69), "Osaka": (34.69, 135.50), "Kyoto": (35.01, 135.77),
    "Nagoya": (35.18, 136.91), "Fukuoka": (33.59, 130.40), "Sydney": (-33.87, 151.21),
    "Melbourne": (-37.81, 144.96), "Brisbane": (-27.47, 153.03), "Perth": (-31.95, 115.86),
    "Toronto": (43.65, -79.38), "Montreal": (45.50, -73.57), "Vancouver": (49.28, -123.12),
    "Ottawa": (45.42, -75.70), "São Paulo": (-23.55, -46.63), "Rio de Janeiro": (-22.91, -43.17),
    "Brasília": (-15.79, -47.88), "Belo Horizonte": (-19.92, -43.94),
    "Mumbai": (19.08, 72.88), "Delhi": (28.61, 77.21), "Bangalore": (12.97, 77.59),
    "Chennai": (13.08, 80.27), "Hyderabad": (17.39, 78.49),
    "Seoul": (37.57, 126.98), "Busan": (35.18, 129.08), "Daegu": (35.87, 128.60),
    "Incheon": (37.46, 126.71), "Madrid": (40.42, -3.70), "Barcelona": (41.39, 2.17),
    "Valencia": (39.47, -0.38), "Seville": (37.39, -5.98), "Warsaw": (52.23, 21.01),
    "Krakow": (50.06, 19.94), "Wroclaw": (51.11, 17.04), "Gdansk": (54.35, 18.65),
    "Mexico City": (19.43, -99.13), "Guadalajara": (20.68, -103.35), "Monterrey": (25.69, -100.32),
    "Johannesburg": (-26.20, 28.05), "Cape Town": (-33.92, 18.42), "Durban": (-29.86, 31.02),
    "Tel Aviv": (32.09, 34.78), "Jerusalem": (31.77, 35.23), "Haifa": (32.79, 34.99),
    "Beijing": (39.90, 116.40), "Shanghai": (31.23, 121.47), "Guangzhou": (23.13, 113.26),
    "Shenzhen": (22.54, 114.06), "Rome": (41.90, 12.50), "Milan": (45.46, 9.19),
    "Florence": (43.77, 11.25), "Naples": (40.85, 14.27), "Amsterdam": (52.37, 4.90),
    "Rotterdam": (51.92, 4.48), "Utrecht": (52.09, 5.12), "The Hague": (52.08, 4.30),
}

INSTITUTION_TEMPLATES = {
    "US": ["{city} Medical Center", "{city} University Hospital", "Memorial {city} Cancer Center", "{city} Research Institute", "National {city} Health System"],
    "DE": ["Charité {city}", "Universitätsklinikum {city}", "{city} Cancer Center"],
    "UK": ["{city} Royal Hospital", "University of {city} Medical Centre", "{city} NHS Trust"],
    "FR": ["Hôpital Universitaire de {city}", "Institut {city} de Recherche"],
    "JP": ["{city} University Hospital", "{city} National Medical Center"],
    "AU": ["{city} Health", "Royal {city} Hospital"],
    "CA": ["{city} General Hospital", "University of {city} Health Network"],
    "BR": ["Hospital de {city}", "Instituto {city}"],
    "IN": ["{city} Institute of Medical Sciences", "Apollo {city}"],
    "KR": ["{city} National University Hospital", "Samsung {city} Medical Center"],
    "ES": ["Hospital Clínic de {city}", "Hospital Universitario de {city}"],
    "PL": ["Szpital Uniwersytecki w {city}", "{city} Medical University"],
    "MX": ["Hospital General de {city}", "Instituto Nacional {city}"],
    "ZA": ["{city} Academic Hospital", "Groote Schuur {city}"],
    "IL": ["{city} Medical Center", "Hadassah {city}"],
    "CN": ["{city} People's Hospital", "Peking {city} University Hospital"],
    "IT": ["Ospedale di {city}", "Policlinico {city}"],
    "NL": ["{city} University Medical Center", "Academic Medical Center {city}"],
}

PI_FIRST_NAMES = {
    "US": ["James", "Sarah", "Michael", "Emily", "David", "Jennifer", "Robert", "Lisa"],
    "DE": ["Thomas", "Anna", "Klaus", "Sabine", "Wolfgang", "Monika"],
    "UK": ["William", "Charlotte", "George", "Emma", "Oliver", "Sophie"],
    "FR": ["Pierre", "Marie", "Jean", "Claire", "François", "Isabelle"],
    "JP": ["Takeshi", "Yuki", "Hiroshi", "Sakura", "Kenji", "Aiko"],
    "AU": ["Jack", "Olivia", "Liam", "Ella", "Noah", "Grace"],
    "CA": ["Alexander", "Sophie", "Ethan", "Chloe", "Lucas", "Mia"],
    "BR": ["Carlos", "Ana", "Pedro", "Maria", "Lucas", "Julia"],
    "IN": ["Rajesh", "Priya", "Suresh", "Anita", "Vikram", "Deepa"],
    "KR": ["Joon", "Soo-Yeon", "Min-Ho", "Ji-Eun", "Sung", "Hye-Jin"],
    "ES": ["Carlos", "María", "Javier", "Ana", "Diego", "Isabel"],
    "PL": ["Piotr", "Anna", "Marek", "Katarzyna", "Tomasz", "Ewa"],
    "MX": ["Diego", "Valentina", "Alejandro", "Camila", "Mateo", "Sofía"],
    "ZA": ["Thabo", "Naledi", "Johan", "Lerato", "Sipho", "Ayanda"],
    "IL": ["Avi", "Noa", "Yosef", "Tamar", "Eitan", "Shira"],
    "CN": ["Wei", "Li", "Jun", "Xiao", "Ming", "Fang"],
    "IT": ["Marco", "Giulia", "Alessandro", "Francesca", "Luca", "Sofia"],
    "NL": ["Jan", "Emma", "Pieter", "Sophie", "Bram", "Mila"],
}

PI_LAST_NAMES = {
    "US": ["Thompson", "Chen", "Patel", "Williams", "Rodriguez", "Kim", "O'Brien", "Washington"],
    "DE": ["Müller", "Schmidt", "Fischer", "Weber", "Hoffmann", "Becker"],
    "UK": ["Smith", "Jones", "Taylor", "Wilson", "Brown", "Davies"],
    "FR": ["Dupont", "Martin", "Bernard", "Moreau", "Dubois", "Laurent"],
    "JP": ["Tanaka", "Sato", "Suzuki", "Watanabe", "Yamamoto", "Nakamura"],
    "AU": ["Murphy", "Anderson", "Clarke", "Mitchell", "Roberts", "Walker"],
    "CA": ["Tremblay", "Roy", "Gagnon", "Côté", "Singh", "MacDonald"],
    "BR": ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira"],
    "IN": ["Sharma", "Gupta", "Kumar", "Singh", "Reddy", "Iyer"],
    "KR": ["Kim", "Park", "Lee", "Choi", "Jung", "Kang"],
    "ES": ["García", "Rodríguez", "Martínez", "López", "Hernández", "Fernández"],
    "PL": ["Kowalski", "Nowak", "Wiśniewski", "Wójcik", "Kamiński", "Lewandowski"],
    "MX": ["González", "Hernández", "López", "Martínez", "Pérez", "García"],
    "ZA": ["Nkosi", "Van der Merwe", "Botha", "Molefe", "Pillay", "Williams"],
    "IL": ["Cohen", "Levi", "Mizrahi", "Goldberg", "Friedman", "Shapiro"],
    "CN": ["Wang", "Zhang", "Liu", "Chen", "Yang", "Huang"],
    "IT": ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano"],
    "NL": ["De Jong", "Jansen", "De Vries", "Van den Berg", "Bakker", "Visser"],
}

INDICATIONS = {
    TherapeuticArea.ONCOLOGY: [
        ("Non-Small Cell Lung Cancer", "NSCLC", 15.0),
        ("Triple-Negative Breast Cancer", "TNBC", 12.0),
        ("Metastatic Colorectal Cancer", "mCRC", 40.0),
        ("Hepatocellular Carcinoma", "HCC", 8.0),
        ("Pancreatic Ductal Adenocarcinoma", "PDAC", 13.0),
    ],
    TherapeuticArea.CARDIOLOGY: [
        ("Heart Failure with Reduced Ejection Fraction", "HFrEF", 300.0),
        ("Atrial Fibrillation", "AFib", 500.0),
        ("Hypertrophic Cardiomyopathy", "HCM", 50.0),
    ],
    TherapeuticArea.NEUROLOGY: [
        ("Alzheimer's Disease", "AD", 1100.0),
        ("Parkinson's Disease", "PD", 150.0),
        ("Amyotrophic Lateral Sclerosis", "ALS", 5.0),
    ],
    TherapeuticArea.IMMUNOLOGY: [
        ("Rheumatoid Arthritis", "RA", 250.0),
        ("Systemic Lupus Erythematosus", "SLE", 50.0),
        ("Psoriatic Arthritis", "PsA", 100.0),
    ],
    TherapeuticArea.RARE_DISEASE: [
        ("Spinal Muscular Atrophy", "SMA", 2.0),
        ("Duchenne Muscular Dystrophy", "DMD", 1.5),
        ("Gaucher Disease", "GD", 1.0),
    ],
    TherapeuticArea.INFECTIOUS_DISEASE: [
        ("HIV-1 Infection", "HIV", 380.0),
        ("Hepatitis B", "HBV", 290.0),
        ("Respiratory Syncytial Virus", "RSV", 200.0),
    ],
    TherapeuticArea.ENDOCRINOLOGY: [
        ("Type 2 Diabetes Mellitus", "T2DM", 4000.0),
        ("Obesity", "OB", 3000.0),
        ("Hypothyroidism", "HT", 500.0),
    ],
}

MOLECULES = [
    "BRX-4821", "CTP-7293", "ONK-1150", "NEU-3384", "IMM-6612",
    "RAR-2207", "INF-9045", "END-5571", "CAR-8834", "HEM-4419",
    "PUL-6637", "GAS-1102", "REN-7780", "DER-3356", "OPH-5594",
]

SPONSORS = [
    "NovaPharma Inc.", "MedAlliance Therapeutics", "BioVertex Labs",
    "Zenith Biosciences", "Apex Clinical Research", "Helix Therapeutics",
    "Pinnacle Pharma", "Vanguard Biotech",
]

RISK_TEMPLATES = [
    {"cat": "Enrollment", "desc": "Slow enrollment in {country} due to competing trials", "impact": "high", "mit": "Add 2 backup sites and increase patient referral network"},
    {"cat": "Regulatory", "desc": "Regulatory delay in {country} for protocol amendment", "impact": "medium", "mit": "Pre-submission meeting with regulatory authority"},
    {"cat": "Quality", "desc": "High screen-fail rate at {site} ({rate}%)", "impact": "medium", "mit": "Retrain site staff on inclusion/exclusion criteria"},
    {"cat": "Safety", "desc": "Unexpected SAE cluster reported at {site}", "impact": "critical", "mit": "Convene DSMB review, pause enrollment at site pending investigation"},
    {"cat": "Supply", "desc": "Drug supply chain disruption affecting {country}", "impact": "high", "mit": "Activate secondary distribution center, expedite shipment"},
    {"cat": "Data", "desc": "Missing data >15% for primary endpoint at {site}", "impact": "medium", "mit": "Deploy data monitoring visit and source data verification"},
    {"cat": "Retention", "desc": "Patient dropout rate exceeding threshold in {country}", "impact": "high", "mit": "Implement patient engagement program and travel reimbursement"},
    {"cat": "Compliance", "desc": "Protocol deviation rate at {site} above threshold", "impact": "medium", "mit": "Conduct retraining visit, implement real-time protocol deviation alerts"},
]


class DataManufacturer:
    """
    Generates complete, internally-consistent synthetic clinical trial data.
    Uses seeded randomization for reproducibility.
    """

    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)
        self._study_counter = 0

    def _uid(self, prefix: str, *parts) -> str:
        raw = f"{prefix}-{''.join(str(p) for p in parts)}"
        return f"{prefix}-{hashlib.md5(raw.encode()).hexdigest()[:8].upper()}"

    def generate_study(
        self,
        therapeutic_area: TherapeuticArea = None,
        phase: StudyPhase = None,
        num_countries: int = None,
        num_sites: int = None,
        study_duration_months: int = None,
    ) -> Study:
        """Generate a complete synthetic clinical trial study."""

        self._study_counter += 1

        # Defaults with realistic randomization
        ta = therapeutic_area or self.rng.choice(list(TherapeuticArea))
        ph = phase or self.rng.choice(list(StudyPhase))
        indication_data = self.rng.choice(INDICATIONS[ta])
        indication_name, indication_abbrev, prevalence = indication_data
        molecule = self.rng.choice(MOLECULES)
        sponsor = self.rng.choice(SPONSORS)

        # Phase-dependent parameters
        phase_params = {
            StudyPhase.PHASE_I: {"n_countries": (1, 3), "n_sites": (3, 8), "enrollment": (20, 80), "duration": (6, 18)},
            StudyPhase.PHASE_II: {"n_countries": (3, 6), "n_sites": (10, 30), "enrollment": (80, 300), "duration": (12, 30)},
            StudyPhase.PHASE_III: {"n_countries": (8, 15), "n_sites": (40, 120), "enrollment": (300, 2000), "duration": (24, 48)},
            StudyPhase.PHASE_IV: {"n_countries": (5, 12), "n_sites": (20, 60), "enrollment": (500, 5000), "duration": (24, 60)},
        }
        params = phase_params[ph]

        nc = num_countries or self.rng.randint(*params["n_countries"])
        ns = num_sites or self.rng.randint(*params["n_sites"])
        target_enrollment = self.rng.randint(*params["enrollment"])
        duration = study_duration_months or self.rng.randint(*params["duration"])

        nc = min(nc, len(COUNTRY_DATA))
        ns = max(ns, nc)  # At least one site per country

        # Generate study dates
        start_date = date(2025, 1, 1) + timedelta(days=self.rng.randint(0, 365))
        primary_completion = start_date + timedelta(days=int(duration * 30.44 * 0.85))
        study_completion = start_date + timedelta(days=int(duration * 30.44))

        # Determine how far along we are (simulate current date ~40-70% through)
        progress_pct = self.rng.uniform(0.35, 0.70)
        today = date.today()

        # Budget
        cost_per_patient = self.rng.uniform(30000, 120000)
        budget_total = target_enrollment * cost_per_patient
        budget_spent = budget_total * progress_pct * self.rng.uniform(0.8, 1.1)

        # Select countries
        countries = self._generate_countries(nc, ta, prevalence)

        # Distribute sites across countries
        sites = self._generate_sites(ns, countries, indication_name, ta, progress_pct, start_date)

        # Determine study status based on progress
        if progress_pct < 0.15:
            status = StudyStatus.STARTUP
        elif progress_pct < 0.60:
            status = StudyStatus.ENROLLING
        elif progress_pct < 0.85:
            status = StudyStatus.ACTIVE
        else:
            status = StudyStatus.COMPLETED

        current_enrollment = int(target_enrollment * progress_pct * self.rng.uniform(0.75, 1.05))
        current_enrollment = min(current_enrollment, target_enrollment)

        # Update site enrollment to be consistent
        self._distribute_enrollment(sites, current_enrollment)

        # Generate enrollment timeline
        enrollment_timeline = self._generate_enrollment_timeline(
            start_date, today, target_enrollment, current_enrollment, duration
        )

        # Generate milestones
        milestones = self._generate_milestones(start_date, primary_completion, study_completion, progress_pct)

        # Generate regulatory documents
        reg_docs = self._generate_regulatory_documents(countries, start_date, progress_pct)

        # Generate risks
        risks = self._generate_risks(countries, sites)

        # Generate simulations
        simulations = self._generate_simulations(target_enrollment, duration, budget_total)

        study_id = self._uid("STU", self._study_counter, molecule, indication_abbrev)
        protocol = f"{indication_abbrev}-{molecule}-{ph.value.replace(' ', '')}-{self.rng.randint(100,999)}"

        # Update country site counts
        for c in countries:
            c.sites_count = len([s for s in sites if s.country_code == c.code])

        return Study(
            id=study_id,
            protocol_number=protocol,
            name=f"A {ph.value}, Randomized Study of {molecule} in Patients with {indication_name}",
            phase=ph,
            therapeutic_area=ta,
            indication=indication_name,
            molecule=molecule,
            sponsor=sponsor,
            status=status,
            target_enrollment=target_enrollment,
            current_enrollment=current_enrollment,
            countries=countries,
            sites=sites,
            enrollment_timeline=enrollment_timeline,
            milestones=milestones,
            regulatory_documents=reg_docs,
            risks=risks,
            simulations=simulations,
            start_date=start_date,
            estimated_primary_completion=primary_completion,
            estimated_study_completion=study_completion,
            budget_total_usd=round(budget_total, 2),
            budget_spent_usd=round(budget_spent, 2),
        )

    def _generate_countries(self, count: int, ta: TherapeuticArea, prevalence: float) -> List[Country]:
        selected = self.rng.sample(COUNTRY_DATA, count)
        countries = []
        for cd in selected:
            pool_size = int(prevalence * self.rng.uniform(0.5, 2.0) * 1000)
            status = self.rng.choice([
                CountryStatus.APPROVED, CountryStatus.APPROVED, CountryStatus.APPROVED,
                CountryStatus.REGULATORY_SUBMITTED, CountryStatus.SELECTED
            ])
            reg_sub_date = date(2025, 1, 1) + timedelta(days=self.rng.randint(0, 120))
            reg_app_date = reg_sub_date + timedelta(days=cd["approval_days"] + self.rng.randint(-10, 20)) if status == CountryStatus.APPROVED else None

            countries.append(Country(
                code=cd["code"],
                name=cd["name"],
                region=cd["region"],
                regulatory_score=cd["reg_score"] + self.rng.uniform(-5, 5),
                patient_pool_size=pool_size,
                prevalence_per_100k=prevalence,
                avg_approval_days=cd["approval_days"],
                cost_index=cd["cost"] + self.rng.uniform(-0.05, 0.05),
                infrastructure_score=cd["infra"] + self.rng.uniform(-3, 3),
                status=status,
                regulatory_submission_date=reg_sub_date,
                regulatory_approval_date=reg_app_date,
            ))
        return countries

    def _generate_sites(
        self, count: int, countries: List[Country], indication: str,
        ta: TherapeuticArea, progress: float, start_date: date
    ) -> List[Site]:
        sites = []
        # Distribute sites roughly proportional to patient pool
        total_pool = sum(c.patient_pool_size for c in countries)
        allocations = {}
        remaining = count
        for i, c in enumerate(countries):
            if i == len(countries) - 1:
                allocations[c.code] = remaining
            else:
                alloc = max(1, round(count * c.patient_pool_size / total_pool))
                alloc = min(alloc, remaining - (len(countries) - i - 1))
                allocations[c.code] = alloc
                remaining -= alloc

        for country in countries:
            n_sites = allocations[country.code]
            available_cities = CITIES.get(country.code, [country.name])
            first_names = PI_FIRST_NAMES.get(country.code, PI_FIRST_NAMES["US"])
            last_names = PI_LAST_NAMES.get(country.code, PI_LAST_NAMES["US"])
            institutions = INSTITUTION_TEMPLATES.get(country.code, INSTITUTION_TEMPLATES["US"])

            for j in range(n_sites):
                city = available_cities[j % len(available_cities)]
                coords = CITY_COORDS.get(city, (country.regulatory_score, 0))
                pi_first = self.rng.choice(first_names)
                pi_last = self.rng.choice(last_names)
                institution = self.rng.choice(institutions).format(city=city)

                pi = PrincipalInvestigator(
                    id=self._uid("PI", country.code, j, pi_last),
                    name=f"Dr. {pi_first} {pi_last}",
                    institution=institution,
                    country=country.code,
                    specialty=ta.value,
                    h_index=self.rng.randint(8, 65),
                    trial_experience=self.rng.randint(2, 30),
                    enrollment_track_record=round(self.rng.uniform(0.4, 0.95), 2),
                    availability_score=round(self.rng.uniform(0.3, 1.0), 2),
                )

                # Site status based on progress
                if progress > 0.3:
                    status = self.rng.choices(
                        [SiteStatus.ENROLLING, SiteStatus.ACTIVATED, SiteStatus.SELECTED],
                        weights=[0.6, 0.25, 0.15]
                    )[0]
                else:
                    status = self.rng.choices(
                        [SiteStatus.SELECTED, SiteStatus.ACTIVATED, SiteStatus.IDENTIFIED],
                        weights=[0.5, 0.3, 0.2]
                    )[0]

                activation_date = start_date + timedelta(days=self.rng.randint(30, 180)) if status in [SiteStatus.ACTIVATED, SiteStatus.ENROLLING] else None
                fpi_date = activation_date + timedelta(days=self.rng.randint(7, 60)) if status == SiteStatus.ENROLLING and activation_date else None

                site = Site(
                    id=self._uid("SITE", country.code, city, j),
                    name=institution,
                    country_code=country.code,
                    country_name=country.name,
                    city=city,
                    pi=pi,
                    status=status,
                    target_enrollment=self.rng.randint(5, 40),
                    current_enrollment=0,
                    screen_fail_rate=round(self.rng.uniform(0.15, 0.45), 2),
                    enrollment_rate_per_month=round(self.rng.uniform(0.5, 5.0), 1),
                    quality_score=round(self.rng.uniform(60, 98), 1),
                    activation_date=activation_date,
                    first_patient_in=fpi_date,
                    protocol_deviations=self.rng.randint(0, 12) if status == SiteStatus.ENROLLING else 0,
                    adverse_events=self.rng.randint(0, 8) if status == SiteStatus.ENROLLING else 0,
                    lat=coords[0] + self.rng.uniform(-0.5, 0.5),
                    lon=coords[1] + self.rng.uniform(-0.5, 0.5),
                )
                sites.append(site)
        return sites

    def _distribute_enrollment(self, sites: List[Site], total: int):
        enrolling_sites = [s for s in sites if s.status == SiteStatus.ENROLLING]
        if not enrolling_sites:
            return
        remaining = total
        for i, site in enumerate(enrolling_sites):
            if i == len(enrolling_sites) - 1:
                site.current_enrollment = min(remaining, site.target_enrollment)
            else:
                share = max(0, int(remaining * self.rng.uniform(0.05, 0.25)))
                site.current_enrollment = min(share, site.target_enrollment)
                remaining -= site.current_enrollment

    def _generate_enrollment_timeline(
        self, start: date, today: date, target: int, current: int, duration_months: int
    ) -> List[EnrollmentSnapshot]:
        timeline = []
        n_months = min(duration_months, max(1, (today - start).days // 30))
        cumulative_enrolled = 0
        cumulative_screened = 0
        cumulative_randomized = 0
        cumulative_completed = 0
        cumulative_discontinued = 0

        for m in range(n_months + 1):
            d = start + timedelta(days=m * 30)
            # S-curve enrollment model
            t = m / max(1, duration_months)
            s_curve = 1 / (1 + math.exp(-10 * (t - 0.35)))
            month_target = target * s_curve

            noise = self.rng.uniform(0.85, 1.15)
            cumulative_enrolled = min(int(month_target * noise), target)
            cumulative_screened = int(cumulative_enrolled * self.rng.uniform(1.3, 1.8))
            screen_failed = cumulative_screened - cumulative_enrolled
            cumulative_randomized = int(cumulative_enrolled * self.rng.uniform(0.85, 0.98))
            cumulative_completed = int(cumulative_randomized * max(0, t - 0.2) * self.rng.uniform(0.6, 0.9))
            cumulative_discontinued = int(cumulative_enrolled * self.rng.uniform(0.02, 0.10))

            timeline.append(EnrollmentSnapshot(
                date=d,
                screened=cumulative_screened,
                screen_failed=screen_failed,
                enrolled=cumulative_enrolled,
                randomized=cumulative_randomized,
                completed=cumulative_completed,
                discontinued=cumulative_discontinued,
                target=int(target * s_curve * 1.0),
            ))

        # Ensure last entry matches current enrollment
        if timeline:
            timeline[-1].enrolled = current

        return timeline

    def _generate_milestones(
        self, start: date, primary_end: date, study_end: date, progress: float
    ) -> List[Milestone]:
        total_days = (study_end - start).days
        milestones_def = [
            ("Protocol Finalization", "regulatory", 0.02, AgentType.FEASIBILITY_STARTUP),
            ("IND/CTA Submission", "regulatory", 0.05, AgentType.REGULATORY),
            ("First Country Approval", "regulatory", 0.10, AgentType.REGULATORY),
            ("Site Identification Complete", "execution", 0.08, AgentType.COUNTRY_SITE),
            ("First Site Activated", "execution", 0.15, AgentType.COUNTRY_SITE),
            ("First Patient In (FPI)", "enrollment", 0.18, AgentType.PI_ENROLLMENT),
            ("25% Enrollment", "enrollment", 0.35, AgentType.PI_ENROLLMENT),
            ("50% Enrollment", "enrollment", 0.50, AgentType.PI_ENROLLMENT),
            ("75% Enrollment", "enrollment", 0.65, AgentType.PI_ENROLLMENT),
            ("Last Patient In (LPI)", "enrollment", 0.75, AgentType.PI_ENROLLMENT),
            ("Database Lock", "data", 0.85, AgentType.EXECUTION),
            ("Primary Analysis Complete", "data", 0.90, AgentType.EXECUTION),
            ("CSR Draft", "regulatory", 0.93, AgentType.REGULATORY),
            ("Regulatory Submission", "regulatory", 0.98, AgentType.REGULATORY),
        ]

        milestones = []
        for i, (name, cat, pct, owner) in enumerate(milestones_def):
            planned = start + timedelta(days=int(total_days * pct))
            delay = self.rng.randint(-10, 30)
            predicted = planned + timedelta(days=delay)

            if pct < progress:
                actual = planned + timedelta(days=self.rng.randint(-5, 20))
                status = "completed"
                confidence = 1.0
            elif pct < progress + 0.15:
                actual = None
                status = self.rng.choices(["on_track", "at_risk"], weights=[0.6, 0.4])[0]
                confidence = round(self.rng.uniform(0.6, 0.85), 2)
            else:
                actual = None
                status = self.rng.choices(["on_track", "at_risk", "delayed"], weights=[0.5, 0.3, 0.2])[0]
                confidence = round(self.rng.uniform(0.4, 0.75), 2)

            milestones.append(Milestone(
                id=self._uid("MS", i, name),
                name=name,
                category=cat,
                planned_date=planned,
                predicted_date=predicted,
                actual_date=actual,
                status=status,
                confidence=confidence,
                owner_agent=owner,
            ))

        return milestones

    def _generate_regulatory_documents(
        self, countries: List[Country], start: date, progress: float
    ) -> List[RegulatoryDocument]:
        docs = []
        global_docs = [
            ("Investigator's Brochure", "IB"),
            ("Clinical Study Protocol", "protocol"),
            ("Informed Consent Form (Master)", "ICF"),
            ("Statistical Analysis Plan", "SAP"),
            ("Data Management Plan", "DMP"),
            ("Clinical Study Report Template", "CSR"),
        ]

        for i, (name, dtype) in enumerate(global_docs):
            if progress > 0.1 * (i + 1):
                status = "approved"
            elif progress > 0.05 * (i + 1):
                status = self.rng.choice(["submitted", "review"])
            else:
                status = "drafting"

            docs.append(RegulatoryDocument(
                id=self._uid("DOC", "global", dtype),
                name=name,
                doc_type=dtype,
                country="Global",
                status=status,
                submission_date=start + timedelta(days=self.rng.randint(30, 90)) if status in ["submitted", "approved"] else None,
                approval_date=start + timedelta(days=self.rng.randint(90, 180)) if status == "approved" else None,
                generated_by_agent=self.rng.random() > 0.5,
            ))

        # Country-specific
        for country in countries:
            for cname, ctype in [("CTA Submission Package", "CTA"), ("Ethics Committee Approval", "EC"), ("Import License", "IL")]:
                status = "approved" if country.status == CountryStatus.APPROVED else self.rng.choice(["drafting", "submitted"])
                docs.append(RegulatoryDocument(
                    id=self._uid("DOC", country.code, ctype),
                    name=f"{cname} - {country.name}",
                    doc_type=ctype,
                    country=country.name,
                    status=status,
                    submission_date=country.regulatory_submission_date,
                    approval_date=country.regulatory_approval_date if status == "approved" else None,
                    generated_by_agent=self.rng.random() > 0.4,
                ))

        return docs

    def _generate_risks(self, countries: List[Country], sites: List[Site]) -> List[RiskItem]:
        risks = []
        for i in range(self.rng.randint(5, 12)):
            template = self.rng.choice(RISK_TEMPLATES)
            country = self.rng.choice(countries)
            site = self.rng.choice(sites) if sites else None

            desc = template["desc"].format(
                country=country.name,
                site=site.name if site else "Unknown",
                rate=self.rng.randint(25, 50),
            )
            mitigation = template["mit"]

            risks.append(RiskItem(
                id=self._uid("RISK", i, template["cat"]),
                category=template["cat"],
                description=desc,
                probability=round(self.rng.uniform(0.1, 0.8), 2),
                impact=template["impact"],
                mitigation=mitigation,
                owner_agent=self.rng.choice(list(AgentType)),
                status=self.rng.choices(["open", "mitigated", "escalated"], weights=[0.5, 0.3, 0.2])[0],
            ))

        return risks

    def _generate_simulations(self, target: int, duration: int, budget: float) -> List[SimulationScenario]:
        scenarios = []
        base_names = [
            ("Baseline Plan", "Current trajectory with existing sites and enrollment rates"),
            ("Accelerated Enrollment", "Add 5 high-performing sites in US and Germany"),
            ("Cost-Optimized", "Shift enrollment to lower-cost countries (India, Poland, Brazil)"),
            ("Risk-Mitigated", "Add buffer sites and extend timeline by 3 months"),
            ("Aggressive Timeline", "Increase site activation rate, parallel regulatory submissions"),
        ]

        for i, (name, desc) in enumerate(base_names):
            cost_mult = [1.0, 1.15, 0.75, 1.10, 1.20][i]
            time_mult = [1.0, 0.80, 1.10, 1.15, 0.70][i]
            success_mult = [0.70, 0.82, 0.68, 0.85, 0.65][i]

            scenarios.append(SimulationScenario(
                id=self._uid("SIM", i, name),
                name=name,
                description=desc,
                parameters={
                    "num_sites": int(30 * [1.0, 1.2, 0.9, 1.3, 1.1][i]),
                    "enrollment_rate_boost": [0, 15, -5, 5, 25][i],
                    "timeline_months": int(duration * time_mult),
                    "additional_countries": [0, 2, 3, 1, 0][i],
                },
                outcome_enrollment_months=round(duration * time_mult + self.rng.uniform(-2, 2), 1),
                outcome_total_cost=round(budget * cost_mult * self.rng.uniform(0.95, 1.05), 2),
                outcome_probability_success=round(success_mult + self.rng.uniform(-0.05, 0.05), 3),
                created_by_agent=AgentType.MASTER,
            ))

        return scenarios

    def generate_agent_actions(self, study: Study, count: int = 50) -> List[AgentAction]:
        """Generate a realistic stream of agent actions for a study."""

        actions = []
        base_time = datetime.now() - timedelta(hours=count)

        action_templates = self._get_action_templates(study)

        for i in range(count):
            template = self.rng.choice(action_templates)
            timestamp = base_time + timedelta(minutes=self.rng.randint(i * 10, (i + 1) * 30))

            action = AgentAction(
                id=self._uid("ACT", i, template["agent"]),
                timestamp=timestamp,
                agent_type=template["agent"],
                agent_name=template["agent_name"],
                task_type=template["task_type"],
                title=template["title"],
                description=template["description"],
                severity=template["severity"],
                data=template.get("data", {}),
                human_action_required=template.get("human_required", False),
                confidence=round(self.rng.uniform(0.7, 0.98), 2),
            )
            actions.append(action)

        actions.sort(key=lambda a: a.timestamp)
        return actions

    def _get_action_templates(self, study: Study) -> List[Dict]:
        """Generate contextual action templates based on the study state."""

        country_names = [c.name for c in study.countries] if study.countries else ["United States"]
        site_names = [s.name for s in study.sites[:5]] if study.sites else ["Site A"]
        enrollment_pct = round(study.current_enrollment / max(1, study.target_enrollment) * 100, 1)

        templates = [
            # ── Master Agent ──
            {"agent": AgentType.MASTER, "agent_name": "Maestro (Master Orchestrator)", "task_type": TaskType.DESCRIPTIVE,
             "title": "Daily Study Health Summary",
             "description": f"Study {study.protocol_number} is at {enrollment_pct}% enrollment ({study.current_enrollment}/{study.target_enrollment} patients). {len([s for s in study.sites if s.status == SiteStatus.ENROLLING])} sites actively enrolling across {len(study.countries)} countries.",
             "severity": Severity.INFO, "data": {"enrollment_pct": enrollment_pct}},

            {"agent": AgentType.MASTER, "agent_name": "Maestro (Master Orchestrator)", "task_type": TaskType.PREDICTIVE,
             "title": "Study Completion Forecast Updated",
             "description": f"Based on current enrollment velocity of {self.rng.uniform(8, 25):.1f} patients/month, the study is projected to complete enrollment {self.rng.randint(1, 8)} weeks {'ahead of' if self.rng.random() > 0.4 else 'behind'} schedule.",
             "severity": Severity.INFO if self.rng.random() > 0.4 else Severity.WARNING,
             "data": {"velocity": round(self.rng.uniform(8, 25), 1)}},

            {"agent": AgentType.MASTER, "agent_name": "Maestro (Master Orchestrator)", "task_type": TaskType.AGENTIC,
             "title": "Cross-Agent Coordination: Enrollment Recovery Plan",
             "description": "Detected enrollment gap in EU region. Coordinated with Country/Site Agent to activate 3 backup sites and with PI/Enrollment Agent to implement targeted recruitment campaign. Budget reallocation request submitted to Execution Agent.",
             "severity": Severity.WARNING, "human_required": True,
             "data": {"affected_region": "EU", "backup_sites": 3}},

            {"agent": AgentType.MASTER, "agent_name": "Maestro (Master Orchestrator)", "task_type": TaskType.OPTIMIZATION,
             "title": "Resource Allocation Optimization Complete",
             "description": f"Optimized budget allocation across {len(study.countries)} countries. Recommended shifting $1.2M from low-performing sites to high-potential sites in {self.rng.choice(country_names)} and {self.rng.choice(country_names)}. Expected enrollment acceleration: +18%.",
             "severity": Severity.SUCCESS, "data": {"savings": 1200000, "acceleration": 18}},

            # ── Country & Site Selection Agent ──
            {"agent": AgentType.COUNTRY_SITE, "agent_name": "Atlas (Country & Site Selector)", "task_type": TaskType.DESCRIPTIVE,
             "title": "Country Performance Scorecard",
             "description": f"Generated performance scorecard for {len(study.countries)} active countries. Top performers: {self.rng.choice(country_names)} (regulatory: 92/100, enrollment: 88/100) and {self.rng.choice(country_names)} (regulatory: 87/100, enrollment: 85/100).",
             "severity": Severity.INFO, "data": {"countries_analyzed": len(study.countries)}},

            {"agent": AgentType.COUNTRY_SITE, "agent_name": "Atlas (Country & Site Selector)", "task_type": TaskType.PREDICTIVE,
             "title": f"Site Activation Delay Predicted: {self.rng.choice(site_names)}",
             "description": f"Predictive model indicates 73% probability of 3-week activation delay at {self.rng.choice(site_names)} due to pending ethics committee review. Recommended: escalate with local regulatory contact.",
             "severity": Severity.WARNING, "human_required": True,
             "data": {"delay_weeks": 3, "probability": 0.73}},

            {"agent": AgentType.COUNTRY_SITE, "agent_name": "Atlas (Country & Site Selector)", "task_type": TaskType.SIMULATIVE,
             "title": "Country Addition Scenario Analysis",
             "description": f"Simulated adding South Korea and Israel to the study. Monte Carlo analysis (10,000 runs): median enrollment acceleration of 4.2 months, 87% probability of meeting enrollment deadline. Cost impact: +$2.1M.",
             "severity": Severity.INFO, "data": {"acceleration_months": 4.2, "cost_impact": 2100000}},

            {"agent": AgentType.COUNTRY_SITE, "agent_name": "Atlas (Country & Site Selector)", "task_type": TaskType.OPTIMIZATION,
             "title": "Site Portfolio Optimization",
             "description": f"Analyzed {len(study.sites)} sites using multi-objective optimization (enrollment rate, quality score, cost). Recommended closing 2 underperforming sites and redistributing targets to top 5 performers. Net enrollment gain: +12 patients/month.",
             "severity": Severity.SUCCESS, "data": {"sites_to_close": 2, "net_gain": 12}},

            # ── Feasibility & Startup Agent ──
            {"agent": AgentType.FEASIBILITY_STARTUP, "agent_name": "Pioneer (Feasibility & Startup)", "task_type": TaskType.DESCRIPTIVE,
             "title": "Protocol Complexity Analysis Complete",
             "description": f"Protocol {study.protocol_number} complexity score: 72/100 (medium-high). Key complexity drivers: {self.rng.randint(5,12)} inclusion criteria, {self.rng.randint(3,8)} biomarker assessments, {self.rng.randint(8,20)} study visits over {self.rng.randint(12,48)} weeks. Benchmark: median complexity for {study.phase.value} {study.therapeutic_area.value} trials is 65.",
             "severity": Severity.INFO, "data": {"complexity_score": 72}},

            {"agent": AgentType.FEASIBILITY_STARTUP, "agent_name": "Pioneer (Feasibility & Startup)", "task_type": TaskType.PREDICTIVE,
             "title": "Startup Timeline Forecast",
             "description": f"Based on historical data from 847 comparable trials: predicted first-patient-in (FPI) for new sites is {self.rng.randint(8,16)} weeks from activation. 80% confidence interval: [{self.rng.randint(6,10)}, {self.rng.randint(14,22)}] weeks.",
             "severity": Severity.INFO, "data": {"fpi_weeks": 12, "ci_lower": 8, "ci_upper": 18}},

            {"agent": AgentType.FEASIBILITY_STARTUP, "agent_name": "Pioneer (Feasibility & Startup)", "task_type": TaskType.GENERATIVE,
             "title": "Site Feasibility Questionnaire Generated",
             "description": f"Auto-generated tailored feasibility questionnaire for 8 candidate sites in {self.rng.choice(country_names)}. Questionnaire includes {study.therapeutic_area.value}-specific questions, {study.indication}-relevant patient pool assessment, and local regulatory requirement checklist.",
             "severity": Severity.SUCCESS, "data": {"sites_targeted": 8}},

            {"agent": AgentType.FEASIBILITY_STARTUP, "agent_name": "Pioneer (Feasibility & Startup)", "task_type": TaskType.AGENTIC,
             "title": "Automated Site Readiness Assessment",
             "description": f"Autonomously assessed readiness of 5 sites pending activation. Results: 3 sites READY (auto-approved for activation), 1 site CONDITIONAL (missing pharmacy setup - notification sent), 1 site NOT READY (PI availability conflict - escalated to human coordinator).",
             "severity": Severity.WARNING, "human_required": True,
             "data": {"ready": 3, "conditional": 1, "not_ready": 1}},

            # ── PI & Patient Enrollment Agent ──
            {"agent": AgentType.PI_ENROLLMENT, "agent_name": "Navigator (PI & Enrollment)", "task_type": TaskType.DESCRIPTIVE,
             "title": "Weekly Enrollment Pulse",
             "description": f"This week: {self.rng.randint(5, 20)} patients screened, {self.rng.randint(3, 12)} enrolled, {self.rng.randint(1, 5)} screen failures. Cumulative: {study.current_enrollment}/{study.target_enrollment} ({enrollment_pct}%). Screen-fail rate: {self.rng.uniform(20, 40):.1f}% (target: <30%).",
             "severity": Severity.INFO, "data": {"weekly_enrolled": 8, "screen_fail_rate": 28.5}},

            {"agent": AgentType.PI_ENROLLMENT, "agent_name": "Navigator (PI & Enrollment)", "task_type": TaskType.PREDICTIVE,
             "title": "Enrollment Completion Probability",
             "description": f"Bayesian enrollment model updated. P(meet target by deadline) = {self.rng.uniform(0.55, 0.92):.0%}. Key risk: {self.rng.choice(country_names)} enrollment velocity 35% below forecast. If trend continues, {self.rng.randint(2, 6)} additional sites needed.",
             "severity": Severity.WARNING, "data": {"completion_probability": 0.72}},

            {"agent": AgentType.PI_ENROLLMENT, "agent_name": "Navigator (PI & Enrollment)", "task_type": TaskType.OPTIMIZATION,
             "title": "PI Matching Optimization",
             "description": f"Identified optimal PI candidates for 4 new sites using multi-factor matching algorithm (h-index, trial experience, enrollment track record, therapeutic expertise). Top match: Dr. {self.rng.choice(PI_LAST_NAMES['US'])} at {self.rng.choice(CITIES['US'])} Medical Center (match score: 94/100).",
             "severity": Severity.SUCCESS, "data": {"candidates_evaluated": 127, "top_score": 94}},

            {"agent": AgentType.PI_ENROLLMENT, "agent_name": "Navigator (PI & Enrollment)", "task_type": TaskType.GENERATIVE,
             "title": "Patient Recruitment Materials Generated",
             "description": f"Generated localized recruitment materials for {self.rng.choice(country_names)}: patient brochure (lay language, 6th-grade reading level), social media ad copy (3 variants for A/B testing), physician referral letter template. All materials comply with local advertising regulations.",
             "severity": Severity.SUCCESS, "data": {"materials_generated": 7}},

            {"agent": AgentType.PI_ENROLLMENT, "agent_name": "Navigator (PI & Enrollment)", "task_type": TaskType.AGENTIC,
             "title": "Automated Enrollment Alert & Response",
             "description": f"Detected enrollment stall at {self.rng.choice(site_names)} (0 patients in 3 weeks). Autonomously: (1) triggered PI engagement call, (2) activated backup recruitment channels, (3) updated enrollment forecast, (4) notified Master Agent for potential site replacement evaluation.",
             "severity": Severity.WARNING, "data": {"stall_weeks": 3}},

            # ── Study Execution Agent ──
            {"agent": AgentType.EXECUTION, "agent_name": "Sentinel (Study Execution)", "task_type": TaskType.DESCRIPTIVE,
             "title": "Data Quality Dashboard Update",
             "description": f"Data completeness: {self.rng.uniform(85, 98):.1f}% across all sites. Query rate: {self.rng.uniform(1.5, 8.0):.1f} queries per patient. {self.rng.randint(0, 5)} protocol deviations reported this week. {self.rng.randint(0, 3)} sites flagged for source data verification.",
             "severity": Severity.INFO, "data": {"completeness": 92.3, "query_rate": 4.2}},

            {"agent": AgentType.EXECUTION, "agent_name": "Sentinel (Study Execution)", "task_type": TaskType.PREDICTIVE,
             "title": "Adverse Event Trend Detection",
             "description": f"Signal detection algorithm identified emerging trend: {self.rng.choice(['Grade 2 fatigue', 'Grade 1 nausea', 'Grade 2 rash', 'elevated ALT'])} rate at {self.rng.uniform(8, 18):.1f}% (expected: {self.rng.uniform(3, 8):.1f}%). Confidence: {self.rng.uniform(0.7, 0.95):.0%}. Recommended: DSMB notification.",
             "severity": Severity.CRITICAL, "human_required": True,
             "data": {"ae_rate": 12.3, "expected_rate": 5.2}},

            {"agent": AgentType.EXECUTION, "agent_name": "Sentinel (Study Execution)", "task_type": TaskType.SIMULATIVE,
             "title": "Protocol Amendment Impact Simulation",
             "description": f"Simulated impact of proposed inclusion criteria relaxation: +{self.rng.randint(15, 40)}% eligible patient pool, +{self.rng.uniform(0.5, 2.0):.1f} patients/site/month enrollment rate. Risk: {self.rng.uniform(2, 8):.1f}% increase in screen failures. Timeline impact: {self.rng.randint(2, 6)} months earlier LPI.",
             "severity": Severity.INFO, "data": {"pool_increase": 28, "timeline_acceleration": 3}},

            {"agent": AgentType.EXECUTION, "agent_name": "Sentinel (Study Execution)", "task_type": TaskType.AGENTIC,
             "title": "Automated Protocol Deviation Response",
             "description": f"Detected protocol deviation at {self.rng.choice(site_names)}: visit window violation for Visit 6 ({self.rng.randint(2,7)} days out of window). Autonomously: (1) generated CAPA form, (2) sent corrective action notice to site, (3) updated deviation log, (4) flagged for medical monitor review if safety-relevant.",
             "severity": Severity.WARNING, "data": {"deviation_type": "visit_window", "days_out": 4}},

            # ── Regulatory Submission Agent ──
            {"agent": AgentType.REGULATORY, "agent_name": "Compass (Regulatory & Submissions)", "task_type": TaskType.DESCRIPTIVE,
             "title": "Regulatory Landscape Summary",
             "description": f"Regulatory status across {len(study.countries)} countries: {len([c for c in study.countries if c.status == CountryStatus.APPROVED])} approved, {len([c for c in study.countries if c.status == CountryStatus.REGULATORY_SUBMITTED])} pending, {len([c for c in study.countries if c.status == CountryStatus.SELECTED])} in preparation. Next deadline: Ethics renewal for {self.rng.choice(country_names)} in {self.rng.randint(2, 8)} weeks.",
             "severity": Severity.INFO, "data": {"approved": 5, "pending": 2}},

            {"agent": AgentType.REGULATORY, "agent_name": "Compass (Regulatory & Submissions)", "task_type": TaskType.PREDICTIVE,
             "title": "Regulatory Approval Timeline Forecast",
             "description": f"ML model predicts approval for {self.rng.choice(country_names)} pending CTA: {self.rng.randint(3, 8)} weeks (80% CI: [{self.rng.randint(2, 4)}, {self.rng.randint(6, 12)}] weeks). Model trained on 12,000+ global regulatory submissions.",
             "severity": Severity.INFO, "data": {"predicted_weeks": 5}},

            {"agent": AgentType.REGULATORY, "agent_name": "Compass (Regulatory & Submissions)", "task_type": TaskType.GENERATIVE,
             "title": "IND Safety Report Auto-Generated",
             "description": f"Generated IND Annual Safety Report draft covering {self.rng.randint(50, 200)} patients across {len(study.countries)} countries. Report includes: aggregate AE tables, narrative summaries for {self.rng.randint(2, 8)} SAEs, updated risk-benefit assessment. Ready for medical writer review.",
             "severity": Severity.SUCCESS, "data": {"patients_covered": 150, "saes": 5}},

            {"agent": AgentType.REGULATORY, "agent_name": "Compass (Regulatory & Submissions)", "task_type": TaskType.AGENTIC,
             "title": "Automated Regulatory Intelligence Alert",
             "description": f"Detected regulatory guideline change in {self.rng.choice(country_names)} affecting {study.therapeutic_area.value} trials: new biomarker reporting requirement effective in 60 days. Autonomously: (1) assessed protocol impact, (2) drafted protocol amendment language, (3) notified Master Agent, (4) scheduled regulatory strategy review.",
             "severity": Severity.CRITICAL, "human_required": True,
             "data": {"guideline_change": True, "days_until_effective": 60}},

            {"agent": AgentType.REGULATORY, "agent_name": "Compass (Regulatory & Submissions)", "task_type": TaskType.OPTIMIZATION,
             "title": "Submission Sequencing Optimized",
             "description": f"Optimized regulatory submission sequence for remaining {self.rng.randint(2, 5)} countries using critical path analysis. New sequence reduces overall approval timeline by {self.rng.randint(3, 8)} weeks. Key insight: parallel submissions to {self.rng.choice(country_names)} and {self.rng.choice(country_names)} now feasible.",
             "severity": Severity.SUCCESS, "data": {"weeks_saved": 5}},
        ]

        return templates

    def generate_full_demo(self) -> Dict:
        """
        Generate a complete demo dataset with one primary study and agent actions.
        Returns everything needed for the frontend to render a full demo.
        """
        study = self.generate_study(
            therapeutic_area=TherapeuticArea.ONCOLOGY,
            phase=StudyPhase.PHASE_III,
            num_countries=10,
            num_sites=45,
            study_duration_months=36,
        )

        agent_actions = self.generate_agent_actions(study, count=60)

        # Generate enrollment forecast (future projection)
        forecast = self._generate_enrollment_forecast(study)

        return {
            "study": study,
            "agent_actions": agent_actions,
            "enrollment_forecast": forecast,
        }

    def _generate_enrollment_forecast(self, study: Study) -> List[EnrollmentSnapshot]:
        """Generate future enrollment projections."""
        if not study.enrollment_timeline:
            return []

        last = study.enrollment_timeline[-1]
        forecast = []
        current_enrolled = last.enrolled
        months_remaining = max(1, (study.estimated_primary_completion - last.date).days // 30)

        for m in range(1, months_remaining + 1):
            d = last.date + timedelta(days=m * 30)
            monthly_rate = (study.target_enrollment - current_enrolled) / max(1, months_remaining - m + 1)
            noise = self.rng.uniform(0.7, 1.3)
            new_enrolled = int(monthly_rate * noise)
            current_enrolled = min(current_enrolled + new_enrolled, study.target_enrollment)

            forecast.append(EnrollmentSnapshot(
                date=d,
                screened=int(current_enrolled * 1.5),
                screen_failed=int(current_enrolled * 0.35),
                enrolled=current_enrolled,
                randomized=int(current_enrolled * 0.92),
                completed=int(current_enrolled * 0.6),
                discontinued=int(current_enrolled * 0.05),
                target=study.target_enrollment,
            ))

        return forecast
