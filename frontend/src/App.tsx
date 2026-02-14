import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Detail from './pages/Detail'

export type Card = {
  id: string
  pharmacyName: string
  entityName: string
  stage: string
  distanceKm?: number
  pGoLive: number
  profitP10: number
  profitP90: number
  topFactors: { name: string, readable: string }[]
  dispenseFee?: number
  tpaFee?: number
  dataCompleteness?: number
}

export default function App() {
  const [selected, setSelected] = useState<string | null>(null)

  const handleBack = () => {
    setSelected(null)
  }

  const handleOpen = (id: string) => {
    setSelected(id)
  }

  return (
    <div style={{ 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8B0000 0%, #dc2626 100%)',
      padding: 0,
      margin: 0
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '12px 16px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: 700,
            color: '#1f2937',
            letterSpacing: '-0.5px'
          }}>
            🏥 MacroHelix AI Implementation Triage
          </h1>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: '#000000', 
            fontSize: '11px',
            fontWeight: 400
          }}>
            Intelligent pharmacy opportunity scoring and analysis
          </p>
        </div>
      </div>
      <div style={{ padding: '12px', maxWidth: '1400px', margin: '0 auto' }}>
        {!selected && <Dashboard onOpen={handleOpen} />}
        {selected && <Detail id={selected} onBack={handleBack} />}
      </div>
    </div>
  )
}
