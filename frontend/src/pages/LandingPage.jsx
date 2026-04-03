import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/* ── Animated Network Sphere using Canvas ── */
function NetworkSphere() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    // 3D sphere nodes
    const NODE_COUNT = 120
    const RADIUS = Math.min(W, H) * 0.28
    let nodes = Array.from({ length: NODE_COUNT }, () => {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      return {
        theta, phi,
        r: RADIUS * (0.85 + Math.random() * 0.15),
        speed: (Math.random() - 0.5) * 0.003,
        phiSpeed: (Math.random() - 0.5) * 0.002,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        pulseOffset: Math.random() * Math.PI * 2,
      }
    })

    // Particles drifting in space
    const PARTICLE_COUNT = 60
    let particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }))

    let rotY = 0, rotX = 0.2
    let t = 0

    const project = (x3, y3, z3) => {
      const cx = Math.cos(rotY), sx = Math.sin(rotY)
      const cy = Math.cos(rotX), sy = Math.sin(rotX)
      const x1 = cx * x3 + sx * z3
      const z1 = -sx * x3 + cx * z3
      const y2 = cy * y3 - sy * z1
      const z2 = sy * y3 + cy * z1
      const fov = 900
      const scale = fov / (fov + z2)
      return { x: W / 2 + x1 * scale, y: H / 2 + y2 * scale, z: z2, scale }
    }

    const sphereXYZ = (n) => ({
      x: n.r * Math.sin(n.phi) * Math.cos(n.theta),
      y: n.r * Math.sin(n.phi) * Math.sin(n.theta),
      z: n.r * Math.cos(n.phi),
    })

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Deep space background gradient
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7)
      bg.addColorStop(0, 'rgba(20,5,40,1)')
      bg.addColorStop(0.5, 'rgba(10,3,25,1)')
      bg.addColorStop(1, 'rgba(5,0,12,1)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Ambient glow at center
      const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, RADIUS * 1.2)
      glow.addColorStop(0, 'rgba(168,85,247,0.08)')
      glow.addColorStop(0.5, 'rgba(124,58,237,0.04)')
      glow.addColorStop(1, 'rgba(168,85,247,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      // Drift particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,160,255,${p.opacity})`
        ctx.fill()
      })

      // Animate node positions
      nodes.forEach(n => {
        n.theta += n.speed
        n.phi += n.phiSpeed
        if (n.phi < 0.1) n.phi = 0.1
        if (n.phi > Math.PI - 0.1) n.phi = Math.PI - 0.1
      })
      rotY += 0.003

      // Project all nodes
      const projected = nodes.map(n => {
        const xyz = sphereXYZ(n)
        const p = project(xyz.x, xyz.y, xyz.z)
        return { ...p, n }
      })

      // Draw connections (lines between nearby nodes)
      const MAX_DIST = RADIUS * 0.55
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i], b = projected[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.35 *
              Math.min(a.scale, b.scale) *
              ((a.n.opacity + b.n.opacity) / 2)
            const pulse = 0.7 + 0.3 * Math.sin(t * 0.02 + i * 0.1)
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(168,85,247,${alpha * pulse})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      projected.forEach(({ x, y, z, scale, n }) => {
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.03 + n.pulseOffset)
        const depth = (z + RADIUS) / (2 * RADIUS)
        const alpha = n.opacity * scale * pulse * (0.4 + depth * 0.6)
        const size = n.size * scale

        // Glow
        if (size > 1.5) {
          const grd = ctx.createRadialGradient(x, y, 0, x, y, size * 5)
          grd.addColorStop(0, `rgba(232,121,249,${alpha * 0.5})`)
          grd.addColorStop(1, 'rgba(232,121,249,0)')
          ctx.beginPath()
          ctx.arc(x, y, size * 5, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }

        // Node dot
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        const color = depth > 0.6
          ? `rgba(232,121,249,${alpha})`
          : `rgba(168,85,247,${alpha})`
        ctx.fillStyle = color
        ctx.fill()
      })

      t++
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
  )
}

