"""
Feasibility & Study Startup Agent - "Pioneer"
Analyzes protocol feasibility, manages study startup timelines,
and coordinates site readiness assessments.
"""

from typing import Dict, Any
from .base_agent import BaseAgent
from ..models import (
    Study, AgentResponse, AgentType, TaskType, Severity, SiteStatus
)


class FeasibilityStartupAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.FEASIBILITY_STARTUP,
            name="Pioneer (Feasibility & Startup)",
            description="Analyzes protocol feasibility, manages study startup, and coordinates site readiness."
        )

    def describe(self, study: Study) -> AgentResponse:
        activated = len([s for s in study.sites if s.status in [SiteStatus.ACTIVATED, SiteStatus.ENROLLING]])
        pending = len([s for s in study.sites if s.status in [SiteStatus.IDENTIFIED, SiteStatus.SELECTED]])
        avg_activation_days = 90  # Simulated

        action = self._create_action(
            TaskType.DESCRIPTIVE, "Study Startup Status Report",
            f"Startup progress: {activated}/{len(study.sites)} sites activated. "
            f"{pending} pending activation. Average activation time: {avg_activation_days} days.",
            severity=Severity.INFO,
            data={"activated": activated, "pending": pending, "avg_days": avg_activation_days},
        )

        return self._make_response(
            f"**Study Startup Status**\n\n"
            f"- Sites activated: **{activated}/{len(study.sites)}**\n"
            f"- Pending activation: **{pending}**\n"
            f"- Average activation time: **{avg_activation_days} days**\n"
            f"- Protocol complexity score: **72/100** (medium-high)",
            actions=[action], confidence=0.92,
        )

    def predict(self, study: Study) -> AgentResponse:
        pending_sites = [s for s in study.sites if s.status in [SiteStatus.IDENTIFIED, SiteStatus.SELECTED]]
        action = self._create_action(
            TaskType.PREDICTIVE, "Site Activation Timeline Forecast",
            f"Predicted activation timeline for {len(pending_sites)} pending sites: "
            f"median 10 weeks (80% CI: [7, 16] weeks). "
            f"3 sites likely to experience delays due to ethics committee backlog.",
            severity=Severity.WARNING if pending_sites else Severity.SUCCESS,
            data={"pending": len(pending_sites), "median_weeks": 10},
        )

        return self._make_response(
            f"**Activation Timeline Forecast**\n\n"
            f"- Pending sites: **{len(pending_sites)}**\n"
            f"- Median activation: **10 weeks**\n"
            f"- 80% CI: **[7, 16] weeks**\n"
            f"- Sites at risk of delay: **3**",
            actions=[action], confidence=0.78,
        )

    def simulate(self, study: Study, parameters: Dict[str, Any] = None) -> AgentResponse:
        action = self._create_action(
            TaskType.SIMULATIVE, "Protocol Amendment Impact Simulation",
            "Simulated impact of 3 protocol amendment scenarios on startup timeline. "
            "Scenario A (relax age criteria): +15% eligible pool, +4 week delay. "
            "Scenario B (remove biomarker): +25% pool, +8 week delay. "
            "Scenario C (both): +35% pool, +10 week delay.",
            severity=Severity.INFO,
            data={"scenarios": 3},
        )

        return self._make_response(
            "**Protocol Amendment Impact Simulation**\n\n"
            "| Scenario | Pool Increase | Delay | Net Benefit |\n"
            "|----------|:---:|:---:|:---:|\n"
            "| A: Relax age criteria | +15% | +4 wks | Moderate |\n"
            "| B: Remove biomarker | +25% | +8 wks | High |\n"
            "| C: Both A + B | +35% | +10 wks | Highest |",
            actions=[action], confidence=0.75,
        )

    def optimize(self, study: Study) -> AgentResponse:
        action = self._create_action(
            TaskType.OPTIMIZATION, "Startup Sequence Optimization",
            "Optimized site activation sequence using critical path analysis. "
            "New sequence reduces overall startup timeline by 3 weeks. "
            "Priority: activate high-enrollment-potential sites first.",
            severity=Severity.SUCCESS,
            data={"weeks_saved": 3},
            human_required=True,
        )

        return self._make_response(
            "**Startup Sequence Optimization**\n\n"
            "Recommended activation priority:\n"
            "1. US sites (highest enrollment potential)\n"
            "2. UK/Germany sites (fast regulatory)\n"
            "3. Japan/Korea sites (parallel track)\n"
            "4. LatAm sites (cost optimization)\n\n"
            "**Expected savings: 3 weeks on critical path**",
            actions=[action], confidence=0.85,
        )

    def generate(self, study: Study, request: str = "") -> AgentResponse:
        action = self._create_action(
            TaskType.GENERATIVE, "Feasibility Questionnaire Package Generated",
            f"Generated tailored feasibility questionnaire package for {study.therapeutic_area.value} "
            f"({study.indication}) with country-specific regulatory checklists.",
            severity=Severity.SUCCESS,
        )

        return self._make_response(
            "**Feasibility Package** generated:\n\n"
            "- Site feasibility questionnaire (customized)\n"
            "- PI qualification checklist\n"
            "- Equipment requirements matrix\n"
            "- Patient population assessment tool\n"
            "- Regulatory requirement checklist (per country)",
            actions=[action], confidence=0.90,
        )

    def act(self, study: Study, trigger: str = "") -> AgentResponse:
        action = self._create_action(
            TaskType.AGENTIC, "Automated Site Readiness Assessment",
            "Assessed readiness of 5 sites pending activation. "
            "3 READY (auto-approved), 1 CONDITIONAL (missing IRB), 1 NOT READY (PI conflict). "
            "Auto-sent notifications and escalated blockers.",
            severity=Severity.WARNING,
            human_required=True,
            data={"ready": 3, "conditional": 1, "not_ready": 1},
        )

        return self._make_response(
            "**Automated Readiness Assessment**\n\n"
            "- 3 sites: **READY** (auto-approved for activation)\n"
            "- 1 site: **CONDITIONAL** (missing IRB approval - notification sent)\n"
            "- 1 site: **NOT READY** (PI availability conflict - escalated)\n\n"
            "**Human Action Required**: Review conditional site and approve activation.",
            actions=[action], confidence=0.88,
        )
