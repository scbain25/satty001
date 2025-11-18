import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Detail({ id, onBack }: { id: string, onBack: () => void }) {
  const [score, setScore] = useState<any>(null)
  const [fee, setFee] = useState<number>(550)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    setLoading(true)
    axios.post((import.meta.env.VITE_API_URL || 'http://localhost:8000') + `/api/v1/scoring/${id}`)
      .then(r => {
        setScore(r.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const recalc = async () => {
    setRecalculating(true)
    try {
      const r = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:8000') + `/api/v1/sandbox/score/${id}`, { overrides: { dispense_fee: fee/100.0 } })
      setScore({ ...score, ...r.data })
    } finally {
      setRecalculating(false)
    }
  }

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.7) return '#8B0000'
    if (prob >= 0.5) return '#dc2626'
    return '#f87171'
  }

  // Helper function to convert monthly profit to annual and round up to nearest K
  const toAnnualK = (monthlyProfit: number): number => {
    const annual = monthlyProfit * 12
    return Math.ceil(annual / 1000) * 1000
  }

  // Helper function to format as K notation
  const formatK = (value: number): string => {
    return `$${Math.round(value / 1000)}K`
  }

  if (loading) {
    return (
      <div style={{ 
        background: 'white',
        borderRadius: 16,
        padding: '60px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
      }}>
        <div style={{ fontSize: '18px', color: '#000000' }}>Loading opportunity details...</div>
      </div>
    )
  }

  if (!score) {
    return (
      <div style={{ 
        background: 'white',
        borderRadius: 16,
        padding: '60px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
      }}>
        <div style={{ fontSize: '18px', color: '#8B0000' }}>Failed to load opportunity</div>
        <button 
          onClick={onBack}
          style={{
            marginTop: 16,
            padding: '10px 20px',
            background: '#8B0000',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <button 
        onClick={onBack}
        style={{
          marginBottom: 12,
          padding: '6px 12px',
          background: 'white',
          color: '#8B0000',
          border: '2px solid #8B0000',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#8B0000'
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white'
          e.currentTarget.style.color = '#8B0000'
        }}
      >
        ← Back
      </button>

      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 12,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        marginBottom: 12
      }}>
        <h2 style={{ 
          margin: '0 0 4px 0',
          fontSize: '16px',
          fontWeight: 700,
            color: '#000000'
        }}>
          📊 Opportunity Analysis
        </h2>
        <p style={{ 
          margin: 0,
          color: '#000000',
          fontSize: 11
        }}>
          ID: <span style={{ fontFamily: 'monospace', color: '#000000' }}>{id}</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ 
          background: 'white',
          border: '1px solid #e5e7eb', 
          borderRadius: 12, 
          padding: 12,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ 
            fontSize: 10, 
            color: '#000000', 
            fontWeight: 600, 
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8
          }}>
            🎯 Go-Live Probability
          </div>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: 800,
            color: getProbabilityColor(score.p_go_live),
            lineHeight: 1,
            marginBottom: 8
          }}>
            {Math.round(score.p_go_live*100)}%
          </div>
          <div style={{
            padding: '8px',
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: 10, color: '#000000', marginBottom: 2 }}>
              Estimated Time to Go-Live
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>
              {score.days_to_live} days
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'white',
          border: '1px solid #e5e7eb', 
          borderRadius: 12, 
          padding: 12,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ 
            fontSize: 10, 
            color: '#000000', 
            fontWeight: 600, 
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8
          }}>
            💰 Annual Profitability Projections
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            <div style={{
              padding: '8px',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
              borderRadius: 8,
              border: '1px solid #fee2e2'
            }}>
              <div style={{ fontSize: 9, color: '#f87171', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase' }}>
                Conservative (P10)
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f87171' }}>
                {formatK(toAnnualK(score.profit_p10))}/yr
              </div>
            </div>
            <div style={{
              padding: '8px',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
              borderRadius: 8,
              border: '1px solid #fee2e2'
            }}>
              <div style={{ fontSize: 9, color: '#dc2626', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase' }}>
                Expected (P50)
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>
                {formatK(toAnnualK(score.profit_p50))}/yr
              </div>
            </div>
            <div style={{
              padding: '8px',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
              borderRadius: 8,
              border: '1px solid #fee2e2'
            }}>
              <div style={{ fontSize: 9, color: '#8B0000', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase' }}>
                Optimistic (P90)
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#8B0000' }}>
                {formatK(toAnnualK(score.profit_p90))}/yr
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        background: 'white',
        marginBottom: 12,
        border: '1px solid #e5e7eb', 
        borderRadius: 12, 
        padding: 12,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ 
          fontSize: 12, 
          color: '#1f2937', 
          fontWeight: 700, 
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          🔍 Top Influencing Factors
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {score.top_factors.map((f:any, idx:number) => (
            <div 
              key={idx}
              style={{
                padding: '8px 10px',
                background: idx === 0 ? 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)' : '#f9fafb',
                borderRadius: 8,
                border: idx === 0 ? '2px solid #8B0000' : '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: idx === 0 ? '#8B0000' : '#dc2626',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 11,
                flexShrink: 0
              }}>
                {idx + 1}
              </div>
              <div style={{ fontSize: 11, color: '#000000', fontWeight: 500 }}>
                {f.readable}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        background: 'white',
        border: '1px solid #e5e7eb', 
        borderRadius: 12, 
        padding: 12,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ 
          fontSize: 12, 
          color: '#1f2937', 
          fontWeight: 700, 
          marginBottom: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          🧪 What-If Scenario Analysis
        </div>
        <p style={{ 
          fontSize: 10, 
          color: '#000000', 
          margin: '0 0 12px 0',
          lineHeight: 1.4
        }}>
          Adjust parameters to see how they impact the opportunity score and profitability projections.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: 10, 
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ 
              display: 'block',
              fontSize: 10,
              fontWeight: 600,
              color: '#000000',
              marginBottom: 4
            }}>
              Dispense Fee (cents)
            </label>
            <input 
              type="number" 
              value={fee} 
              onChange={e => setFee(parseInt(e.target.value || '0'))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                color: '#000000',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#8B0000'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 0, 0, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <div style={{ fontSize: 10, color: '#000000', marginTop: 4 }}>
              Current: ${(fee / 100).toFixed(2)} per dispense
            </div>
          </div>
          <button 
            onClick={recalc}
            disabled={recalculating}
            style={{ 
              padding: '8px 20px',
              background: recalculating ? '#9ca3af' : 'linear-gradient(135deg, #8B0000 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: recalculating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: recalculating ? 'none' : '0 2px 4px rgba(102, 126, 234, 0.25)',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!recalculating) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.35)'
              }
            }}
            onMouseLeave={(e) => {
              if (!recalculating) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.25)'
              }
            }}
          >
            {recalculating ? 'Calculating...' : '🔄 Recalculate'}
          </button>
        </div>
      </div>
    </div>
  )
}
