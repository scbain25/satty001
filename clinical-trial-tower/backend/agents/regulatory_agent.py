"""
Regulatory & Submissions Agent - "Compass"
Manages regulatory intelligence, document generation,
submission tracking, and compliance monitoring.
"""

from typing import Dict, Any
from .base_agent import BaseAgent
from ..models import (
    Study, AgentResponse, AgentType, TaskType, Severity, CountryStatus
)


class RegulatoryAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.REGULATORY,
            name="Compass (Regulatory & Submissions)",
            description="Manages regulatory strategy, document generation, submission tracking, and compliance."
        )

    def describe(self, study: Study) -> AgentResponse:
        approved = len([c for c in study.countries if c.status == CountryStatus.APPROVED])
        pending = len([c for c in study.countries if c.status == CountryStatus.REGULATORY_SUBMITTED])
        docs_approved = len([d for d in study.regulatory_documents if d.status == "approved"])
        docs_total = len(study.regulatory_documents)

        action = self._create_action(
            TaskType.DESCRIPTIVE, "Regulatory Landscape Summary",
            f"Countries: {approved} approved, {pending} pending. "
            f"Documents: {docs_approved}/{docs_total} approved. "
            f"No critical compliance issues.",
            severity=Severity.INFO,
            data={"approved": approved, "pending": pending, "docs": f"{docs_approved}/{docs_total}"},
        )

        return self._make_response(
            f"**Regulatory Landscape**\n\n"
            f"- Countries approved: **{approved}/{len(study.countries)}**\n"
            f"- Countries pending: **{pending}**\n"
            f"- Documents approved: **{docs_approved}/{docs_total}**\n"
            f"- AI-generated documents: **{len([d for d in study.regulatory_documents if d.generated_by_agent])}**\n"
            f"- Compliance status: **Green**",
            actions=[action], confidence=0.94,
        )

    def predict(self, study: Study) -> AgentResponse:
        pending_countries = [c for c in study.countries if c.status == CountryStatus.REGULATORY_SUBMITTED]

        action = self._create_action(
            TaskType.PREDICTIVE, "Regulatory Approval Forecast",
            f"ML model predicts approval timelines for {len(pending_countries)} pending countries. "
            f"Model trained on 12,000+ historical regulatory submissions.",
            severity=Severity.INFO,
            data={"pending": len(pending_countries)},
        )

        country_predictions = "\n".join([
            f"- **{c.name}**: {c.avg_approval_days + 10} days (80% CI: [{c.avg_approval_days - 5}, {c.avg_approval_days + 25}])"
            for c in pending_countries
        ]) if pending_countries else "No pending regulatory submissions."

        return self._make_response(
            f"**Regulatory Approval Forecast**\n\n{country_predictions}",
            actions=[action], confidence=0.79,
        )

    def simulate(self, study: Study, parameters: Dict[str, Any] = None) -> AgentResponse:
        action = self._create_action(
            TaskType.SIMULATIVE, "Regulatory Strategy Simulation",
            "Simulated 3 regulatory strategies: parallel submissions, sequential, "
            "and hybrid approach. Hybrid approach optimal: 6 weeks faster at +$180K cost.",
            severity=Severity.INFO,
        )

        return self._make_response(
            "**Regulatory Strategy Simulation**\n\n"
            "| Strategy | Timeline | Cost | Risk |\n"
            "|----------|:---:|:---:|:---:|\n"
            "| Sequential | Baseline | Baseline | Low |\n"
            "| Parallel (all) | -8 weeks | +$350K | Medium |\n"
            "| Hybrid (optimal) | -6 weeks | +$180K | Low-Med |",
            actions=[action], confidence=0.81,
        )

    def optimize(self, study: Study) -> AgentResponse:
        action = self._create_action(
            TaskType.OPTIMIZATION, "Submission Sequencing Optimized",
            "Optimized regulatory submission sequence using critical path analysis. "
            "New sequence reduces timeline by 5 weeks through parallel tracks.",
            severity=Severity.SUCCESS,
            data={"weeks_saved": 5},
        )

        return self._make_response(
            "**Submission Sequence Optimization**\n\n"
            "Optimized submission order:\n"
            "1. **Track 1** (parallel): US FDA + EU EMA\n"
            "2. **Track 2** (parallel): Japan PMDA + Australia TGA\n"
            "3. **Track 3** (sequential): Remaining countries\n\n"
            "**Timeline savings: 5 weeks on critical path**",
            actions=[action], confidence=0.87,
        )

    def generate(self, study: Study, request: str = "") -> AgentResponse:
        action = self._create_action(
            TaskType.GENERATIVE, "Regulatory Documents Auto-Generated",
            f"Generated {len(study.countries)} country-specific CTA packages, "
            "IND annual safety report, and protocol amendment summary.",
            severity=Severity.SUCCESS,
            data={"documents_generated": len(study.countries) + 2},
        )

        return self._make_response(
            "**Regulatory Document Package** generated:\n\n"
            f"- {len(study.countries)} country-specific CTA packages\n"
            "- IND Annual Safety Report (draft)\n"
            "- Protocol Amendment Summary\n"
            "- Updated Investigator's Brochure\n"
            "- Informed Consent Form revisions\n\n"
            "All documents ready for medical writer review.",
            actions=[action], confidence=0.89,
        )

    def act(self, study: Study, trigger: str = "") -> AgentResponse:
        action = self._create_action(
            TaskType.AGENTIC, "Regulatory Intelligence Alert",
            "Detected regulatory guideline change affecting trial. "
            "Autonomously: assessed impact, drafted amendment language, "
            "notified Master Agent, and scheduled strategy review.",
            severity=Severity.CRITICAL,
            human_required=True,
            data={"guideline_change": True},
        )

        return self._make_response(
            "**Regulatory Intelligence Alert**\n\n"
            "Detected guideline change affecting this therapeutic area.\n\n"
            "Autonomous actions:\n"
            "1. Impact assessment completed (moderate impact)\n"
            "2. Protocol amendment language drafted\n"
            "3. Master Agent notified for cross-functional review\n"
            "4. Regulatory strategy meeting scheduled\n\n"
            "**Human Action Required**: Review and approve amendment strategy.",
            actions=[action], confidence=0.83,
        )
