/**
 * Interactive Trial Timeline
 * ==========================
 * UX Innovation #2: A cinematic horizontal timeline replacing boring Gantt charts.
 * Shows milestones as animated dots on a gradient track, with a pulsing "NOW" marker.
 * AI-predicted dates shown as translucent extensions. Hover for details.
 */

import { useState } from 'react'
import type { Milestone } from '../types'
import { AGENT_COLORS } from '../types'

interface Props {
  milestones: Milestone[]
}

export default function TrialTimeline({ milestones }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (!milestones.length) return null

  // Calculate date range
  const allDates = milestones.flatMap(m => [
    new Date(m.planned_date).getTime(),
    m.actual_date ? new Date(m.actual_date).getTime() : 0,
    m.predicted_date ? new Date(m.predicted_date).getTime() : 0,
  ]).filter(d => d > 0)

  const minDate = Math.min(...allDates)
  const maxDate = Math.max(...allDates)
  const range = maxDate - minDate || 1
  const now = Date.now()
  const nowPct = Math.min(100, Math.max(0, ((now - minDate) / range) * 100))

  const statusColors: Record<string, string> = {
    completed: '#10b981',
    on_track: '#3b82f6',
    at_risk: '#f59e0b',
    delayed: '#ef4444',
  }

  const categoryIcons: Record<string, string> = {
    regulatory: '📋',
    enrollment: '👥',
    execution: '📊',
    data: '💾',
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Trial Timeline</h2>
        <div className="flex items-center gap-3">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-gray-500 capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Track */}
      <div className="relative h-24 mx-4">
        {/* Background track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />

        {/* Progress track (up to now) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400"
          style={{ width: `${nowPct}%` }}
        />

        {/* NOW marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
          style={{ left: `${nowPct}%` }}
        >
          <div className="timeline-now-marker w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-300" />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[9px] font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
              TODAY
            </span>
          </div>
        </div>

        {/* Milestone dots */}
        {milestones.map((m) => {
          const planned = new Date(m.planned_date).getTime()
          const pct = ((planned - minDate) / range) * 100
          const isHovered = hoveredId === m.id
          const color = statusColors[m.status] ?? '#6b7280'
          const agentColor = AGENT_COLORS[m.owner_agent] ?? '#6b7280'

          return (
            <div
              key={m.id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 group"
              style={{ left: `${pct}%` }}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Dot */}
              <div
                className={`w-3 h-3 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                  m.status === 'completed' ? 'scale-100' : 'scale-90 hover:scale-110'
                }`}
                style={{
                  backgroundColor: m.status === 'completed' ? color : 'transparent',
                  borderColor: color,
                  boxShadow: isHovered ? `0 0 12px ${color}` : 'none',
                }}
              />

              {/* Predicted date offset line (for non-completed) */}
              {m.predicted_date && m.status !== 'completed' && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-0.5 rounded-full opacity-40"
                  style={{
                    left: '50%',
                    width: `${Math.abs(((new Date(m.predicted_date).getTime() - planned) / range) * 100)}%`,
                    backgroundColor: color,
                  }}
                />
              )}

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm">{categoryIcons[m.category] ?? '📌'}</span>
                      <span className="text-xs font-semibold text-white">{m.name}</span>
                    </div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Planned</span>
                        <span className="text-gray-300">{new Date(m.planned_date).toLocaleDateString()}</span>
                      </div>
                      {m.predicted_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Predicted</span>
                          <span style={{ color }}>{new Date(m.predicted_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {m.actual_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Actual</span>
                          <span className="text-emerald-400">{new Date(m.actual_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Confidence</span>
                        <span className="text-gray-300">{(m.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <span className="capitalize font-medium" style={{ color }}>{m.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45" />
                  </div>
                </div>
              )}

              {/* Label (for completed ones + key milestones) */}
              {(m.status === 'completed' || m.name.includes('FPI') || m.name.includes('LPI')) && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[8px] text-gray-600">{m.name.length > 15 ? m.name.slice(0, 15) + '...' : m.name}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Date range labels */}
      <div className="flex justify-between px-4 mt-2">
        <span className="text-[10px] text-gray-600">{new Date(minDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        <span className="text-[10px] text-gray-600">{new Date(maxDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  )
}
