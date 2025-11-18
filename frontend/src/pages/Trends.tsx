import { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import type { Card } from '../App'

export default function Trends() {
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

  // Prepare data for charts
  const chartData = cards.map(card => ({
    name: card.pharmacyName.substring(0, 8) + '...',
    fullName: card.pharmacyName,
    entity: card.entityName,
    pGoLive: Math.round(card.pGoLive * 100),
    pGoLiveDecimal: card.pGoLive,
    profitP10: Math.round(card.profitP10),
    profitP50: Math.round((card.profitP10 + card.profitP90) / 2),
    profitP90: Math.round(card.profitP90),
    profitRange: Math.round(card.profitP90 - card.profitP10),
    distanceKm: card.distanceKm || 0,
    stage: card.stage
  })).sort((a, b) => b.pGoLive - a.pGoLive)

  // Create histogram data for probability distribution
  const createHistogramData = (data: typeof chartData, bins: number, min: number, max: number) => {
    const binSize = (max - min) / bins
    const histogram: { range: string, count: number, high: number, medium: number, low: number }[] = []
    
    for (let i = 0; i < bins; i++) {
      const binMin = min + i * binSize
      const binMax = min + (i + 1) * binSize
      const range = `${Math.round(binMin)}-${Math.round(binMax)}%`
      
      const inBin = data.filter(d => {
        const val = d.pGoLive
        return val >= binMin && (i === bins - 1 ? val <= binMax : val < binMax)
      })
      
      histogram.push({
        range,
        count: inBin.length,
        high: inBin.filter(d => d.pGoLive >= 70).length,
        medium: inBin.filter(d => d.pGoLive >= 50 && d.pGoLive < 70).length,
        low: inBin.filter(d => d.pGoLive < 50).length
      })
    }
    
    return histogram
  }

  const probabilityHistogram = chartData.length > 0 ? createHistogramData(chartData, 10, 0, 100) : []

  // Create histogram for profitability distribution
  const createProfitHistogram = (data: typeof chartData, bins: number) => {
    if (data.length === 0) {
      return []
    }
    const profits = data.map(d => d.profitP50)
    const min = Math.min(...profits)
    const max = Math.max(...profits)
    if (min === max) {
      // All values are the same, create a single bin
      return [{
        range: `$${Math.round(min).toLocaleString()}`,
        count: profits.length
      }]
    }
    const binSize = (max - min) / bins
    const histogram: { range: string, count: number }[] = []
    
    for (let i = 0; i < bins; i++) {
      const binMin = min + i * binSize
      const binMax = min + (i + 1) * binSize
      const range = `$${Math.round(binMin).toLocaleString()}-${Math.round(binMax).toLocaleString()}`
      
      const inBin = profits.filter(val => val >= binMin && (i === bins - 1 ? val <= binMax : val < binMax))
      
      histogram.push({
        range,
        count: inBin.length
      })
    }
    
    return histogram
  }

  const profitHistogram = chartData.length > 0 ? createProfitHistogram(chartData, 8) : []

  // Line chart data - sorted by probability
  const lineChartData = chartData.length > 0 ? chartData.map((d, index) => ({
    index: index + 1,
    name: d.name,
    fullName: d.fullName,
    entity: d.entity,
    pGoLive: d.pGoLive,
    profitP50: d.profitP50,
    profitP10: d.profitP10,
    profitP90: d.profitP90
  })) : []

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload || payload[0]
      return (
        <div style={{
          background: 'white',
          padding: '12px 16px',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {data.fullName && (
            <>
              <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#1f2937' }}>
                {data.fullName}
              </p>
              <p style={{ margin: '4px 0', fontSize: 12, color: '#6b7280' }}>
                Entity: {data.entity}
              </p>
            </>
          )}
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              fontSize: 13, 
              color: entry.color,
              fontWeight: 600
            }}>
              {entry.name}: {typeof entry.value === 'number' 
                ? (entry.name.includes('Profit') || entry.name.includes('Range') 
                  ? `$${entry.value.toLocaleString()}` 
                  : `${entry.value}%`)
                : entry.value}
            </p>
          ))}
          {data.range && (
            <p style={{ margin: '4px 0', fontSize: 13, color: '#6b7280' }}>
              Range: {data.range}
            </p>
          )}
        </div>
      )
    }
    return null
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
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading trend data...</div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div style={{ 
        background: 'white',
        borderRadius: 16,
        padding: '60px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
      }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>No data available for trends</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
      }}>
        <h2 style={{ 
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: 700,
          color: '#1f2937'
        }}>
          📈 Pharmacy Opportunity Trends
        </h2>
        <p style={{ 
          margin: 0,
          color: '#6b7280',
          fontSize: 14
        }}>
          Distribution analysis and trend visualization of go-live probabilities and profitability metrics
        </p>
      </div>

      {/* 2x2 Grid of Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24
      }}>
        {/* Top Left - Histogram - Probability Distribution */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        }}>
        <h3 style={{ 
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#1f2937'
        }}>
          📊 Go-Live Probability Distribution (Histogram)
        </h3>
        <p style={{ 
          margin: '0 0 20px 0',
          fontSize: 13,
          color: '#6b7280'
        }}>
          Distribution of pharmacies across probability ranges. Shows concentration of high, medium, and low probability opportunities.
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={probabilityHistogram} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="range" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis 
              label={{ value: 'Number of Pharmacies', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="high" stackId="a" name="High (≥70%)" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="medium" stackId="a" name="Medium (50-69%)" fill="#f59e0b" radius={[0, 0, 0, 0]} />
            <Bar dataKey="low" stackId="a" name="Low (&lt;50%)" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

        {/* Top Right - Histogram - Profitability Distribution */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        }}>
        <h3 style={{ 
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#1f2937'
        }}>
          💰 Expected Profitability Distribution (Histogram)
        </h3>
        <p style={{ 
          margin: '0 0 20px 0',
          fontSize: 13,
          color: '#6b7280'
        }}>
          Distribution of pharmacies by expected monthly profit ranges. Shows where most opportunities fall in terms of profitability.
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={profitHistogram} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="range" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis 
              label={{ value: 'Number of Pharmacies', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="count" name="Number of Pharmacies" fill="#667eea" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

        {/* Bottom Left - Line Chart - Probability Trend */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        }}>
        <h3 style={{ 
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#1f2937'
        }}>
          📈 Go-Live Probability Trend (Sorted by Rank)
        </h3>
        <p style={{ 
          margin: '0 0 20px 0',
          fontSize: 13,
          color: '#6b7280'
        }}>
          Line chart showing go-live probabilities sorted from highest to lowest. Each point represents a pharmacy ranked by probability.
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="index" 
              label={{ value: 'Pharmacy Rank (by Probability)', position: 'insideBottom', offset: -5, style: { fill: '#6b7280' } }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              label={{ value: 'Go-Live Probability (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="pGoLive" 
              name="Go-Live Probability (%)" 
              stroke="#667eea" 
              strokeWidth={3}
              dot={{ fill: '#667eea', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

        {/* Bottom Right - Line Chart - Profitability Trend */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        }}>
        <h3 style={{ 
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#1f2937'
        }}>
          💰 Profitability Trend (Sorted by Probability Rank)
        </h3>
        <p style={{ 
          margin: '0 0 20px 0',
          fontSize: 13,
          color: '#6b7280'
        }}>
          Line chart showing profitability ranges (P10, P50, P90) for pharmacies sorted by go-live probability. Shows the relationship between probability and profit potential.
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="index" 
              label={{ value: 'Pharmacy Rank (by Probability)', position: 'insideBottom', offset: -5, style: { fill: '#6b7280' } }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              label={{ value: 'Monthly Profit ($)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="profitP10" 
              name="Conservative (P10)" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="profitP50" 
              name="Expected (P50)" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="profitP90" 
              name="Optimistic (P90)" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      </div>

      {/* Summary Statistics */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: '#1f2937'
        }}>
          📋 Summary Statistics
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 16 
        }}>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            borderRadius: 12,
            border: '1px solid #667eea30'
          }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>
              Total Pharmacies
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#667eea' }}>
              {cards.length}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #10b98115 0%, #10b98105 100%)',
            borderRadius: 12,
            border: '1px solid #10b98130'
          }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>
              Avg Go-Live Probability
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
              {chartData.length > 0 ? Math.round(chartData.reduce((sum, d) => sum + d.pGoLive, 0) / chartData.length) : 0}%
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #f59e0b15 0%, #f59e0b05 100%)',
            borderRadius: 12,
            border: '1px solid #f59e0b30'
          }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>
              Avg Expected Profit
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>
              ${chartData.length > 0 ? Math.round(chartData.reduce((sum, d) => sum + d.profitP50, 0) / chartData.length).toLocaleString() : '0'}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #3b82f615 0%, #3b82f605 100%)',
            borderRadius: 12,
            border: '1px solid #3b82f630'
          }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>
              High Probability (≥70%)
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>
              {chartData.filter(d => d.pGoLive >= 70).length}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #f59e0b15 0%, #f59e0b05 100%)',
            borderRadius: 12,
            border: '1px solid #f59e0b30'
          }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>
              Medium Probability (50-69%)
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>
              {chartData.filter(d => d.pGoLive >= 50 && d.pGoLive < 70).length}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #ef444415 0%, #ef444405 100%)',
            borderRadius: 12,
            border: '1px solid #ef444430'
          }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>
              Low Probability (&lt;50%)
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>
              {chartData.filter(d => d.pGoLive < 50).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
