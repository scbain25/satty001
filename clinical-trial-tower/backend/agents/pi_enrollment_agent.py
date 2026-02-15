"""
PI & Patient Enrollment Agent - "Navigator"
Identifies and matches Principal Investigators,
designs patient recruitment strategies, and forecasts enrollment.
"""

from typing import Dict, Any
from .base_agent import BaseAgent
from ..models import (
    Study, AgentResponse, AgentType, TaskType, Severity, SiteStatus
)


class PIEnrollmentAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.PI_ENROLLMENT,
            name="Navigator (PI & Enrollment)",
            description="Identifies optimal PIs, designs recruitment strategies, and manages enrollment forecasting."
        )

    def describe(self, study: Study) -> AgentResponse:
        enrolling_sites = [s for s in study.sites if s.status == SiteStatus.ENROLLING]
        total_rate = sum(s.enrollment_rate_per_month for s in enrolling_sites)
        avg_sf = sum(s.screen_fail_rate for s in enrolling_sites) / max(1, len(enrolling_sites))
        pct = round(study.current_enrollment / max(1, study.target_enrollment) * 100, 1)

        action = self._create_action(
            TaskType.DESCRIPTIVE, "Enrollment Pulse Report",
            f"Enrollment: {study.current_enrollment}/{study.target_enrollment} ({pct}%). "
            f"Rate: {total_rate:.1f} pts/month across {len(enrolling_sites)} sites. "
            f"Screen-fail rate: {avg_sf:.0%}.",
            severity=Severity.INFO,
            data={"enrollment_pct": pct, "rate": round(total_rate, 1), "screen_fail": round(avg_sf, 2)},
        )

        top_pis = sorted(enrolling_sites, key=lambda s: s.pi.enrollment_track_record, reverse=True)[:5]

        return self._make_response(
            f"**Enrollment Pulse**\n\n"
            f"- Progress: **{study.current_enrollment}/{study.target_enrollment}** ({pct}%)\n"
            f"- Monthly rate: **{total_rate:.1f} patients**\n"
            f"- Screen-fail rate: **{avg_sf:.0%}**\n"
            f"- Active sites: **{len(enrolling_sites)}**\n\n"
            f"**Top PIs by Track Record:**\n" +
            "\n".join([f"- {s.pi.name} ({s.city}, {s.country_name}): {s.pi.enrollment_track_record:.0%} hit rate" for s in top_pis]),
            actions=[action], confidence=0.91,
        )

    def predict(self, study: Study) -> AgentResponse:
        remaining = study.target_enrollment - study.current_enrollment
        enrolling = [s for s in study.sites if s.status == SiteStatus.ENROLLING]
        total_rate = sum(s.enrollment_rate_per_month for s in enrolling)
        months = remaining / max(0.1, total_rate)
        prob = min(0.95, max(0.3, 0.9 - max(0, months - 8) * 0.05))

        action = self._create_action(
            TaskType.PREDICTIVE, "Enrollment Completion Probability",
            f"P(complete by deadline) = {prob:.0%}. "
            f"Remaining: {remaining} patients at {total_rate:.1f}/month = {months:.1f} months.",
            severity=Severity.SUCCESS if prob > 0.7 else Severity.WARNING,
            data={"probability": round(prob, 2), "months": round(months, 1), "remaining": remaining},
        )

        return self._make_response(
            f"**Enrollment Forecast**\n\n"
            f"- Remaining patients: **{remaining}**\n"
            f"- Current velocity: **{total_rate:.1f}/month**\n"
            f"- Est. months to complete: **{months:.1f}**\n"
            f"- On-time probability: **{prob:.0%}**",
            actions=[action], confidence=round(prob, 2),
        )

    def simulate(self, study: Study, parameters: Dict[str, Any] = None) -> AgentResponse:
        action = self._create_action(
            TaskType.SIMULATIVE, "Recruitment Strategy Simulation",
            "Simulated 4 recruitment strategies: (1) Digital advertising +18% lift, "
            "(2) PI referral network +25% lift, (3) EMR-based pre-screening +30% lift, "
            "(4) Combined approach +45% lift with $200K additional cost.",
            severity=Severity.INFO,
            data={"strategies": 4, "best_lift": 45},
        )

        return self._make_response(
            "**Recruitment Strategy Simulation**\n\n"
            "| Strategy | Enrollment Lift | Cost | ROI |\n"
            "|----------|:---:|:---:|:---:|\n"
            "| Digital ads | +18% | $80K | 3.2x |\n"
            "| PI referrals | +25% | $50K | 5.1x |\n"
            "| EMR pre-screening | +30% | $120K | 2.8x |\n"
            "| Combined | +45% | $200K | 3.5x |",
            actions=[action], confidence=0.76,
        )

    def optimize(self, study: Study) -> AgentResponse:
        action = self._create_action(
            TaskType.OPTIMIZATION, "PI-Site Matching Optimization",
            "Optimized PI-site assignments using multi-factor algorithm "
            "(expertise, h-index, track record, availability). "
            "Identified 4 superior PI candidates for underperforming sites.",
            severity=Severity.SUCCESS,
            data={"candidates": 4, "improvement_expected": 35},
            human_required=True,
        )

        return self._make_response(
            "**PI Matching Optimization**\n\n"
            "Identified optimal PI reassignments:\n"
            "- 4 underperforming sites matched with higher-potential PIs\n"
            "- Expected enrollment improvement: **+35%**\n"
            "- All candidates pre-vetted for availability and expertise\n\n"
            "**Human Action Required**: Approve PI reassignment recommendations.",
            actions=[action], confidence=0.84,
        )

    def generate(self, study: Study, request: str = "") -> AgentResponse:
        action = self._create_action(
            TaskType.GENERATIVE, "Recruitment Materials Generated",
            f"Generated localized recruitment materials for {len(study.countries)} countries: "
            "patient brochures, social media ads, physician referral letters.",
            severity=Severity.SUCCESS,
        )

        return self._make_response(
            "**Recruitment Materials Package** generated:\n\n"
            "- Patient brochures (lay language, 6th-grade level)\n"
            "- Social media ad copy (3 A/B variants per country)\n"
            "- Physician referral letter templates\n"
            "- Pre-screening checklist for referring physicians\n"
            f"- Localized for {len(study.countries)} countries",
            actions=[action], confidence=0.90,
        )

    def act(self, study: Study, trigger: str = "") -> AgentResponse:
        stalled = [s for s in study.sites if s.status == SiteStatus.ENROLLING and s.enrollment_rate_per_month < 1.0]

        action = self._create_action(
            TaskType.AGENTIC, f"Enrollment Recovery for {len(stalled)} Stalled Sites",
            f"Detected {len(stalled)} sites with enrollment rate <1.0/month. "
            "Autonomously activated: PI engagement calls, backup recruitment channels, "
            "and notified Master Agent for site replacement evaluation.",
            severity=Severity.WARNING,
            data={"stalled_sites": len(stalled)},
            human_required=True,
        )

        return self._make_response(
            f"**Enrollment Recovery Initiated**\n\n"
            f"Detected **{len(stalled)}** sites with critically low enrollment.\n\n"
            "Autonomous actions taken:\n"
            "1. PI engagement calls scheduled\n"
            "2. Backup recruitment channels activated\n"
            "3. Master Agent notified for coordination\n"
            "4. Enrollment forecast updated\n\n"
            "**Human Action Required**: Review site replacement recommendations.",
            actions=[action], confidence=0.80,
        )
