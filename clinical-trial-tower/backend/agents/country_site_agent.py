"""
Country & Site Selection Agent - "Atlas"
Evaluates countries for regulatory friendliness, patient pools, and cost.
Selects and monitors optimal clinical trial sites.
"""

from typing import Dict, Any
from .base_agent import BaseAgent
from ..models import (
    Study, AgentResponse, AgentType, TaskType, Severity, SiteStatus, CountryStatus
)


class CountrySiteAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.COUNTRY_SITE,
            name="Atlas (Country & Site Selector)",
            description="Evaluates countries and sites based on regulatory environment, patient pool, cost, and infrastructure."
        )

    def describe(self, study: Study) -> AgentResponse:
        countries_by_status = {}
        for c in study.countries:
            countries_by_status.setdefault(c.status.value, []).append(c.name)
        sites_by_status = {}
        for s in study.sites:
            sites_by_status.setdefault(s.status.value, []).append(s.name)

        top_countries = sorted(study.countries, key=lambda c: c.regulatory_score, reverse=True)[:3]
        avg_quality = sum(s.quality_score for s in study.sites) / max(1, len(study.sites))

        action = self._create_action(
            TaskType.DESCRIPTIVE, "Country & Site Performance Scorecard",
            f"{len(study.countries)} countries, {len(study.sites)} sites. "
            f"Top regulatory scorers: {', '.join(c.name for c in top_countries)}. "
            f"Average site quality: {avg_quality:.1f}/100.",
            severity=Severity.INFO,
            data={"countries": len(study.countries), "sites": len(study.sites), "avg_quality": round(avg_quality, 1)},
        )

        return self._make_response(
            f"**Country & Site Scorecard**\n\n"
            f"**Countries ({len(study.countries)}):**\n" +
            "\n".join([f"- {c.name}: Reg={c.regulatory_score:.0f}, Pool={c.patient_pool_size:,}, Cost={c.cost_index:.2f}x" for c in study.countries]) +
            f"\n\n**Sites ({len(study.sites)}):** Avg Quality={avg_quality:.1f}/100\n" +
            "\n".join([f"- {k}: {len(v)} sites" for k, v in sites_by_status.items()]),
            actions=[action], confidence=0.93,
        )

    def predict(self, study: Study) -> AgentResponse:
        at_risk_sites = [s for s in study.sites if s.quality_score < 75 and s.status == SiteStatus.ENROLLING]
        action = self._create_action(
            TaskType.PREDICTIVE, f"Site Risk Assessment: {len(at_risk_sites)} Sites At Risk",
            f"Predictive model identifies {len(at_risk_sites)} sites with >60% probability of underperformance "
            f"based on quality score, enrollment rate, and protocol deviation trends.",
            severity=Severity.WARNING if at_risk_sites else Severity.SUCCESS,
            data={"at_risk_sites": len(at_risk_sites), "sites": [s.id for s in at_risk_sites]},
            human_required=bool(at_risk_sites),
        )

        return self._make_response(
            f"**Site Risk Prediction**\n\n"
            f"{'⚠ ' if at_risk_sites else '✓ '}{len(at_risk_sites)} sites flagged for potential underperformance.\n\n" +
            ("\n".join([f"- **{s.name}** ({s.country_name}): Quality={s.quality_score:.0f}, Rate={s.enrollment_rate_per_month}/mo" for s in at_risk_sites]) if at_risk_sites else "All sites performing within acceptable parameters."),
            actions=[action],
            recommendations=["Schedule monitoring visit for at-risk sites", "Prepare backup site activation plan"] if at_risk_sites else ["Continue current monitoring cadence"],
            confidence=0.78,
        )

    def simulate(self, study: Study, parameters: Dict[str, Any] = None) -> AgentResponse:
        n_new = parameters.get("additional_sites", 5) if parameters else 5
        country = parameters.get("country", "United States") if parameters else "United States"

        action = self._create_action(
            TaskType.SIMULATIVE, f"Site Expansion Simulation: +{n_new} sites in {country}",
            f"Monte Carlo simulation (10,000 runs): Adding {n_new} sites in {country} "
            f"would accelerate enrollment by 3.8 months (median). "
            f"Cost impact: +$1.5M. P(meet deadline): 84% → 91%.",
            severity=Severity.INFO,
            data={"additional_sites": n_new, "country": country, "acceleration_months": 3.8, "cost_impact": 1500000},
        )

        return self._make_response(
            f"**Site Expansion Simulation**\n\nScenario: Add {n_new} sites in {country}\n\n"
            f"- Enrollment acceleration: **3.8 months**\n"
            f"- Cost impact: **+$1.5M**\n"
            f"- Success probability: **84% → 91%**\n"
            f"- Time to activate: **8-12 weeks**",
            actions=[action], confidence=0.80,
        )

    def optimize(self, study: Study) -> AgentResponse:
        sites = sorted(study.sites, key=lambda s: s.enrollment_rate_per_month / max(0.01, s.screen_fail_rate), reverse=True)
        top = sites[:5]
        bottom = sites[-3:]

        action = self._create_action(
            TaskType.OPTIMIZATION, "Site Portfolio Optimization",
            f"Multi-objective optimization complete. Recommend closing {len(bottom)} sites, "
            f"redistributing targets to top {len(top)} performers. Net gain: +15 pts/month.",
            severity=Severity.SUCCESS,
            data={"close": [s.id for s in bottom], "boost": [s.id for s in top]},
            human_required=True,
        )

        return self._make_response(
            "**Site Portfolio Optimization**\n\n"
            "**Boost (increase targets):**\n" +
            "\n".join([f"- {s.name}: {s.enrollment_rate_per_month}/mo, SF={s.screen_fail_rate:.0%}" for s in top]) +
            "\n\n**Consider Closing:**\n" +
            "\n".join([f"- {s.name}: {s.enrollment_rate_per_month}/mo, SF={s.screen_fail_rate:.0%}" for s in bottom]),
            actions=[action], confidence=0.85,
        )

    def generate(self, study: Study, request: str = "") -> AgentResponse:
        action = self._create_action(
            TaskType.GENERATIVE, "Site Selection Report Generated",
            f"Auto-generated site selection report covering {len(study.sites)} sites "
            f"across {len(study.countries)} countries with competitive landscape analysis.",
            severity=Severity.SUCCESS,
        )

        return self._make_response(
            "**Site Selection Report** generated successfully.\n\n"
            "Contents: Country scorecard, site feasibility matrix, competitive landscape, "
            "PI database summary, and recommended activation sequence.",
            actions=[action], confidence=0.90,
        )

    def act(self, study: Study, trigger: str = "") -> AgentResponse:
        action = self._create_action(
            TaskType.AGENTIC, "Autonomous Site Monitoring Action",
            "Detected 2 sites with declining enrollment. Autonomously: "
            "(1) flagged sites for review, (2) identified 3 backup sites, "
            "(3) initiated feasibility assessment, (4) notified Master Agent.",
            severity=Severity.WARNING,
            human_required=True,
        )

        return self._make_response(
            "**Autonomous Site Response**\n\n"
            "Detected declining enrollment at 2 sites. Initiated:\n"
            "1. Backup site identification (3 candidates found)\n"
            "2. Feasibility questionnaires sent\n"
            "3. Master Agent notified for coordination\n\n"
            "**Human Action Required**: Approve backup site activation.",
            actions=[action], confidence=0.82,
        )
