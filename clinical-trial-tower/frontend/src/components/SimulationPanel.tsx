/**
 * Simulation Scenario Panel
 * Shows Monte Carlo simulation results with comparative visualization.
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import type { Simulation } from '../types'

interface Props {
  simulations: Simulation[]
}

export default function SimulationPanel({ simulations }: Props) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

  const chartData = simulations.map((s, i) => ({
    name: s.name.length > 18 ? s.name.slice(0, 18) + '...' : s.name,
    fullName: s.name,
    success: Math.round(s.outcome_probability_success * 100),
    months: s.outcome_enrollment_months,
    cost: s.outcome_total_cost / 1e6,
    color: colors[i % colors.length],
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-xs font-medium text-white mb-2">{d.fullName}</p>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Success Probability</span>
            <span className="text-white font-medium">{d.success}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Timeline</span>
            <span className="text-white font-medium">{d.months.toFixed(1)} months</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Total Cost</span>
            <span className="text-white font-medium">${d.cost.toFixed(1)}M</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Success Probability Chart */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Scenario Comparison</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">Monte Carlo simulation: 10,000 iterations per scenario</p>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            AI-Generated
          </span>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#1e293b' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              label={{ value: 'Success %', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#6b7280' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="success" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {simulations.map((sim, i) => (
          <div key={sim.id} className="glass-card-hover p-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-8 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <div>
                <h3 className="text-xs font-semibold text-white">{sim.name}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">{sim.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[9px] text-gray-600 uppercase">Success</div>
                <div className="text-sm font-bold" style={{ color: colors[i % colors.length] }}>
                  {(sim.outcome_probability_success * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-[9px] text-gray-600 uppercase">Timeline</div>
                <div className="text-sm font-bold text-white">
                  {sim.outcome_enrollment_months.toFixed(0)}mo
                </div>
              </div>
              <div>
                <div className="text-[9px] text-gray-600 uppercase">Cost</div>
                <div className="text-sm font-bold text-white">
                  ${(sim.outcome_total_cost / 1e6).toFixed(1)}M
                </div>
              </div>
            </div>

            {/* Parameters */}
            <div className="mt-3 pt-3 border-t border-tower-border">
              <div className="text-[9px] text-gray-600 uppercase mb-1">Parameters</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(sim.parameters).map(([k, v]) => (
                  <span key={k} className="text-[9px] px-1.5 py-0.5 rounded bg-tower-bg text-gray-500 border border-tower-border">
                    {k.replace(/_/g, ' ')}: {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
