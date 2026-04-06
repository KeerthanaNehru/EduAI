import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SUBJECTS = ['tamil','english','maths','physics','chemistry','computer_science','biology']

export default function Register() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole]         = useState('student')
  const [subject, setSubject]   = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('Please enter your full name.'); return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    if (role === 'teacher' && !subject) {
      setError('Please select your subject.'); return
    }

    setLoading(true)
    try {
      const user = await register({
        email:     email.trim(),
        password,
        full_name: fullName.trim(),
        role,
        subject:   role === 'teacher' ? subject : null,
        roll_number: role === 'student' ? rollNumber.trim() : null,
      })
      // Go straight to dashboard after registration
      navigate(user.role === 'teacher' ? '/teacher' : '/student')
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Registration failed. Please check your details and try again.'
      setError(msg)
    } finally {
      // Always resets — button never stays frozen
      setLoading(false)
    }
  }

  const lbl = {
    display: 'block', color: '#c4b5fd',
    fontSize: '1rem', fontWeight: 600,
    marginBottom: '8px', letterSpacing: '0.03em',
  }
  const field = { marginBottom: '20px' }
  const inputStyle = { fontSize: '1rem', padding: '13px 16px' }

  return (
    <div style={{
      minHeight: '100vh', background: '#050508',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '480px' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontFamily: 'Orbitron', fontWeight: 900, fontSize: '2.2rem',
              color: '#a855f7', margin: 0, letterSpacing: '0.1em',
            }}>
              EDU<span style={{ color: '#e879f9' }}>AI</span>
            </h1>
          </Link>
          <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '1.05rem' }}>
            Create your account
          </p>
        </div>

        <div className="card-dark" style={{ padding: '36px', borderRadius: '20px' }}>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5', borderRadius: '10px',
              padding: '14px 16px', fontSize: '0.95rem',
              marginBottom: '22px', lineHeight: 1.6,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <div style={field}>
              <label style={lbl}>Full Name</label>
              <input
                className="input-dark" style={inputStyle}
                placeholder="e.g. Keerthana S"
                value={fullName} onChange={e => setFullName(e.target.value)}
                autoComplete="name" required
              />
            </div>

            <div style={field}>
              <label style={lbl}>Email Address</label>
              <input
                type="email" className="input-dark" style={inputStyle}
                placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" required
              />
            </div>

            <div style={field}>
              <label style={lbl}>Password</label>
              <input
                type="password" className="input-dark" style={inputStyle}
                placeholder="Minimum 6 characters"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="new-password" required
              />
            </div>

            <div style={field}>
              <label style={lbl}>I am a</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['student', 'teacher'].map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)} style={{
                    flex: 1, padding: '13px 10px', borderRadius: '10px',
                    border:     role === r ? '1.5px solid #a855f7' : '1px solid #1e1030',
                    background: role === r ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.03)',
                    color:      role === r ? '#d8b4fe' : '#64748b',
                    fontFamily: 'Syne, sans-serif', fontWeight: 700,
                    fontSize: '1rem', cursor: 'pointer',
                    textTransform: 'capitalize', transition: 'all 0.2s',
                  }}>
                    {r === 'student' ? '🎓' : '👩‍🏫'} {r}
                  </button>
                ))}
              </div>
            </div>

            {role === 'teacher' && (
              <div style={field}>
                <label style={lbl}>Your Subject</label>
                <select
                  className="input-dark" style={{ ...inputStyle, cursor: 'pointer' }}
                  value={subject} onChange={e => setSubject(e.target.value)} required
                >
                  <option value="">— Select your subject —</option>
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {role === 'student' && (
              <div style={field}>
                <label style={lbl}>Roll Number / Student ID</label>
                <input
                  className="input-dark" style={inputStyle}
                  placeholder="e.g. 2024-MECH-001"
                  value={rollNumber} onChange={e => setRollNumber(e.target.value)}
                  required
                />
              </div>
            )}

            <button
              type="submit" className="btn-purple" disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '6px' }}
            >
              {loading ? '⏳ Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.95rem', marginTop: '22px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a855f7', fontWeight: 700, textDecoration: 'none' }}>
              Login here
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '18px' }}>
          <Link to="/" style={{ color: '#475569', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}