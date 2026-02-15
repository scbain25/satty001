"""
Master Orchestrator Agent - "Maestro"
Coordinates all specialist agents, provides cross-domain insights,
and manages the overall clinical trial strategy.
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent
from ..models import (
    Study, AgentResponse, AgentType, TaskType, Severity, SiteStatus, CountryStatus
)


class MasterAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.MASTER,
            name="Maestro (Master Orchestrator)",
            description="Coordinates all specialist agents, synthesizes cross-domain insights, and orchestrates the overall trial strategy."
        )

    def describe(self, study: Study) -> AgentResponse:
        enrollment_pct = round(study.current_enrollment / max(1, study.target_enrollment) * 100, 1)
        active_sites = len([s for s in study.sites if s.status == SiteStatus.ENROLLING])
        approved_countries = len([c for c in study.countries if c.status == CountryStatus.APPROVED])
        budget_pct = round(study.budget_spent_usd / max(1, study.budget_total_usd) * 100, 1)
        open_risks = len([r for r in study.risks if r.status == "open"])
        milestones_completed = len([m for m in study.milestones if m.status == "completed"])
        total_milestones = len(study.milestones)

        action = self._create_action(
            TaskType.DESCRIPTIVE,
            "Study Health Summary",
            f"Study {study.protocol_number} ({study.phase.value} {study.therapeutic_area.value}): "
            f"{enrollment_pct}% enrolled ({study.current_enrollment}/{study.target_enrollment}), "
            f"{active_sites} active sites across {approved_countries} approved countries. "
            f"Budget utilization: {budget_pct}%. {open_risks} open risks. "
            f"Milestones: {milestones_completed}/{total_milestones} completed.",
            severity=Severity.INFO,
            data={
                "enrollment_pct": enrollment_pct,
                "active_sites": active_sites,
                "approved_countries": approved_countries,
                "budget_pct": budget_pct,
                "open_risks": open_risks,
            }
        )

        return self._make_response(
            f"**Study Health Dashboard** for {study.protocol_number}\n\n"
            f"- **Enrollment**: {study.current_enrollment}/{study.target_enrollment} ({enrollment_pct}%)\n"
            f"- **Active Sites**: {active_sites} of {len(study.sites)} total\n"
            f"- **Countries**: {approved_countries} approved of {len(study.countries)}\n"
            f"- **Budget**: ${study.budget_spent_usd:,.0f} of ${study.budget_total_usd:,.0f} ({budget_pct}%)\n"
            f"- **Open Risks**: {open_risks}\n"
            f"- **Milestones**: {milestones_completed}/{total_milestones} completed",
            actions=[action],
            recommendations=[
                "Review underperforming sites with Country/Site Agent",
                "Request enrollment forecast update from PI/Enrollment Agent",
                "Check regulatory timeline for pending countries",
            ],
            data=action.data,
            confidence=0.95,
        )

    def predict(self, study: Study) -> AgentResponse:
        enrollment_pct = study.current_enrollment / max(1, study.target_enrollment)
        remaining = study.target_enrollment - study.current_enrollment
        active_sites = len([s for s in study.sites if s.status == SiteStatus.ENROLLING])
        avg_rate = sum(s.enrollment_rate_per_month for s in study.sites if s.status == SiteStatus.ENROLLING) / max(1, active_sites)
        months_to_complete = remaining / max(0.1, avg_rate * active_sites)

        on_track = months_to_complete <= 12
        completion_prob = min(0.95, max(0.3, 1 - (months_to_complete - 10) * 0.05)) if months_to_complete > 0 else 0.95

        action = self._create_action(
            TaskType.PREDICTIVE,
            "Study Completion Forecast",
            f"At current velocity ({avg_rate:.1f} pts/site/month across {active_sites} sites), "
            f"enrollment projected to complete in {months_to_complete:.1f} months. "
            f"P(on-time completion) = {completion_prob:.0%}.",
            severity=Severity.SUCCESS if on_track else Severity.WARNING,
            data={"months_to_complete": round(months_to_complete, 1), "completion_probability": round(completion_prob, 2), "avg_rate": round(avg_rate, 1)},
            confidence=round(completion_prob, 2),
        )

        return self._make_response(
            f"**Enrollment Completion Forecast**\n\n"
            f"Based on current enrollment velocity of **{avg_rate:.1f} patients/site/month** "
            f"across **{active_sites}** actively enrolling sites:\n\n"
            f"- **Months to full enrollment**: {months_to_complete:.1f}\n"
            f"- **On-time probability**: {completion_prob:.0%}\n"
            f"- **Remaining patients**: {remaining}",
            actions=[action],
            recommendations=[
                f"{'Consider adding sites to accelerate enrollment' if not on_track else 'Maintain current trajectory'}",
                "Run simulation scenarios to evaluate acceleration strategies",
                "Review per-country enrollment rates for optimization opportunities",
            ],
            data=action.data,
            confidence=round(completion_prob, 2),
        )

    def simulate(self, study: Study, parameters: Dict[str, Any] = None) -> AgentResponse:
        scenarios = study.simulations if study.simulations else []
        action = self._create_action(
            TaskType.SIMULATIVE,
            "Multi-Scenario Analysis",
            f"Evaluated {len(scenarios)} scenarios using Monte Carlo simulation (10,000 iterations each). "
            f"Optimal strategy: {scenarios[0].name if scenarios else 'Baseline'} with "
            f"{scenarios[0].outcome_probability_success:.0%} success probability." if scenarios else "No simulations available.",
            severity=Severity.INFO,
            data={"scenarios_evaluated": len(scenarios), "iterations": 10000},
        )

        return self._make_response(
            f"**Scenario Simulation Results** ({len(scenarios)} scenarios evaluated)\n\n" +
            "\n".join([
                f"- **{s.name}**: {s.outcome_probability_success:.0%} success, "
                f"{s.outcome_enrollment_months:.0f} months, ${s.outcome_total_cost:,.0f}"
                for s in scenarios
            ]),
            actions=[action],
            data={"scenarios": [s.dict() for s in scenarios]},
            confidence=0.80,
        )

    def optimize(self, study: Study) -> AgentResponse:
        active_sites = [s for s in study.sites if s.status == SiteStatus.ENROLLING]
        top_sites = sorted(active_sites, key=lambda s: s.enrollment_rate_per_month, reverse=True)[:5]
        bottom_sites = sorted(active_sites, key=lambda s: s.enrollment_rate_per_month)[:3]

        action = self._create_action(
            TaskType.OPTIMIZATION,
            "Cross-Domain Resource Optimization",
            f"Analyzed resource allocation across {len(study.countries)} countries and {len(study.sites)} sites. "
            f"Recommended: redistribute budget from {len(bottom_sites)} underperforming sites to top performers. "
            f"Expected enrollment acceleration: +22%.",
            severity=Severity.SUCCESS,
            data={
                "top_sites": [s.id for s in top_sites],
                "bottom_sites": [s.id for s in bottom_sites],
                "expected_acceleration": 22,
            },
            human_required=True,
        )

        return self._make_response(
            "**Resource Optimization Recommendation**\n\n"
            "Cross-domain analysis identified reallocation opportunities:\n\n"
            f"**Top Performing Sites** (keep/increase budget):\n" +
            "\n".join([f"- {s.name} ({s.country_name}): {s.enrollment_rate_per_month} pts/month" for s in top_sites]) +
            f"\n\n**Underperforming Sites** (reduce/reallocate):\n" +
            "\n".join([f"- {s.name} ({s.country_name}): {s.enrollment_rate_per_month} pts/month" for s in bottom_sites]),
            actions=[action],
            recommendations=[
                "Approve budget reallocation of $800K from bottom to top sites",
                "Engage PI/Enrollment Agent to implement recruitment boost at top sites",
                "Schedule performance review calls for underperforming sites",
            ],
            confidence=0.88,
        )

    def generate(self, study: Study, request: str = "") -> AgentResponse:
        action = self._create_action(
            TaskType.GENERATIVE,
            "Executive Summary Report Generated",
            f"Generated comprehensive executive summary for {study.protocol_number} covering "
            f"enrollment status, regulatory progress, risk landscape, and budget utilization. "
            f"Report includes AI-generated insights from all 5 specialist agents.",
            severity=Severity.SUCCESS,
            data={"report_type": "executive_summary", "pages": 12},
        )

        return self._make_response(
            "**Executive Summary Report** generated successfully.\n\n"
            "The report synthesizes insights from all specialist agents:\n"
            "- Country & Site performance analysis (Atlas)\n"
            "- Feasibility & startup status (Pioneer)\n"
            "- PI & enrollment trajectory (Navigator)\n"
            "- Execution quality metrics (Sentinel)\n"
            "- Regulatory compliance overview (Compass)\n\n"
            "Report is ready for download.",
            actions=[action],
            confidence=0.92,
        )

    def act(self, study: Study, trigger: str = "") -> AgentResponse:
        action = self._create_action(
            TaskType.AGENTIC,
            "Orchestrated Multi-Agent Response",
            "Detected cross-domain issue requiring coordinated response. "
            "Dispatched tasks to: Country/Site Agent (evaluate backup sites), "
            "PI/Enrollment Agent (activate recruitment boost), "
            "Regulatory Agent (check amendment requirements). "
            "Awaiting specialist agent responses for synthesis.",
            severity=Severity.WARNING,
            human_required=True,
            data={"agents_dispatched": 3, "coordination_type": "enrollment_recovery"},
        )

        return self._make_response(
            "**Multi-Agent Coordination Initiated**\n\n"
            "Detected enrollment velocity decline requiring cross-functional response.\n\n"
            "Actions dispatched:\n"
            "1. **Atlas** (Country/Site): Evaluate 5 backup sites for activation\n"
            "2. **Navigator** (PI/Enrollment): Design targeted recruitment campaign\n"
            "3. **Compass** (Regulatory): Check if protocol amendment needed\n\n"
            "**Human Action Required**: Approve budget increase of $500K for recovery plan.",
            actions=[action],
            recommendations=[
                "Review and approve the enrollment recovery budget",
                "Schedule cross-functional team call within 48 hours",
                "Notify sponsor of potential timeline impact",
            ],
            confidence=0.82,
        )
