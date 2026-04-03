import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'teacher' ? '/teacher' : '/student')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your email and password.')
    }
    setLoading(false)
  }

  const lbl = {
    display: 'block',
    color: '#c4b5fd',        // ✅ brighter, more readable
    fontSize: '0.95rem',     // ✅ increased from 0.75rem
    fontWeight: 600,
    marginBottom: '8px',
    letterSpacing: '0.04em',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#050508',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
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
            Login to your account
          </p>
        </div>

        {/* Card */}
        <div className="card-dark" style={{ padding: '40px', borderRadius: '20px' }}>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
              color: '#fca5a5', borderRadius: '10px', padding: '14px 16px',
              fontSize: '0.95rem', marginBottom: '22px', lineHeight: 1.5,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Email Address</label>
              <input
                type="email"
                className="input-dark"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ fontSize: '1rem', padding: '12px 16px' }}
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={lbl}>Password</label>
              <input
                type="password"
                className="input-dark"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ fontSize: '1rem', padding: '12px 16px' }}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-purple"
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
            >
              {loading ? '⏳ Logging in...' : 'Login →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.95rem', marginTop: '22px' }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#a855f7', fontWeight: 700, textDecoration: 'none' }}>
              Register here
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
