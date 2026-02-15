/**
 * Command Palette / AI Chat
 * =========================
 * UX Innovation #3: A Spotlight/Cmd+K interface for natural language
 * interaction with the agent system. The study coordinator can ask
 * questions like "What's our enrollment risk in Germany?" or
 * "Simulate adding 3 sites in Japan" and get instant agent responses.
 */

import { useState, useRef, useEffect } from 'react'
import { useAgentQuery } from '../hooks/useApi'
import { AGENT_COLORS, AGENT_ICONS, AGENT_SHORT_NAMES } from '../types'
import type { AgentResponse } from '../types'

interface Props {
  onClose: () => void
}

const SUGGESTIONS = [
  { text: 'Show me the enrollment status', icon: '📊' },
  { text: 'What is our biggest risk right now?', icon: '⚠️' },
  { text: 'Predict when we will hit enrollment target', icon: '🔮' },
  { text: 'Simulate adding 5 sites in Germany', icon: '🧪' },
  { text: 'Optimize our site portfolio', icon: '⚡' },
  { text: 'Generate a regulatory summary for FDA', icon: '📋' },
  { text: 'Which sites are underperforming?', icon: '📉' },
  { text: 'What is the patient recruitment strategy?', icon: '👥' },
]

export default function CommandPalette({ onClose }: Props) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Array<{ role: 'user' | 'agent'; text: string; agent?: AgentResponse }>>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { query, loading } = useAgentQuery()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [history])

  const handleSubmit = async (text?: string) => {
    const q = text ?? input.trim()
    if (!q) return
    setInput('')
    setHistory(prev => [...prev, { role: 'user', text: q }])

    const response = await query(q)
    if (response) {
      setHistory(prev => [...prev, { role: 'agent', text: response.response, agent: response }])
    }
  }

  return (
    <div className="fixed inset-0 z-50 command-backdrop flex items-start justify-center pt-[12vh]" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-tower-surface border border-tower-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-slide-down"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-tower-border">
          <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') onClose() }}
            placeholder="Ask the agents anything about this trial..."
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          <kbd className="text-[10px] text-gray-600 bg-tower-bg px-1.5 py-0.5 rounded border border-gray-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Conversation / Suggestions */}
        <div ref={scrollRef} className="max-h-[50vh] overflow-y-auto">
          {history.length === 0 ? (
            /* Suggestions */
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-600 font-medium mb-3 px-1">
                Suggested queries
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(s.text)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs text-gray-400 hover:text-white hover:bg-tower-card border border-transparent hover:border-tower-border transition-all group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">{s.icon}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation */
            <div className="p-4 space-y-4">
              {history.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'agent' && msg.agent && (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ backgroundColor: (AGENT_COLORS[msg.agent.agent_type] ?? '#6b7280') + '20' }}
                    >
                      {AGENT_ICONS[msg.agent.agent_type] ?? '🤖'}
                    </div>
                  )}
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                    {msg.role === 'agent' && msg.agent && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold" style={{ color: AGENT_COLORS[msg.agent.agent_type] }}>
                          {AGENT_SHORT_NAMES[msg.agent.agent_type] ?? msg.agent.agent_name}
                        </span>
                        <span className="text-[9px] text-gray-600">
                          confidence: {(msg.agent.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                        : 'bg-tower-card border border-tower-border text-gray-300'
                    }`}>
                      {/* Render markdown-like bold */}
                      {msg.text.split('\n').map((line, j) => (
                        <p key={j} className={j > 0 ? 'mt-1.5' : ''}>
                          {line.replace(/\*\*(.*?)\*\*/g, '«$1»').split('«').map((part, k) => {
                            if (part.includes('»')) {
                              const [bold, rest] = part.split('»')
                              return <span key={k}><strong className="text-white font-semibold">{bold}</strong>{rest}</span>
                            }
                            return <span key={k}>{part}</span>
                          })}
                        </p>
                      ))}
                    </div>

                    {/* Recommendations */}
                    {msg.agent?.recommendations && msg.agent.recommendations.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.agent.recommendations.map((rec, j) => (
                          <div key={j} className="flex items-start gap-1.5 text-[10px] text-gray-500">
                            <span className="text-blue-500 mt-0.5">→</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Agent thinking...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom hint */}
        <div className="px-4 py-2 border-t border-tower-border flex items-center justify-between">
          <span className="text-[10px] text-gray-600">
            Queries are routed to the most relevant specialist agent
          </span>
          <div className="flex gap-1">
            {Object.entries(AGENT_ICONS).map(([key, icon]) => (
              <span
                key={key}
                className="text-xs opacity-40 hover:opacity-100 transition-opacity cursor-help"
                title={AGENT_SHORT_NAMES[key]}
              >
                {icon}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
