import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function StudentResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/results/my').then(({ data }) => setResults(data)).catch(() => setResults([])).finally(() => setLoading(false))
  }, [])

  const getPct = r => Math.round((r.marks_obtained / r.total_marks) * 100)
  const getColor = pct => pct >= 75 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#f87171'
  const getEmoji = pct => pct >= 75 ? '🏆' : pct >= 50 ? '👍' : '📚'

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom:'8px' }}>🏆 My Results</h1>
      <p style={{ color:'#64748b', fontSize:'0.875rem', marginBottom:'24px' }}>Your private test results — only you can see these.</p>

      {loading && <p style={{ color:'#64748b' }}>Loading results...</p>}
      {!loading && results.length === 0 && (
        <div className="card-dark" style={{ padding:'48px', textAlign:'center', color:'#475569' }}>
          <div style={{ fontSize:'3rem', marginBottom:'12px' }}>📋</div>
          <p>No results posted yet. Your teacher will update your scores here.</p>
        </div>
      )}
      <div style={{ display:'grid', gap:'14px' }}>
        {results.map(r => {
          const pct = getPct(r)
          return (
            <div key={r.id} className="card-dark" style={{ padding:'22px 26px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'20px' }}>
              <div>
                <h3 style={{ margin:'0 0 6px', color:'#e2e8f0', fontSize:'1rem', fontWeight:700 }}>{r.test_name}</h3>
                <p style={{ margin:0, color:'#64748b', fontSize:'0.8rem' }}>{r.subject?.replace('_',' ')} · {new Date(r.created_at).toLocaleDateString()}</p>
                {r.feedback && <p style={{ margin:'8px 0 0', color:'#94a3b8', fontSize:'0.85rem', fontStyle:'italic' }}>"{r.feedback}"</p>}
              </div>
              <div style={{ textAlign:'center', minWidth:'80px' }}>
                <p style={{ fontFamily:'Orbitron', fontSize:'1.6rem', color:getColor(pct), margin:0 }}>{r.marks_obtained}<span style={{ fontSize:'1rem', color:'#475569' }}>/{r.total_marks}</span></p>
                <p style={{ margin:'4px 0 0', fontSize:'0.8rem', color:getColor(pct), fontWeight:600 }}>{getEmoji(pct)} {pct}%</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
