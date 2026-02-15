import type { KPIs } from '../types'

interface Props {
  kpis: KPIs
}

export default function KPIStrip({ kpis }: Props) {
  const cards = [
    {
      label: 'Enrollment',
      value: `${kpis.current_enrollment}/${kpis.target_enrollment}`,
      sub: `${kpis.enrollment_pct}%`,
      progress: kpis.enrollment_pct,
      color: 'from-blue-500 to-cyan-500',
      ringColor: 'text-blue-400',
    },
    {
      label: 'Active Sites',
      value: `${kpis.active_sites}`,
      sub: `of ${kpis.total_sites} total`,
      progress: (kpis.active_sites / Math.max(1, kpis.total_sites)) * 100,
      color: 'from-emerald-500 to-teal-500',
      ringColor: 'text-emerald-400',
    },
    {
      label: 'Countries',
      value: `${kpis.approved_countries}`,
      sub: `of ${kpis.total_countries} approved`,
      progress: (kpis.approved_countries / Math.max(1, kpis.total_countries)) * 100,
      color: 'from-cyan-500 to-blue-500',
      ringColor: 'text-cyan-400',
    },
    {
      label: 'Enrollment Rate',
      value: `${kpis.monthly_enrollment_rate}`,
      sub: 'patients/month',
      progress: Math.min(100, kpis.monthly_enrollment_rate * 2),
      color: 'from-violet-500 to-purple-500',
      ringColor: 'text-violet-400',
    },
    {
      label: 'Budget Used',
      value: `${kpis.budget_spent_pct}%`,
      sub: `$${(kpis.budget_spent / 1e6).toFixed(1)}M of $${(kpis.budget_total / 1e6).toFixed(1)}M`,
      progress: kpis.budget_spent_pct,
      color: kpis.budget_spent_pct > 80 ? 'from-amber-500 to-orange-500' : 'from-green-500 to-emerald-500',
      ringColor: kpis.budget_spent_pct > 80 ? 'text-amber-400' : 'text-green-400',
    },
    {
      label: 'Milestones',
      value: `${kpis.milestones_completed}/${kpis.total_milestones}`,
      sub: 'completed',
      progress: (kpis.milestones_completed / Math.max(1, kpis.total_milestones)) * 100,
      color: 'from-pink-500 to-rose-500',
      ringColor: 'text-pink-400',
    },
    {
      label: 'Open Risks',
      value: `${kpis.open_risks}`,
      sub: kpis.open_risks > 5 ? 'action needed' : 'monitored',
      progress: Math.min(100, kpis.open_risks * 15),
      color: kpis.open_risks > 5 ? 'from-red-500 to-orange-500' : 'from-yellow-500 to-amber-500',
      ringColor: kpis.open_risks > 5 ? 'text-red-400' : 'text-yellow-400',
    },
  ]

  return (
    <div className="px-4 py-3 max-w-[1920px] mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="glass-card p-3 group hover:border-gray-600 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                {card.label}
              </span>
              {/* Mini circular progress */}
              <svg className={`w-6 h-6 ${card.ringColor}`} viewBox="0 0 36 36">
                <path
                  className="text-gray-800"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${card.progress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
            <div className="text-lg font-bold text-white tracking-tight">{card.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
