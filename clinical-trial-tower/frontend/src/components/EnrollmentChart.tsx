/**
 * Enrollment Analytics Chart
 * Shows historical enrollment vs target with AI-predicted forecast overlay.
 * Uses Recharts for beautiful, interactive data visualization.
 */

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'
import type { EnrollmentSnapshot } from '../types'

interface Props {
  history: EnrollmentSnapshot[]
  forecast: EnrollmentSnapshot[]
}

export default function EnrollmentChart({ history, forecast }: Props) {
  // Merge history and forecast
  const data = [
    ...history.map(h => ({
      date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      enrolled: h.enrolled,
      screened: h.screened,
      target: h.target,
      randomized: h.randomized,
      forecastEnrolled: null as number | null,
      forecastTarget: null as number | null,
    })),
    ...forecast.map(f => ({
      date: new Date(f.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      enrolled: null as number | null,
      screened: null as number | null,
      target: null as number | null,
      randomized: null as number | null,
      forecastEnrolled: f.enrolled,
      forecastTarget: f.target,
    })),
  ]

  // Bridge: last history point also appears as first forecast point
  if (history.length > 0 && forecast.length > 0) {
    const last = history[history.length - 1]
    data[history.length - 1].forecastEnrolled = last.enrolled
    data[history.length - 1].forecastTarget = last.target
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-xs font-medium text-white mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-400">{p.name}:</span>
            <span className="text-white font-medium">{p.value?.toLocaleString() ?? '-'}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Enrollment Analytics</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">Historical actuals + AI-predicted forecast (dashed)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-6 h-0.5 bg-blue-500 rounded" />
            <span className="text-[10px] text-gray-500">Enrolled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-0.5 bg-cyan-500 rounded" />
            <span className="text-[10px] text-gray-500">Screened</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-0.5 bg-blue-500/30 rounded border border-dashed border-blue-500" />
            <span className="text-[10px] text-gray-500">Forecast</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={{ stroke: '#1e293b' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Screened area */}
          <Area
            type="monotone"
            dataKey="screened"
            stroke="#06b6d4"
            strokeWidth={1.5}
            fill="url(#screenGrad)"
            name="Screened"
            connectNulls={false}
          />

          {/* Enrolled area */}
          <Area
            type="monotone"
            dataKey="enrolled"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#enrollGrad)"
            name="Enrolled"
            connectNulls={false}
          />

          {/* Target line */}
          <Area
            type="monotone"
            dataKey="target"
            stroke="#6b7280"
            strokeWidth={1}
            strokeDasharray="4 4"
            fill="none"
            name="Target"
            connectNulls={false}
          />

          {/* Forecast enrolled */}
          <Area
            type="monotone"
            dataKey="forecastEnrolled"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="url(#forecastGrad)"
            name="Forecast"
            connectNulls={false}
          />

          {/* Forecast target */}
          <Area
            type="monotone"
            dataKey="forecastTarget"
            stroke="#6b7280"
            strokeWidth={1}
            strokeDasharray="2 4"
            fill="none"
            name="Forecast Target"
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
