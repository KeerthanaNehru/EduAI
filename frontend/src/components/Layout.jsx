import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const handleLogout = () => { logout(); navigate('/login') }

  const navLinks = user?.role === 'student' ? [
    { to:'/student', label:'Dashboard', icon:'⚡' },
    { to:'/student/content', label:'Content', icon:'📚' },
    { to:'/student/ai', label:'AI Tools', icon:'🤖' },
    { to:'/student/quizzes', label:'Quizzes', icon:'📝' },
    { to:'/student/results', label:'Results', icon:'🏆' },
  ] : []

  const isActive = (to) => to === '/student' ? location.pathname === '/student' : location.pathname.startsWith(to)

  return (
    <div style={{ minHeight:'100vh', background:'#050508', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <header style={{ background:'rgba(13,13,26,0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(168,85,247,0.15)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link to={user?.role==='teacher'?'/teacher':'/student'} style={{ textDecoration:'none', fontFamily:'Orbitron', fontWeight:900, fontSize:'1.2rem', color:'#a855f7', letterSpacing:'0.1em' }}>
            EDU<span style={{ color:'#e879f9' }}>AI</span>
          </Link>

          <nav style={{ display:'flex', alignItems:'center', gap:'4px' }}>
            {user?.role === 'teacher' && (
              <span style={{ color:'#7c3aed', fontSize:'0.8rem', marginRight:'12px', background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.2)', padding:'4px 12px', borderRadius:'999px' }}>
                👩‍🏫 {user.subject?.replace('_',' ')} Teacher
              </span>
            )}
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                textDecoration:'none', padding:'6px 14px', borderRadius:'8px', fontSize:'0.875rem', fontWeight:600, transition:'all 0.2s',
                background: isActive(link.to) ? 'rgba(168,85,247,0.2)' : 'transparent',
                color: isActive(link.to) ? '#c084fc' : '#64748b',
                border: isActive(link.to) ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent',
              }}>
                {link.icon} {link.label}
              </Link>
            ))}
            <button onClick={handleLogout} style={{ marginLeft:'8px', padding:'6px 16px', background:'transparent', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'8px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'Syne,sans-serif', fontWeight:600, transition:'all 0.2s' }}
              onMouseEnter={e=>{ e.target.style.background='rgba(239,68,68,0.1)' }}
              onMouseLeave={e=>{ e.target.style.background='transparent' }}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex:1, maxWidth:'1200px', width:'100%', margin:'0 auto', padding:'32px 24px' }}>
        {children}
      </main>
    </div>
  )
}
