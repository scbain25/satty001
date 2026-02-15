import { useState, useEffect } from 'react'
import { useFetch } from './hooks/useApi'
import type { KPIs, AgentAction, EnrollmentSnapshot, Milestone, Site, Simulation, Risk } from './types'
import Header from './components/Header'
import KPIStrip from './components/KPIStrip'
import AgentStream from './components/AgentStream'
import EnrollmentChart from './components/EnrollmentChart'
import TrialTimeline from './components/TrialTimeline'
import CommandPalette from './components/CommandPalette'
import SiteMap from './components/SiteMap'
import SimulationPanel from './components/SimulationPanel'
import RiskRadar from './components/RiskRadar'

export default function App() {
  const [commandOpen, setCommandOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'simulations'>('overview')

  const { data: kpis } = useFetch<KPIs>('/api/study/kpis', [])
  const { data: actions } = useFetch<AgentAction[]>('/api/agent-actions?limit=50', [])
  const { data: enrollment } = useFetch<{ history: EnrollmentSnapshot[]; forecast: EnrollmentSnapshot[] }>('/api/enrollment', [])
  const { data: milestones } = useFetch<Milestone[]>('/api/milestones', [])
  const { data: sites } = useFetch<Site[]>('/api/sites', [])
  const { data: simulations } = useFetch<Simulation[]>('/api/simulations', [])
  const { data: risks } = useFetch<Risk[]>('/api/risks', [])
  const { data: pending } = useFetch<AgentAction[]>('/api/agent-actions/pending', [])

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(v => !v)
      }
      if (e.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-tower-bg">
      <Header
        kpis={kpis}
        onCommandOpen={() => setCommandOpen(true)}
        pendingCount={pending?.length ?? 0}
      />

      {/* KPI Strip */}
      {kpis && <KPIStrip kpis={kpis} />}

      {/* Main Layout: Agent Stream (left) + Content (right) */}
      <div className="flex gap-4 px-4 pb-6 max-w-[1920px] mx-auto">
        {/* Left: Agent Mission Control Stream */}
        <div className="w-[380px] flex-shrink-0">
          <AgentStream actions={actions ?? []} pending={pending ?? []} />
        </div>

        {/* Right: Main Content Area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab Bar */}
          <div className="flex gap-1 p-1 bg-tower-card/50 rounded-lg border border-tower-border w-fit">
            {(['overview', 'sites', 'simulations'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-tower-accent text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-tower-card'
                }`}
              >
                {tab === 'overview' ? '📊 Overview' : tab === 'sites' ? '🌍 Sites & Countries' : '🔬 Simulations'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fade-in">
              {/* Trial Timeline */}
              {milestones && <TrialTimeline milestones={milestones} />}

              {/* Enrollment + Risk Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                  {enrollment && (
                    <EnrollmentChart
                      history={enrollment.history}
                      forecast={enrollment.forecast}
                    />
                  )}
                </div>
                <div>
                  {risks && <RiskRadar risks={risks} />}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sites' && sites && (
            <div className="animate-fade-in">
              <SiteMap sites={sites} />
            </div>
          )}

          {activeTab === 'simulations' && simulations && (
            <div className="animate-fade-in">
              <SimulationPanel simulations={simulations} />
            </div>
          )}
        </div>
      </div>

      {/* Command Palette Overlay */}
      {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} />}
    </div>
  )
}
