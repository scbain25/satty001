import { useState, useEffect, useCallback } from 'react'

const BASE = ''  // Vite proxy handles /api

export function useFetch<T>(url: string, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`${BASE}${url}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, deps)

  return { data, loading, error }
}

export function useAgentQuery() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)

  const query = useCallback(async (text: string, studyId: string = 'default') => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/agents/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, study_id: studyId }),
      })
      const data = await res.json()
      setResponse(data)
      return data
    } catch (e: any) {
      setResponse({ error: e.message })
    } finally {
      setLoading(false)
    }
  }, [])

  return { query, loading, response }
}
