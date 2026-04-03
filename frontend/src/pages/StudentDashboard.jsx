import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const SUBJECTS = [
  { name:'tamil', display:'Tamil', icon:'🔤' },
  { name:'english', display:'English', icon:'📖' },
  { name:'maths', display:'Maths', icon:'🔢' },
  { name:'physics', display:'Physics', icon:'⚛️' },
  { name:'chemistry', display:'Chemistry', icon:'🧪' },
  { name:'computer_science', display:'Computer Science', icon:'💻' },
  { name:'biology', display:'Biology', icon:'🧬' },
]

const QUICK_LINKS = [
  { to:'/student/content', icon:'📚', title:'Study Content', desc:'View PDFs, videos & docs from teachers', color:'rgba(168,85,247,0.1)' },
  { to:'/student/ai', icon:'🤖', title:'AI Tools', desc:'Summary, Quiz & Doubt clarification', color:'rgba(124,58,237,0.1)' },
  { to:'/student/quizzes', icon:'📝', title:'Quizzes', desc:'Take teacher-posted quizzes', color:'rgba(232,121,249,0.1)' },
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const [mySubjects, setMySubjects] = useState([])

  useEffect(() => {
    api.get('/student/my-subjects').then(({ data }) => setMySubjects(data)).catch(() => setMySubjects([]))
  }, [])

  const toggleSubject = async (name) => {
    const enrolled = mySubjects.some(s => s.name === name)
    try {
      if (enrolled) {
        await api.post(`/student/unenroll/${name}`)
        setMySubjects(prev => prev.filter(s => s.name !== name))
      } else {
        await api.post(`/student/enroll/${name}`)
        setMySubjects(prev => [...prev, { name }])
      }
    } catch (err) { alert(err?.response?.data?.detail || 'Something went wrong') }
  }

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom:'32px' }}>
        <h1 className="section-title" style={{ marginBottom:'8px' }}>
          👋 Welcome back, {user?.full_name || 'Student'}
        </h1>
        <p style={{ color:'#64748b', fontSize:'0.9rem' }}>Choose subjects and start learning with AI-powered tools.</p>
      </div>

      {/* Subject Selection */}
      <div style={{ marginBottom:'36px' }}>
        <h2 style={{ color:'#94a3b8', fontSize:'0.75rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'14px' }}>
          My Subjects — click to enroll / unenroll
        </h2>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
          {SUBJECTS.map(s => {
            const enrolled = mySubjects.some(m => m.name === s.name)
            return (
              <button key={s.name} onClick={() => toggleSubject(s.name)} style={{
                padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.875rem', transition:'all 0.2s',
                background: enrolled ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
                color: enrolled ? '#c084fc' : '#64748b',
                border: enrolled ? '1px solid rgba(168,85,247,0.4)' : '1px solid #1e1030',
              }}>
                {s.icon} {s.display} {enrolled && '✓'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick Links */}
      <h2 style={{ color:'#94a3b8', fontSize:'0.75rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'14px' }}>Quick Access</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'14px' }}>
        {QUICK_LINKS.map(link => (
          <Link key={link.to} to={link.to} style={{ textDecoration:'none' }}>
            <div className="card-dark" style={{ padding:'22px', background:link.color, transition:'all 0.2s', cursor:'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='rgba(168,85,247,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='#1e1030' }}>
              <div style={{ fontSize:'1.8rem', marginBottom:'10px' }}>{link.icon}</div>
              <h3 style={{ color:'#e2e8f0', fontWeight:700, margin:'0 0 6px', fontSize:'1rem' }}>{link.title}</h3>
              <p style={{ color:'#64748b', fontSize:'0.8rem', margin:0 }}>{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
