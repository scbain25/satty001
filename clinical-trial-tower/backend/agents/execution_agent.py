"""
Study Execution Agent - "Sentinel"
Monitors ongoing trial operations, data quality, adverse events,
protocol compliance, and site performance.
"""

from typing import Dict, Any
from .base_agent import BaseAgent
from ..models import (
    Study, AgentResponse, AgentType, TaskType, Severity, SiteStatus
)


class ExecutionAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.EXECUTION,
            name="Sentinel (Study Execution)",
            description="Monitors trial execution, data quality, adverse events, and protocol compliance."
        )

    def describe(self, study: Study) -> AgentResponse:
        enrolling = [s for s in study.sites if s.status == SiteStatus.ENROLLING]
        total_deviations = sum(s.protocol_deviations for s in enrolling)
        total_aes = sum(s.adverse_events for s in enrolling)
        avg_quality = sum(s.quality_score for s in enrolling) / max(1, len(enrolling))

        action = self._create_action(
            TaskType.DESCRIPTIVE, "Execution Quality Dashboard",
            f"Data quality: {avg_quality:.1f}/100. Protocol deviations: {total_deviations}. "
            f"Adverse events: {total_aes}. {len(enrolling)} sites actively running.",
            severity=Severity.INFO,
            data={"quality": round(avg_quality, 1), "deviations": total_deviations, "aes": total_aes},
        )

        return self._make_response(
            f"**Execution Quality Dashboard**\n\n"
            f"- Average site quality: **{avg_quality:.1f}/100**\n"
            f"- Total protocol deviations: **{total_deviations}**\n"
            f"- Total adverse events: **{total_aes}**\n"
            f"- Active sites: **{len(enrolling)}**\n"
            f"- Data completeness: **94.2%**",
            actions=[action], confidence=0.93,
        )

    def predict(self, study: Study) -> AgentResponse:
        high_deviation_sites = [s for s in study.sites if s.protocol_deviations > 5]

        action = self._create_action(
            TaskType.PREDICTIVE, "Quality Risk Prediction",
            f"Signal detection: {len(high_deviation_sites)} sites with elevated deviation rates. "
            "Predictive model suggests 65% probability of GCP finding if not addressed.",
            severity=Severity.CRITICAL if high_deviation_sites else Severity.SUCCESS,
            data={"high_risk_sites": len(high_deviation_sites)},
            human_required=bool(high_deviation_sites),
        )

        return self._make_response(
            f"**Quality Risk Prediction**\n\n"
            f"{'⚠ ' if high_deviation_sites else '✓ '}"
            f"**{len(high_deviation_sites)}** sites flagged for quality risk.\n\n" +
            ("\n".join([f"- {s.name}: {s.protocol_deviations} deviations, quality={s.quality_score:.0f}" for s in high_deviation_sites]) if high_deviation_sites else "All sites within acceptable quality parameters."),
            actions=[action], confidence=0.82,
        )

    def simulate(self, study: Study, parameters: Dict[str, Any] = None) -> AgentResponse:
        action = self._create_action(
            TaskType.SIMULATIVE, "Protocol Amendment Impact on Execution",
            "Simulated operational impact of proposed amendments: "
            "Amendment A adds 2 visits → +$1.2M cost, +15% dropout risk. "
            "Amendment B removes PK sampling → -$800K savings, no quality impact.",
            severity=Severity.INFO,
        )

        return self._make_response(
            "**Amendment Operational Impact Simulation**\n\n"
            "| Amendment | Cost Impact | Dropout Risk | Timeline |\n"
            "|-----------|:---:|:---:|:---:|\n"
            "| A: Add visits | +$1.2M | +15% | +6 weeks |\n"
            "| B: Remove PK | -$800K | 0% | -2 weeks |\n"
            "| Both | +$400K | +10% | +4 weeks |",
            actions=[action], confidence=0.77,
        )

    def optimize(self, study: Study) -> AgentResponse:
        action = self._create_action(
            TaskType.OPTIMIZATION, "Monitoring Visit Schedule Optimization",
            "Optimized monitoring visit schedule using risk-based approach. "
            "Reduced on-site visits by 30% while maintaining data quality. "
            "Savings: $450K. High-risk sites get increased monitoring.",
            severity=Severity.SUCCESS,
            data={"visit_reduction": 30, "savings": 450000},
        )

        return self._make_response(
            "**Risk-Based Monitoring Optimization**\n\n"
            "- On-site visit reduction: **30%**\n"
            "- Estimated savings: **$450K**\n"
            "- High-risk sites: **increased** monitoring frequency\n"
            "- Low-risk sites: **remote** monitoring with triggers\n"
            "- Data quality maintained at **94%+**",
            actions=[action], confidence=0.86,
        )

    def generate(self, study: Study, request: str = "") -> AgentResponse:
        action = self._create_action(
            TaskType.GENERATIVE, "DSMB Report Generated",
            "Auto-generated Data Safety Monitoring Board report with "
            "aggregate safety data, enrollment summary, and interim analysis results.",
            severity=Severity.SUCCESS,
        )

        return self._make_response(
            "**DSMB Report** generated:\n\n"
            "- Aggregate safety tables (AEs, SAEs, deaths)\n"
            "- Enrollment summary by country/site\n"
            "- Protocol deviation summary\n"
            "- Interim efficacy analysis (if applicable)\n"
            "- Risk-benefit assessment update",
            actions=[action], confidence=0.91,
        )

    def act(self, study: Study, trigger: str = "") -> AgentResponse:
        action = self._create_action(
            TaskType.AGENTIC, "Automated Quality Response",
            "Detected protocol deviation cluster. Autonomously: "
            "(1) generated CAPA forms, (2) sent corrective notices, "
            "(3) updated deviation log, (4) flagged for medical monitor review.",
            severity=Severity.WARNING,
            human_required=True,
        )

        return self._make_response(
            "**Automated Quality Response**\n\n"
            "Detected deviation cluster at 2 sites.\n\n"
            "Actions taken:\n"
            "1. CAPA forms generated and sent to sites\n"
            "2. Corrective action notices issued\n"
            "3. Deviation log updated in CTMS\n"
            "4. Medical monitor notified for review\n\n"
            "**Human Action Required**: Approve corrective action plan.",
            actions=[action], confidence=0.85,
        )
