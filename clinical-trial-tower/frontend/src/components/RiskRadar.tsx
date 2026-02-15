/**
 * Risk Register Panel
 * Compact risk view with severity indicators and mitigation status.
 */

import type { Risk } from '../types'
import { AGENT_COLORS, AGENT_ICONS, AGENT_SHORT_NAMES } from '../types'

interface Props {
  risks: Risk[]
}

export default function RiskRadar({ risks }: Props) {
  const impactColors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#3b82f6',
    low: '#10b981',
  }

  const statusIcons: Record<string, string> = {
    open: '🔴',
    escalated: '🟠',
    mitigated: '🟢',
    closed: '⚪',
  }

  const sorted = [...risks].sort((a, b) => {
    const impactOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    return (impactOrder[a.impact] ?? 4) - (impactOrder[b.impact] ?? 4)
  })

  const openCount = risks.filter(r => r.status === 'open').length
  const escalatedCount = risks.filter(r => r.status === 'escalated').length

  return (
    <div className="glass-card p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Risk Register</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {openCount} open, {escalatedCount} escalated
          </p>
        </div>
        {escalatedCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
            {escalatedCount} escalated
          </span>
        )}
      </div>

      {/* Risk Impact Summary */}
      <div className="flex gap-2 mb-3">
        {Object.entries(impactColors).map(([impact, color]) => {
          const count = risks.filter(r => r.impact === impact).length
          return (
            <div key={impact} className="flex-1 rounded-lg bg-tower-bg/80 p-2 border border-tower-border">
              <div className="text-[9px] text-gray-600 uppercase mb-1">{impact}</div>
              <div className="text-sm font-bold" style={{ color }}>{count}</div>
            </div>
          )
        })}
      </div>

      {/* Risk List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {sorted.map(risk => (
          <div
            key={risk.id}
            className="rounded-lg border border-tower-border bg-tower-bg/50 p-2.5 hover:border-gray-600 transition-all"
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: impactColors[risk.impact] ?? '#6b7280' }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-tower-card text-gray-400 font-medium">
                    {risk.category}
                  </span>
                  <span className="text-[9px]" title={risk.status}>
                    {statusIcons[risk.status]}
                  </span>
                  <span className="text-[9px] ml-auto" style={{ color: AGENT_COLORS[risk.owner_agent] }}>
                    {AGENT_ICONS[risk.owner_agent]} {AGENT_SHORT_NAMES[risk.owner_agent]}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 leading-snug">{risk.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] text-gray-600">P={(risk.probability * 100).toFixed(0)}%</span>
                  <span className="text-[9px] capitalize font-medium" style={{ color: impactColors[risk.impact] }}>
                    {risk.impact} impact
                  </span>
                </div>
                {risk.status === 'open' && (
                  <div className="mt-1.5 text-[10px] text-gray-500 italic">
                    Mitigation: {risk.mitigation}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
