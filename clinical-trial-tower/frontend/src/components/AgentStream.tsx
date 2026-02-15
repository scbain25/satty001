/**
 * Agent Mission Control Stream
 * ============================
 * UX Innovation #1: A real-time, Slack-like feed of agent activities.
 * Each agent has its own identity (icon, color, name). The human
 * coordinator can see what agents are thinking, deciding, and doing.
 * Actions requiring human input are highlighted with action buttons.
 */

import { useState } from 'react'
import type { AgentAction } from '../types'
import { AGENT_COLORS, AGENT_ICONS, AGENT_SHORT_NAMES, TASK_TYPE_LABELS, SEVERITY_COLORS } from '../types'

interface Props {
  actions: AgentAction[]
  pending: AgentAction[]
}

export default function AgentStream({ actions, pending }: Props) {
  const [filter, setFilter] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filter
    ? actions.filter(a => a.agent_type === filter)
    : actions

  return (
    <div className="glass-card flex flex-col h-[calc(100vh-180px)] sticky top-[72px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tower-border">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <h2 className="text-sm font-semibold text-white">Agent Mission Control</h2>
        </div>
        {pending.length > 0 && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {pending.length} pending
          </span>
        )}
      </div>

      {/* Agent Filter Chips */}
      <div className="flex gap-1 px-3 py-2 border-b border-tower-border overflow-x-auto">
        <button
          onClick={() => setFilter(null)}
          className={`flex-shrink-0 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
            !filter ? 'bg-tower-accent/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          All
        </button>
        {Object.entries(AGENT_SHORT_NAMES).map(([key, name]) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? null : key)}
            className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
              filter === key
                ? 'border'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            style={filter === key ? { backgroundColor: AGENT_COLORS[key] + '20', color: AGENT_COLORS[key], borderColor: AGENT_COLORS[key] + '50' } : {}}
          >
            <span>{AGENT_ICONS[key]}</span>
            {name}
          </button>
        ))}
      </div>

      {/* Stream */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {filtered.map((action, i) => (
          <StreamItem
            key={action.id}
            action={action}
            expanded={expandedId === action.id}
            onToggle={() => setExpandedId(expandedId === action.id ? null : action.id)}
            isNew={i < 3}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-sm">
            No agent actions to display
          </div>
        )}
      </div>
    </div>
  )
}

function StreamItem({ action, expanded, onToggle, isNew }: {
  action: AgentAction
  expanded: boolean
  onToggle: () => void
  isNew: boolean
}) {
  const agentColor = AGENT_COLORS[action.agent_type] ?? '#6b7280'
  const severityColor = SEVERITY_COLORS[action.severity] ?? '#6b7280'
  const icon = AGENT_ICONS[action.agent_type] ?? '🤖'
  const shortName = AGENT_SHORT_NAMES[action.agent_type] ?? 'Agent'
  const taskLabel = TASK_TYPE_LABELS[action.task_type] ?? action.task_type
  const time = new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className={`rounded-lg border transition-all duration-200 cursor-pointer hover:border-gray-600 ${
        isNew ? 'stream-item-enter' : ''
      } ${action.human_action_required ? 'border-amber-500/40 bg-amber-500/5' : 'border-tower-border bg-tower-card/60'}`}
      onClick={onToggle}
    >
      <div className="p-3">
        {/* Top row: Agent info + time */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm" title={action.agent_name}>{icon}</span>
            <span className="text-xs font-semibold" style={{ color: agentColor }}>{shortName}</span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: agentColor + '20', color: agentColor }}
            >
              {taskLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {action.human_action_required && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                Action Needed
              </span>
            )}
            <span className="text-[10px] text-gray-600">{time}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xs font-medium text-gray-200 mb-1 leading-tight">{action.title}</h3>

        {/* Severity + Confidence bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: severityColor }} />
            <span className="text-[10px] text-gray-500 capitalize">{action.severity}</span>
          </div>
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${action.confidence * 100}%`, backgroundColor: agentColor }}
            />
          </div>
          <span className="text-[10px] text-gray-500">{(action.confidence * 100).toFixed(0)}%</span>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-tower-border animate-slide-down">
            <p className="text-xs text-gray-400 leading-relaxed mb-3">{action.description}</p>

            {/* Action buttons for human-required items */}
            {action.human_action_required && (
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 hover:bg-emerald-500/30 transition-all">
                  Approve
                </button>
                <button className="flex-1 px-3 py-1.5 rounded-md bg-gray-700/50 text-gray-300 text-xs font-medium border border-gray-600 hover:bg-gray-600/50 transition-all">
                  Review
                </button>
                <button className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20 hover:bg-red-500/20 transition-all">
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
