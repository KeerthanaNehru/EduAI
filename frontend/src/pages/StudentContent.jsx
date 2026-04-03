import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'

const SUBJECTS = ['tamil','english','maths','physics','chemistry','computer_science','biology']
const ICONS = { pdf:'📄', document:'📃', video:'🎬', audio:'🎵', youtube:'▶️' }
const SUBJECT_ICONS = { tamil:'🔤', english:'📖', maths:'🔢', physics:'⚛️', chemistry:'🧪', computer_science:'💻', biology:'🧬' }

export default function StudentContent() {
  const { subject } = useParams()
  const [selected, setSelected] = useState(subject || 'maths')
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (subject) setSelected(subject) }, [subject])
  useEffect(() => {
    setLoading(true)
    api.get(`/content/student/subject/${selected}`)
      .then(({ data }) => setContents(data))
      .catch(() => setContents([]))
      .finally(() => setLoading(false))
  }, [selected])

  const openFile = (c) => {
    if (c.url) { window.open(c.url, '_blank'); return }
    if (c.file_path) {
      const token = localStorage.getItem('token')
      fetch(`/api/content/file/${c.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => { if (!r.ok) throw new Error('Not found'); return r.blob() })
        .then(blob => window.open(URL.createObjectURL(blob), '_blank'))
        .catch(() => alert('Could not open file. Make sure the backend is running.'))
    }
  }

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom:'8px' }}>📚 Study Content</h1>
      <p style={{ color:'#94a3b8', fontSize:'1rem', marginBottom:'28px' }}>Select a subject to view content uploaded by your teacher</p>

      <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'32px' }}>
        {SUBJECTS.map(s => (
          <button key={s} onClick={() => setSelected(s)} style={{
            padding:'10px 20px', borderRadius:'10px', fontSize:'1rem', fontWeight:600,
            cursor:'pointer', transition:'all 0.2s', fontFamily:'Syne,sans-serif',
            background: selected===s ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
            color: selected===s ? '#c084fc' : '#94a3b8',
            border: selected===s ? '1px solid rgba(168,85,247,0.4)' : '1px solid #1e1030',
          }}>
            {SUBJECT_ICONS[s]} {s.replace('_',' ')}
          </button>
        ))}
      </div>

      {loading && <p style={{ color:'#94a3b8', fontSize:'1rem' }}>Loading content...</p>}

      <div style={{ display:'grid', gap:'16px' }}>
        {!loading && contents.length === 0 && (
          <div className="card-dark" style={{ padding:'48px', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'16px' }}>📭</div>
            <p style={{ color:'#94a3b8', fontSize:'1.1rem' }}>No content for <strong style={{ color:'#a855f7' }}>{selected.replace('_',' ')}</strong> yet.</p>
            <p style={{ color:'#64748b', fontSize:'0.95rem', marginTop:'8px' }}>Your teacher will upload materials soon.</p>
          </div>
        )}
        {contents.map(c => (
          <div key={c.id} className="card-dark" style={{ padding:'22px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'18px', flex:1 }}>
              <span style={{ fontSize:'2.2rem' }}>{ICONS[c.content_type] || '📁'}</span>
              <div>
                <h3 style={{ margin:0, color:'#e2e8f0', fontSize:'1.15rem', fontWeight:700 }}>{c.title}</h3>
                <p style={{ margin:'6px 0 0', color:'#64748b', fontSize:'0.9rem' }}>
                  <span style={{ background:'rgba(168,85,247,0.1)', color:'#a855f7', padding:'3px 10px', borderRadius:'4px', marginRight:'10px', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase' }}>
                    {c.content_type}
                  </span>
                  {c.subject.replace('_',' ')}
                </p>
                {c.description && <p style={{ margin:'8px 0 0', color:'#94a3b8', fontSize:'0.95rem' }}>{c.description}</p>}
              </div>
            </div>
            <button onClick={() => openFile(c)} className="btn-purple" style={{ padding:'10px 24px', fontSize:'1rem', whiteSpace:'nowrap' }}>
              {c.content_type === 'youtube' ? '▶ Watch' : '📂 Open'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}