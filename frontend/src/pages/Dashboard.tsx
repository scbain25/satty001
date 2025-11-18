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
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import type { Card } from '../App'

export default function Dashboard({ onOpen }: { onOpen: (id: string) => void }) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredChart, setHoveredChart] = useState<string | null>(null)
  const [hoveredTechniqueBox, setHoveredTechniqueBox] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pharmacies'>('dashboard')

  useEffect(() => {
    // Check for embedded data first (for standalone version)
    if (typeof window !== 'undefined' && (window as any).__EMBEDDED_DASHBOARD_DATA__) {
      setCards((window as any).__EMBEDDED_DASHBOARD_DATA__)
      setLoading(false)
      return
    }
    
    // Otherwise, fetch from API
    axios.get(import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/opportunities')
      .then(r => {
        setCards(r.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.7) return '#8B0000'
    if (prob >= 0.5) return '#dc2626'
    return '#f87171'
  }

  const getStageBadgeColor = (stage: string) => {
    const colors: Record<string, string> = {
      'INTAKE': '#dc2626',
      'REVIEW': '#f87171',
      'APPROVED': '#8B0000',
      'REJECTED': '#8B0000'
    }
    return colors[stage] || '#000000'
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

  // Helper function to convert kilometers to miles
  const kmToMiles = (km: number): number => {
    return km * 0.621371
  }

  // Prepare data for charts
  const chartData = cards.map(card => ({
    name: card.pharmacyName.substring(0, 8) + '...',
    fullName: card.pharmacyName,
    entity: card.entityName,
    pGoLive: Math.round(card.pGoLive * 100),
    pGoLiveDecimal: card.pGoLive,
    profitP10: toAnnualK(card.profitP10),
    profitP50: toAnnualK((card.profitP10 + card.profitP90) / 2),
    profitP90: toAnnualK(card.profitP90),
    profitRange: toAnnualK(card.profitP90) - toAnnualK(card.profitP10),
    distanceMiles: card.distanceKm ? kmToMiles(card.distanceKm) : 0,
    dispenseFee: card.dispenseFee || 0,
    tpaFee: card.tpaFee || 0,
    dataCompleteness: card.dataCompleteness ? Math.round(card.dataCompleteness * 100) : 0,
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
      return [{
        range: formatK(min),
        count: profits.length
      }]
    }
    const binSize = (max - min) / bins
    const histogram: { range: string, count: number }[] = []
    
    for (let i = 0; i < bins; i++) {
      const binMin = min + i * binSize
      const binMax = min + (i + 1) * binSize
      const range = `${formatK(binMin)}-${formatK(binMax)}`
      
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
    profitP90: d.profitP90,
    distanceMiles: d.distanceMiles,
    dispenseFee: d.dispenseFee,
    tpaFee: d.tpaFee
  })) : []

  // Calculate box plot statistics for predictors
  const calculateBoxPlotStats = (values: number[]) => {
    if (values.length === 0) return null
    const sorted = [...values].sort((a, b) => a - b)
    const q1Index = Math.floor(sorted.length * 0.25)
    const medianIndex = Math.floor(sorted.length * 0.5)
    const q3Index = Math.floor(sorted.length * 0.75)
    const stats = {
      min: sorted[0],
      q1: sorted[q1Index],
      median: sorted[medianIndex],
      q3: sorted[q3Index],
      max: sorted[sorted.length - 1]
    }
    // Calculate positions as percentages for visualization (using 5-95% range)
    const range = stats.max - stats.min
    if (range === 0) {
      return { ...stats, minPos: 5, q1Pos: 30, medianPos: 50, q3Pos: 70, maxPos: 95 }
    }
    return {
      ...stats,
      minPos: 5,
      q1Pos: 5 + ((stats.q1 - stats.min) / range) * 90,
      medianPos: 5 + ((stats.median - stats.min) / range) * 90,
      q3Pos: 5 + ((stats.q3 - stats.min) / range) * 90,
      maxPos: 5 + ((stats.max - stats.min) / range) * 90
    }
  }

  const distanceStats = calculateBoxPlotStats(chartData.map(d => d.distanceMiles))
  const dispenseFeeStats = calculateBoxPlotStats(chartData.map(d => d.dispenseFee))
  const tpaFeeStats = calculateBoxPlotStats(chartData.map(d => d.tpaFee))

  // Find highest and lowest probability pharmacies
  const highestProbPharmacy = cards.length > 0 ? cards.reduce((highest, current) => 
    current.pGoLive > highest.pGoLive ? current : highest
  , cards[0]) : null

  const lowestProbPharmacy = cards.length > 0 ? cards.reduce((lowest, current) => 
    current.pGoLive < lowest.pGoLive ? current : lowest
  , cards[0]) : null

  // Helper function to normalize values for radar chart
  const normalizeForRadar = (value: number, maxValue: number) => {
    return Math.min(100, (value / maxValue) * 100)
  }

  // Prepare radar chart data for highest and lowest probability pharmacies
  const prepareRadarData = (pharmacy: Card | null) => {
    if (!pharmacy) return null
    
    const distanceMiles = pharmacy.distanceKm ? kmToMiles(pharmacy.distanceKm) : 0
    const dispenseFee = pharmacy.dispenseFee || 0
    const tpaFee = pharmacy.tpaFee || 0
    const dataCompleteness = pharmacy.dataCompleteness ? pharmacy.dataCompleteness * 100 : 0
    const pGoLive = pharmacy.pGoLive * 100

    return [
      { 
        subject: 'Distance', 
        value: normalizeForRadar(distanceMiles, 31), // 50 km ≈ 31 miles
        rawValue: distanceMiles,
        unit: 'mi'
      },
      { 
        subject: 'Dispense Fee', 
        value: normalizeForRadar(dispenseFee, 10),
        rawValue: dispenseFee,
        unit: '$'
      },
      { 
        subject: 'TPA Fee', 
        value: normalizeForRadar(tpaFee, 2),
        rawValue: tpaFee,
        unit: '$'
      },
      { 
        subject: 'Data Quality', 
        value: dataCompleteness,
        rawValue: dataCompleteness,
        unit: '%'
      },
      { 
        subject: 'Go-Live %', 
        value: pGoLive,
        rawValue: pGoLive,
        unit: '%'
      }
    ]
  }

  const highestRadarData = prepareRadarData(highestProbPharmacy)
  const lowestRadarData = prepareRadarData(lowestProbPharmacy)

  // Combine data for radar chart (need same structure for all)
  const radarData = highestRadarData && lowestRadarData ? highestRadarData.map((item, index) => ({
    subject: item.subject,
    Highest: item.value,
    Lowest: lowestRadarData[index].value,
    fullMark: 100,
    highestRaw: item.rawValue,
    highestUnit: item.unit,
    lowestRaw: lowestRadarData[index].rawValue,
    lowestUnit: lowestRadarData[index].unit
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
                  ? formatK(entry.value)
                  : entry.name.includes('Distance')
                  ? `${entry.value.toFixed(1)} mi`
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
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#000000' }}>
        <div style={{ fontSize: '18px' }}>Loading dashboard...</div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#000000' }}>
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
  const avgProfit = cards.reduce((sum, c) => sum + toAnnualK((c.profitP10 + c.profitP90) / 2), 0) / cards.length
  const totalPotentialProfit = cards.reduce((sum, c) => sum + toAnnualK((c.profitP10 + c.profitP90) / 2), 0)

  // Find best and worst pharmacies
  const bestPharmacy = cards.reduce((best, current) => {
    const currentAnnual = toAnnualK((current.profitP10 + current.profitP90) / 2)
    const bestAnnual = toAnnualK((best.profitP10 + best.profitP90) / 2)
    const currentScore = current.pGoLive * 0.6 + (currentAnnual / 30000) * 0.4
    const bestScore = best.pGoLive * 0.6 + (bestAnnual / 30000) * 0.4
    return currentScore > bestScore ? current : best
  }, cards[0])

  const worstPharmacy = cards.reduce((worst, current) => {
    const currentAnnual = toAnnualK((current.profitP10 + current.profitP90) / 2)
    const worstAnnual = toAnnualK((worst.profitP10 + worst.profitP90) / 2)
    const currentScore = current.pGoLive * 0.6 + (currentAnnual / 30000) * 0.4
    const worstScore = worst.pGoLive * 0.6 + (worstAnnual / 30000) * 0.4
    return currentScore < worstScore ? current : worst
  }, cards[0])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        borderBottom: '2px solid #e5e7eb',
        marginBottom: 4
      }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '6px 12px',
            background: activeTab === 'dashboard' ? '#8B0000' : 'transparent',
            color: activeTab === 'dashboard' ? 'white' : '#000000',
            border: 'none',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('pharmacies')}
          style={{
            padding: '6px 12px',
            background: activeTab === 'pharmacies' ? '#8B0000' : 'transparent',
            color: activeTab === 'pharmacies' ? 'white' : '#000000',
            border: 'none',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          📋 Pharmacy List
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: 'calc(100vh - 120px)' }}>
      {/* Summary Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8
      }}>
        <div style={{
          background: 'white',
          borderRadius: 10,
          padding: 12,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 11, color: '#000000', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Pharmacies
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#8B0000' }}>
            {totalPharmacies}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 10,
          padding: 12,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 11, color: '#000000', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Avg Go-Live Probability
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626' }}>
            {Math.round(avgProbability * 100)}%
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 10,
          padding: 12,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 11, color: '#000000', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Avg Annual Profit
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f87171' }}>
            {formatK(avgProfit)}
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 10,
          padding: 12,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 11, color: '#000000', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Potential (Annual)
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626' }}>
            {formatK(totalPotentialProfit)}
          </div>
        </div>
      </div>

      {/* Charts Layout: 2x2 grid with right sidebar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 8
      }}>
        {/* Left side: 2x2 grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8
        }}>
        {/* Top Left - Histogram - Probability Distribution */}
        <div 
          style={{
            background: 'white',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}
          onMouseEnter={() => setHoveredChart('probability-distribution')}
          onMouseLeave={() => setHoveredChart(null)}
        >
          <h3 style={{ 
            margin: '0 0 4px 0',
            fontSize: '13px',
            fontWeight: 700,
            color: '#000000'
          }}>
            📊 Probability Distribution (X: Probability Range, Y: Count)
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            marginBottom: '8px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#8B0000', borderRadius: '2px' }}></div>
              <span style={{ color: '#000000' }}>High</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#dc2626', borderRadius: '2px' }}></div>
              <span style={{ color: '#000000' }}>Med</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#f87171', borderRadius: '2px' }}></div>
              <span style={{ color: '#000000' }}>Low</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={probabilityHistogram} margin={{ top: 5, right: 10, left: 5, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="range" 
                  angle={-45}
                  textAnchor="end"
                  height={35}
                  tick={{ fontSize: 11, fill: '#000000' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#000000' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="high" stackId="a" name="High" fill="#8B0000" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" stackId="a" name="Med" fill="#dc2626" radius={[0, 0, 0, 0]} />
                <Bar dataKey="low" stackId="a" name="Low" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {hoveredChart === 'probability-distribution' && (
              <div 
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '6px 8px',
                  fontSize: '9px',
                  color: '#000000',
                  maxWidth: '140px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  zIndex: 10
                }}
                onMouseEnter={() => setHoveredTechniqueBox('probability-distribution')}
                onMouseLeave={() => setHoveredTechniqueBox(null)}
              >
                <div style={{ fontWeight: 700, marginBottom: '3px', fontSize: '9px' }}>Technique: Distribution Analysis</div>
                <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '8px', color: '#8B0000' }}>Model: XGBoost/LightGBM</div>
                <div style={{ fontSize: '8px', lineHeight: '1.3' }}>
                  • Go-live probability values<br/>
                  • Pharmacy count per range<br/>
                  • Probability thresholds
                </div>
                {hoveredTechniqueBox === 'probability-distribution' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    background: '#000000',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: '11px',
                    whiteSpace: 'normal',
                    width: '200px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}>
                    Displays the count of pharmacies grouped by go-live probability ranges (high ≥70%, medium 50-69%, low &lt;50%).
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top Right - Histogram - Profitability Distribution */}
        <div 
          style={{
            background: 'white',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}
          onMouseEnter={() => setHoveredChart('profitability-distribution')}
          onMouseLeave={() => setHoveredChart(null)}
        >
          <h3 style={{ 
            margin: '0 0 4px 0',
            fontSize: '13px',
            fontWeight: 700,
            color: '#000000'
          }}>
            💰 Profitability Distribution (X: Annual Profit Range ($K), Y: Count)
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            marginBottom: '8px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#dc2626', borderRadius: '2px' }}></div>
              <span style={{ color: '#000000' }}>Count</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={profitHistogram} margin={{ top: 5, right: 10, left: 5, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="range" 
                  angle={-45}
                  textAnchor="end"
                  height={35}
                  tick={{ fontSize: 11, fill: '#000000' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#000000' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {hoveredChart === 'profitability-distribution' && (
              <div 
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '6px 8px',
                  fontSize: '9px',
                  color: '#000000',
                  maxWidth: '140px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  zIndex: 10
                }}
                onMouseEnter={() => setHoveredTechniqueBox('profitability-distribution')}
                onMouseLeave={() => setHoveredTechniqueBox(null)}
              >
                <div style={{ fontWeight: 700, marginBottom: '3px', fontSize: '9px' }}>Technique: Distribution Analysis</div>
                <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '8px', color: '#8B0000' }}>Model: XGBoost Quantile Regression</div>
                <div style={{ fontSize: '8px', lineHeight: '1.3' }}>
                  • Annual profit estimates (P50)<br/>
                  • Pharmacy count per range<br/>
                  • Profit bin ranges
                </div>
                {hoveredTechniqueBox === 'profitability-distribution' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    background: '#000000',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: '11px',
                    whiteSpace: 'normal',
                    width: '200px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}>
                    Shows the distribution of pharmacies across different annual profit ranges, indicating the concentration of opportunities.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Left - Line Chart - Probability Trend */}
        <div 
          style={{
            background: 'white',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}
          onMouseEnter={() => setHoveredChart('probability-trend')}
          onMouseLeave={() => setHoveredChart(null)}
        >
          <h3 style={{ 
            margin: '0 0 4px 0',
            fontSize: '13px',
            fontWeight: 700,
            color: '#000000'
          }}>
            📈 Probability Trend (X: Pharmacy Rank, Y: Go-Live Probability (%))
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            marginBottom: '8px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '2px', background: '#8B0000' }}></div>
              <span style={{ color: '#000000' }}>Go-Live %</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="index" 
                  tick={{ fontSize: 12, fill: '#000000' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: '#000000' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="pGoLive" 
                  name="Go-Live %" 
                  stroke="#8B0000" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {hoveredChart === 'probability-trend' && (
              <div 
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '6px 8px',
                  fontSize: '9px',
                  color: '#000000',
                  maxWidth: '140px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  zIndex: 10
                }}
                onMouseEnter={() => setHoveredTechniqueBox('probability-trend')}
                onMouseLeave={() => setHoveredTechniqueBox(null)}
              >
                <div style={{ fontWeight: 700, marginBottom: '3px', fontSize: '9px' }}>Technique: Trend Analysis</div>
                <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '8px', color: '#8B0000' }}>Model: XGBoost/LightGBM</div>
                <div style={{ fontSize: '8px', lineHeight: '1.3' }}>
                  • Go-live probability %<br/>
                  • Pharmacy ranking order<br/>
                  • Sequential trend pattern
                </div>
                {hoveredTechniqueBox === 'probability-trend' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    background: '#000000',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: '11px',
                    whiteSpace: 'normal',
                    width: '200px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}>
                    Shows go-live probability percentage for each pharmacy ranked from highest to lowest.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Right - Line Chart - Profitability Trend */}
        <div 
          style={{
            background: 'white',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}
          onMouseEnter={() => setHoveredChart('profitability-trend')}
          onMouseLeave={() => setHoveredChart(null)}
        >
          <h3 style={{ 
            margin: '0 0 4px 0',
            fontSize: '13px',
            fontWeight: 700,
            color: '#000000'
          }}>
            💰 Profitability Trend (X: Pharmacy Rank, Y: Annual Profit ($K))
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            marginBottom: '8px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '1.5px', background: '#dc2626' }}></div>
              <span style={{ color: '#000000' }}>P10</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '2px', background: '#8B0000' }}></div>
              <span style={{ color: '#000000' }}>P50</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '1.5px', background: '#f87171' }}></div>
              <span style={{ color: '#000000' }}>P90</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="index" 
                  tick={{ fontSize: 12, fill: '#000000' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#000000' }}
                  tickFormatter={(value) => formatK(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="profitP10" 
                  name="P10" 
                  stroke="#dc2626" 
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="profitP50" 
                  name="P50" 
                  stroke="#8B0000" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profitP90" 
                  name="P90" 
                  stroke="#f87171" 
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            {hoveredChart === 'profitability-trend' && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '6px 8px',
                  fontSize: '9px',
                  color: '#000000',
                  maxWidth: '140px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  zIndex: 10
                }}
                onMouseEnter={() => setHoveredTechniqueBox('profitability-trend')}
                onMouseLeave={() => setHoveredTechniqueBox(null)}
              >
                <div style={{ fontWeight: 700, marginBottom: '3px', fontSize: '9px' }}>Technique: Percentile Analysis</div>
                <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '8px', color: '#8B0000' }}>Model: XGBoost Quantile Regression</div>
                <div style={{ fontSize: '8px', lineHeight: '1.3' }}>
                  • P10, P50, P90 estimates<br/>
                  • Annual profit values<br/>
                  • Ranked by probability
                </div>
                {hoveredTechniqueBox === 'profitability-trend' && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: 4,
                    background: '#000000',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: '11px',
                    whiteSpace: 'normal',
                    width: '200px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}>
                    Displays conservative (P10), expected (P50), and optimistic (P90) profit projections across pharmacies.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        </div>

        {/* Right side: Predictor Profile and Distance Trend stacked */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}>
        {/* Radar Plot */}
        <div 
          style={{
            background: 'white',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}
          onMouseEnter={() => setHoveredChart('predictor-profile')}
          onMouseLeave={() => setHoveredChart(null)}
        >
          <h3 style={{ 
            margin: '0 0 4px 0',
            fontSize: '13px',
            fontWeight: 700,
            color: '#000000'
          }}>
            📊 Predictor Profile (Highest vs Lowest Probability) (Radial: Normalized Value (%))
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            marginBottom: '8px',
            fontSize: '11px',
            flexWrap: 'wrap'
          }}>
            {highestProbPharmacy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#8B0000', borderRadius: '50%' }}></div>
                <span style={{ color: '#000000' }}>
                  Highest: {highestProbPharmacy.pharmacyName.substring(0, 20)}...
                </span>
              </div>
            )}
            {lowestProbPharmacy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#f87171', borderRadius: '50%' }}></div>
                <span style={{ color: '#000000' }}>
                  Lowest: {lowestProbPharmacy.pharmacyName.substring(0, 20)}...
                </span>
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 12, fill: '#000000' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: '#000000' }}
                />
              {highestProbPharmacy && (
                <Radar 
                  name={`Highest: ${highestProbPharmacy.pharmacyName.substring(0, 20)}...`}
                  dataKey="Highest" 
                  stroke="#8B0000" 
                  fill="#8B0000" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              )}
              {lowestProbPharmacy && (
                <Radar 
                  name={`Lowest: ${lowestProbPharmacy.pharmacyName.substring(0, 20)}...`}
                  dataKey="Lowest" 
                  stroke="#f87171" 
                  fill="#f87171" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              )}
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div style={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}>
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: 700, 
                          marginBottom: '8px',
                          color: '#000000',
                          borderBottom: '1px solid #e5e7eb',
                          paddingBottom: '6px'
                        }}>
                          {data.subject}
                        </div>
                        {payload.map((entry: any, index: number) => {
                          const isHighest = entry.dataKey === 'Highest'
                          const pharmacy = isHighest ? highestProbPharmacy : lowestProbPharmacy
                          const rawValue = isHighest ? data.highestRaw : data.lowestRaw
                          const unit = isHighest ? data.highestUnit : data.lowestUnit
                          
                          if (!pharmacy) return null
                          
                          return (
                            <div key={index} style={{ 
                              marginBottom: '8px',
                              padding: '6px',
                              background: isHighest ? '#fee2e2' : '#fef2f2',
                              borderRadius: '4px',
                              border: `1px solid ${entry.color}`
                            }}>
                              <div style={{ 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                color: entry.color,
                                marginBottom: '4px'
                              }}>
                                {isHighest ? '🏆 Highest Probability' : '⚠️ Lowest Probability'}
                              </div>
                              <div style={{ fontSize: '10px', color: '#000000', marginBottom: '2px' }}>
                                <strong>Pharmacy:</strong> {pharmacy.pharmacyName}
                              </div>
                              <div style={{ fontSize: '10px', color: '#000000', marginBottom: '2px' }}>
                                <strong>Entity:</strong> {pharmacy.entityName}
                              </div>
                              <div style={{ fontSize: '10px', color: '#000000', marginBottom: '2px' }}>
                                <strong>Go-Live Probability:</strong> {(pharmacy.pGoLive * 100).toFixed(1)}%
                              </div>
                              <div style={{ fontSize: '10px', color: '#000000', marginBottom: '2px' }}>
                                <strong>{data.subject}:</strong> {typeof rawValue === 'number' ? rawValue.toFixed(2) : rawValue}{unit}
                              </div>
                              <div style={{ fontSize: '10px', color: '#000000', marginBottom: '2px' }}>
                                <strong>Distance:</strong> {pharmacy.distanceKm ? kmToMiles(pharmacy.distanceKm).toFixed(1) : 'N/A'} mi
                              </div>
                              <div style={{ fontSize: '10px', color: '#000000', marginBottom: '2px' }}>
                                <strong>Profit Range:</strong> {formatK(toAnnualK(pharmacy.profitP10))} - {formatK(toAnnualK(pharmacy.profitP90))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  }
                  return null
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          {hoveredChart === 'predictor-profile' && (
            <div 
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: '9px',
                color: '#000000',
                maxWidth: '140px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                zIndex: 10
              }}
              onMouseEnter={() => setHoveredTechniqueBox('predictor-profile')}
              onMouseLeave={() => setHoveredTechniqueBox(null)}
            >
              <div style={{ fontWeight: 700, marginBottom: '3px', fontSize: '9px' }}>Technique: Multi-dimensional Comparison</div>
              <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '8px', color: '#8B0000' }}>Explainability: SHAP Values</div>
              <div style={{ fontSize: '8px', lineHeight: '1.3' }}>
                • Distance, fees, data quality<br/>
                • Go-live probability<br/>
                • Highest vs lowest comparison
              </div>
              {hoveredTechniqueBox === 'predictor-profile' && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  marginBottom: 4,
                  background: '#000000',
                  color: 'white',
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: '11px',
                  whiteSpace: 'normal',
                  width: '200px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                  zIndex: 1000,
                  pointerEvents: 'none'
                }}>
                  Compares the highest and lowest probability pharmacies across key predictors (distance, fees, data quality, go-live probability) to highlight differences in opportunity characteristics.
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Distance Trend */}
        <div 
          style={{
            background: 'white',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            position: 'relative'
          }}
          onMouseEnter={() => setHoveredChart('distance-trend')}
          onMouseLeave={() => setHoveredChart(null)}
        >
          <h3 style={{ 
            margin: '0 0 4px 0',
            fontSize: '13px',
            fontWeight: 700,
            color: '#000000'
          }}>
            📏 Distance Trend (X: Pharmacy Rank, Y: Distance (miles))
          </h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '16px', 
            marginBottom: '8px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '2px', background: '#8B0000' }}></div>
              <span style={{ color: '#000000' }}>Distance (miles)</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="index" 
                  tick={{ fontSize: 12, fill: '#000000' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#000000' }}
                  tickFormatter={(value) => `${value}mi`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="distanceMiles" 
                  name="Distance (miles)" 
                  stroke="#8B0000" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {hoveredChart === 'distance-trend' && (
              <div 
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '6px 8px',
                  fontSize: '9px',
                  color: '#000000',
                  maxWidth: '140px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  zIndex: 10
                }}
                onMouseEnter={() => setHoveredTechniqueBox('distance-trend')}
                onMouseLeave={() => setHoveredTechniqueBox(null)}
              >
                <div style={{ fontWeight: 700, marginBottom: '3px', fontSize: '9px' }}>Technique: Trend Analysis</div>
                <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '8px', color: '#8B0000' }}>Data: Raw Input Feature</div>
                <div style={{ fontSize: '8px', lineHeight: '1.3' }}>
                  • Distance in miles<br/>
                  • Pharmacy ranking order<br/>
                  • Geographic distribution
                </div>
                {hoveredTechniqueBox === 'distance-trend' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    background: '#000000',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: '11px',
                    whiteSpace: 'normal',
                    width: '200px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}>
                    Shows the distance in miles from each pharmacy to the covered entity, sorted by probability rank.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      </div>
      )}

      {activeTab === 'pharmacies' && (
        <div style={{
          background: 'white',
          borderRadius: 10,
          padding: 12,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontWeight: 700,
            color: '#000000'
          }}>
            📋 Pharmacy List (Double-click to view details)
          </h3>
          
          <div style={{
            overflowX: 'auto',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            maxHeight: 'calc(100vh - 250px)',
            overflowY: 'auto'
          }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 9
          }}>
            <thead>
              <tr style={{
                background: '#f9fafb',
                borderBottom: '2px solid #e5e7eb',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                <th style={{
                  padding: '4px 6px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#000000',
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Pharmacy
                </th>
                <th style={{
                  padding: '4px 6px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#000000',
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Entity
                </th>
                <th style={{
                  padding: '4px 6px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#000000',
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Stage
                </th>
                <th style={{
                  padding: '4px 6px',
                  textAlign: 'right',
                  fontWeight: 600,
                  color: '#000000',
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Go-Live %
                </th>
                <th style={{
                  padding: '4px 6px',
                  textAlign: 'right',
                  fontWeight: 600,
                  color: '#000000',
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Distance
                </th>
                <th style={{
                  padding: '4px 6px',
                  textAlign: 'right',
                  fontWeight: 600,
                  color: '#000000',
                  fontSize: 9,
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
                  <td style={{ padding: '4px 6px', color: '#000000', fontWeight: 600 }}>
                    {c.pharmacyName}
                  </td>
                  <td style={{ padding: '4px 6px', color: '#000000' }}>
                    {c.entityName}
                  </td>
                  <td style={{ padding: '4px 6px' }}>
                    <span style={{
                      display: 'inline-block',
                      background: getStageBadgeColor(c.stage),
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: 6,
                      fontSize: 9,
                      fontWeight: 600
                    }}>
                      {c.stage}
                    </span>
                  </td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>
                    <span style={{
                      color: getProbabilityColor(c.pGoLive),
                      fontWeight: 700,
                      fontSize: 9
                    }}>
                      {Math.round(c.pGoLive * 100)}%
                    </span>
                  </td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#000000' }}>
                    {c.distanceKm !== undefined ? `${kmToMiles(c.distanceKm).toFixed(1)} mi` : 'N/A'}
                  </td>
                  <td style={{ padding: '4px 6px', textAlign: 'right', color: '#000000', fontWeight: 500 }}>
                    {formatK(toAnnualK(c.profitP10))} - {formatK(toAnnualK(c.profitP90))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}

