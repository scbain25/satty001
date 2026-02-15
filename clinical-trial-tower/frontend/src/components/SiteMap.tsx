/**
 * Site & Country Map
 * Interactive table/card view of sites with geographic grouping.
 * Shows site performance metrics, PI info, and status.
 */

import { useState } from 'react'
import type { Site } from '../types'

interface Props {
  sites: Site[]
}

export default function SiteMap({ sites }: Props) {
  const [sortKey, setSortKey] = useState<'enrollment' | 'quality' | 'rate'>('rate')
  const [groupBy, setGroupBy] = useState<'country' | 'status'>('country')

  const sorted = [...sites].sort((a, b) => {
    if (sortKey === 'enrollment') return b.current_enrollment - a.current_enrollment
    if (sortKey === 'quality') return b.quality_score - a.quality_score
    return b.enrollment_rate_per_month - a.enrollment_rate_per_month
  })

  // Group sites
  const groups: Record<string, Site[]> = {}
  for (const site of sorted) {
    const key = groupBy === 'country' ? site.country_name : site.status
    if (!groups[key]) groups[key] = []
    groups[key].push(site)
  }

  const statusColors: Record<string, string> = {
    Enrolling: '#10b981',
    Activated: '#3b82f6',
    Selected: '#f59e0b',
    Identified: '#6b7280',
    Closed: '#ef4444',
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Sites & Investigators</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">{sites.length} sites across {new Set(sites.map(s => s.country_name)).size} countries</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-0.5 bg-tower-bg rounded-md border border-tower-border">
            {(['country', 'status'] as const).map(g => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                  groupBy === g ? 'bg-tower-card text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {g === 'country' ? 'By Country' : 'By Status'}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-0.5 bg-tower-bg rounded-md border border-tower-border">
            {([['rate', 'Rate'], ['quality', 'Quality'], ['enrollment', 'Enrolled']] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSortKey(k as any)}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                  sortKey === k ? 'bg-tower-card text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Site Groups */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {Object.entries(groups).map(([group, groupSites]) => (
          <div key={group}>
            <div className="flex items-center gap-2 mb-2 sticky top-0 bg-tower-card/80 backdrop-blur-sm py-1 -mx-1 px-1 rounded">
              {groupBy === 'status' && (
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[group] ?? '#6b7280' }} />
              )}
              <span className="text-xs font-semibold text-gray-300">{group}</span>
              <span className="text-[10px] text-gray-600">{groupSites.length} sites</span>
              <div className="flex-1 h-px bg-tower-border" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
              {groupSites.map(site => (
                <SiteCard key={site.id} site={site} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SiteCard({ site }: { site: Site }) {
  const statusColor: Record<string, string> = {
    Enrolling: '#10b981',
    Activated: '#3b82f6',
    Selected: '#f59e0b',
    Identified: '#6b7280',
    Closed: '#ef4444',
  }

  const color = statusColor[site.status] ?? '#6b7280'
  const enrollPct = site.target_enrollment > 0 ? (site.current_enrollment / site.target_enrollment) * 100 : 0

  return (
    <div className="rounded-lg border border-tower-border bg-tower-bg/50 p-3 hover:border-gray-600 transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-medium capitalize" style={{ color }}>{site.status}</span>
          </div>
          <h3 className="text-xs font-medium text-gray-200 mt-1 truncate" title={site.name}>{site.name}</h3>
          <p className="text-[10px] text-gray-500">{site.city}, {site.country_name}</p>
        </div>
      </div>

      {/* PI Info */}
      <div className="flex items-center gap-1.5 mb-2 text-[10px]">
        <span className="text-gray-600">PI:</span>
        <span className="text-gray-400 font-medium">{site.pi.name}</span>
        <span className="text-gray-700">|</span>
        <span className="text-gray-500">h={site.pi.h_index}</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div>
          <div className="text-[9px] text-gray-600 uppercase">Rate</div>
          <div className="text-xs font-semibold text-white">{site.enrollment_rate_per_month}/mo</div>
        </div>
        <div>
          <div className="text-[9px] text-gray-600 uppercase">Quality</div>
          <div className="text-xs font-semibold text-white">{site.quality_score.toFixed(0)}</div>
        </div>
        <div>
          <div className="text-[9px] text-gray-600 uppercase">SF Rate</div>
          <div className="text-xs font-semibold text-white">{(site.screen_fail_rate * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Enrollment bar */}
      <div>
        <div className="flex justify-between text-[9px] mb-1">
          <span className="text-gray-500">Enrolled</span>
          <span className="text-gray-400">{site.current_enrollment}/{site.target_enrollment}</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, enrollPct)}%`,
              backgroundColor: enrollPct >= 80 ? '#10b981' : enrollPct >= 50 ? '#3b82f6' : '#f59e0b'
            }}
          />
        </div>
      </div>
    </div>
  )
}
