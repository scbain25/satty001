import type { KPIs } from '../types'

interface Props {
  kpis: KPIs | null
  onCommandOpen: () => void
  pendingCount: number
}

export default function Header({ kpis, onCommandOpen, pendingCount }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-tower-bg/80 backdrop-blur-xl border-b border-tower-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-[1920px] mx-auto">
        {/* Left: Logo + Study Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">
              🧬
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                Clinical Trial Control Tower
              </h1>
              {kpis && (
                <p className="text-xs text-gray-400">
                  {kpis.protocol} &middot; {kpis.study_phase} {kpis.therapeutic_area} &middot; {kpis.molecule}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          {kpis && (
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-tower-border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-green-400">{kpis.status}</span>
              <span className="text-xs text-gray-500">|</span>
              <span className="text-xs text-gray-400">6 agents active</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Command Palette Trigger */}
          <button
            onClick={onCommandOpen}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-tower-card border border-tower-border text-gray-400 hover:text-white hover:border-gray-600 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">Ask agents...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-tower-bg rounded text-[10px] font-mono text-gray-500 border border-gray-700">
              Ctrl K
            </kbd>
          </button>

          {/* Pending Actions */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-xs font-medium">{pendingCount} actions need review</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