/* ── Feature Card ── */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div
      className="card-dark p-6 rounded-2xl"
      style={{
        animation: `fadeUp 0.6s ease forwards`,
        animationDelay: delay,
        opacity: 0,
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', color: '#a855f7', marginBottom: '8px', letterSpacing: '0.06em' }}>
        {title}
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#050508', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Animated background sphere */}
      <NetworkSphere />

      {/* Content overlay */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Navbar ── */}
        <nav style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 48px',
          background: 'rgba(5,5,8,0.6)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(168,85,247,0.15)',
          animation: 'slideDown 0.6s ease forwards',
        }}>
          <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.4rem', color: '#a855f7', letterSpacing: '0.1em' }}>
            EDU<span style={{ color: '#e879f9' }}>AI</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/login">
              <button className="btn-outline" style={{ padding: '8px 24px', fontSize: '0.875rem' }}>
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="btn-purple" style={{ padding: '8px 24px', fontSize: '0.875rem' }}>
                Register
              </button>
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
          <div
            className="badge"
            style={{
              background: 'rgba(168,85,247,0.15)', color: '#c084fc',
              border: '1px solid rgba(168,85,247,0.3)',
              display: 'inline-block', marginBottom: '24px',
              animation: 'fadeIn 0.8s ease forwards',
            }}
          >
            🎓 Final Year Project — EduAI
          </div>

          <h1 style={{
            fontFamily: 'Orbitron', fontWeight: 900,
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            lineHeight: 1.15,
            background: 'linear-gradient(135deg, #e2e8f0 0%, #a855f7 50%, #e879f9 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '24px',
            animation: 'fadeUp 0.8s ease 0.2s forwards', opacity: 0,
          }}>
            The Intelligent<br />Learning Platform
          </h1>

          <p style={{
            color: '#94a3b8', fontSize: '1.15rem', lineHeight: 1.7,
            maxWidth: '560px', margin: '0 auto 40px',
            animation: 'fadeUp 0.8s ease 0.4s forwards', opacity: 0,
          }}>
            Where teachers share knowledge and students learn smarter —
            powered by <span style={{ color: '#a855f7' }}>AI-driven</span> summaries,
            quizzes and doubt clarification.
          </p>

          <div style={{
            display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap',
            animation: 'fadeUp 0.8s ease 0.6s forwards', opacity: 0,
          }}>
            <Link to="/register">
              <button className="btn-purple" style={{ padding: '14px 36px', fontSize: '1rem' }}>
                Register →
              </button>
            </Link>
            <Link to="/login">
              <button className="btn-outline" style={{ padding: '14px 36px', fontSize: '1rem' }}>
                Login
              </button>
            </Link>
          </div>
        </div>
        
        {/* ── Features Grid ── */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
          <h2 style={{
            fontFamily: 'Orbitron', textAlign: 'center', fontSize: '1.2rem',
            color: '#94a3b8', letterSpacing: '0.15em', marginBottom: '40px',
            textTransform: 'uppercase',
          }}>
            Everything You Need
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <FeatureCard icon="📚" title="Teacher Portal" desc="Upload PDFs, videos, YouTube links, and documents for each subject. Manage quizzes and post student results." delay="0.1s" />
            <FeatureCard icon="🎓" title="Student Dashboard" desc="Access all subject content shared by your teachers. Track your quizzes and results in one place." delay="0.2s" />
            <FeatureCard icon="🧠" title="SummaryAI" desc="Upload any document or video and get an intelligent AI summary to review key concepts quickly." delay="0.3s" />
            <FeatureCard icon="📝" title="QuizGenerationAI" desc="Auto-generate quizzes from any content. Submit answers and get instant feedback with explanations." delay="0.4s" />
            <FeatureCard icon="💬" title="DoubtClarifyingAI" desc="Ask any doubt and get clear answers with theory, real examples, and practical explanations." delay="0.5s" />
            <FeatureCard icon="🏆" title="Private Results" desc="Teachers post test scores privately. Students see only their own marks — keeping everyone comfortable." delay="0.6s" />
          </div>
        </div>

        {/* ── Footer ── */}
        <footer style={{
          textAlign: 'center', padding: '32px 24px',
          borderTop: '1px solid rgba(168,85,247,0.1)',
          color: '#475569', fontSize: '0.8rem',
        }}>
          <span style={{ fontFamily: 'Orbitron', color: '#7c3aed', letterSpacing: '0.1em' }}>EDUAI</span>
          &nbsp;·&nbsp; Built with 💜 for Students
        </footer>
      </div>
    </div>
  )
}