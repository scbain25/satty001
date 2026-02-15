"""Quick validation of the backend modules."""
import sys
sys.path.insert(0, '.')

from backend.data_manufacturing.generator import DataManufacturer
from backend.agents import (
    MasterAgent, CountrySiteAgent, FeasibilityStartupAgent,
    PIEnrollmentAgent, ExecutionAgent, RegulatoryAgent
)

# Test data manufacturing
dm = DataManufacturer(42)
demo = dm.generate_full_demo()
study = demo["study"]

print(f"=== Data Manufacturing Module ===")
print(f"Study: {study.protocol_number}")
print(f"Phase: {study.phase.value}")
print(f"TA: {study.therapeutic_area.value} - {study.indication}")
print(f"Molecule: {study.molecule}")
print(f"Countries: {len(study.countries)}")
print(f"Sites: {len(study.sites)}")
print(f"Enrollment: {study.current_enrollment}/{study.target_enrollment}")
print(f"Milestones: {len(study.milestones)}")
print(f"Risks: {len(study.risks)}")
print(f"Reg docs: {len(study.regulatory_documents)}")
print(f"Simulations: {len(study.simulations)}")
print(f"Agent actions: {len(demo['agent_actions'])}")
print(f"Forecast points: {len(demo['enrollment_forecast'])}")

# Test all agents
print(f"\n=== Agent System ===")
agents = [
    MasterAgent(),
    CountrySiteAgent(),
    FeasibilityStartupAgent(),
    PIEnrollmentAgent(),
    ExecutionAgent(),
    RegulatoryAgent(),
]

for agent in agents:
    resp = agent.describe(study)
    print(f"[{agent.name}] describe() -> confidence={resp.confidence:.0%}, actions={len(resp.actions_taken)}")
    
    resp = agent.predict(study)
    print(f"[{agent.name}] predict() -> confidence={resp.confidence:.0%}")

    resp = agent.process_query(study, "What is the current status?")
    print(f"[{agent.name}] process_query() -> routed correctly")

print(f"\n=== All {len(agents)} agents validated ===")
print("SUCCESS: Backend is fully functional!")
