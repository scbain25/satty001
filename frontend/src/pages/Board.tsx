import { useEffect, useState } from 'react'
import axios from 'axios'
import type { Card } from '../App'

export default function Board({ onOpen }: { onOpen: (id: string) => void }) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/opportunities')
      .then(r => {
        setCards(r.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.7) return '#10b981'
    if (prob >= 0.5) return '#f59e0b'
    return '#ef4444'
  }

  const getStageBadgeColor = (stage: string) => {
    const colors: Record<string, string> = {
      'INTAKE': '#3b82f6',
      'REVIEW': '#8b5cf6',
      'APPROVED': '#10b981',
      'REJECTED': '#ef4444'
    }
    return colors[stage] || '#6b7280'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
        <div style={{ fontSize: '18px' }}>Loading opportunities...</div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
        <div style={{ fontSize: '18px' }}>No opportunities found</div>
      </div>
    )
  }

  // Calculate summary statistics
  const totalPharmacies = cards.length
  const highProb = cards.filter(c => c.pGoLive >= 0.7).length
  const mediumProb = cards.filter(c => c.pGoLive >= 0.5 && c.pGoLive < 0.7).length
  const lowProb = cards.filter(c => c.pGoLive < 0.5).length
  const avgProbability = cards.reduce((sum, c) => sum + c.pGoLive, 0) / cards.length
  const avgProfit = cards.reduce((sum, c) => sum + (c.profitP10 + c.profitP90) / 2, 0) / cards.length
  const totalPotentialProfit = cards.reduce((sum, c) => sum + (c.profitP10 + c.profitP90) / 2, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16
      }}>
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Pharmacies
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#667eea' }}>
            {totalPharmacies}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Avg Go-Live Probability
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#10b981' }}>
            {Math.round(avgProbability * 100)}%
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Avg Monthly Profit
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#f59e0b' }}>
            ${Math.round(avgProfit).toLocaleString()}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Potential (Monthly)
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#3b82f6' }}>
            ${Math.round(totalPotentialProfit).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Probability Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 16
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #10b98115 0%, #10b98105 100%)',
          borderRadius: 16,
          padding: 20,
          border: '1px solid #10b98130'
        }}>
          <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
            High (≥70%)
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
            {highProb}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            {Math.round((highProb / totalPharmacies) * 100)}% of total
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b15 0%, #f59e0b05 100%)',
          borderRadius: 16,
          padding: 20,
          border: '1px solid #f59e0b30'
        }}>
          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
            Medium (50-69%)
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>
            {mediumProb}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            {Math.round((mediumProb / totalPharmacies) * 100)}% of total
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ef444415 0%, #ef444405 100%)',
          borderRadius: 16,
          padding: 20,
          border: '1px solid #ef444430'
        }}>
          <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
            Low (&lt;50%)
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>
            {lowProb}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            {Math.round((lowProb / totalPharmacies) * 100)}% of total
          </div>
        </div>
      </div>

      {/* Pharmacy List Table */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: 700,
          color: '#1f2937'
        }}>
          📋 Pharmacy List
        </h3>
        <p style={{
          margin: '0 0 20px 0',
          fontSize: 13,
          color: '#6b7280'
        }}>
          Double-click any row to view detailed information
        </p>
        
        <div style={{
          overflowX: 'auto',
          borderRadius: 12,
          border: '1px solid #e5e7eb'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14
          }}>
            <thead>
              <tr style={{
                background: '#f9fafb',
                borderBottom: '2px solid #e5e7eb'
              }}>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Pharmacy
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Entity
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Stage
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Go-Live %
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Distance
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Profit Range
                </th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c, index) => (
                <tr
                  key={c.id}
                  onDoubleClick={() => onOpen(c.id)}
                  style={{
                    borderBottom: index < cards.length - 1 ? '1px solid #e5e7eb' : 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <td style={{ padding: '14px 16px', color: '#1f2937', fontWeight: 600 }}>
                    {c.pharmacyName}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>
                    {c.entityName}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      background: getStageBadgeColor(c.stage),
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600
                    }}>
                      {c.stage}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <span style={{
                      color: getProbabilityColor(c.pGoLive),
                      fontWeight: 700,
                      fontSize: 15
                    }}>
                      {Math.round(c.pGoLive * 100)}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#6b7280' }}>
                    {c.distanceKm !== undefined ? `${c.distanceKm} km` : 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#1f2937', fontWeight: 500 }}>
                    ${Math.round(c.profitP10).toLocaleString()} - ${Math.round(c.profitP90).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
