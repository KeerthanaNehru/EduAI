import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/quiz/available')
      .then(({ data }) => setQuizzes(data))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false))
  }, [])

  const startQuiz = (quiz) => { setActiveQuiz(quiz); setAnswers({}); setSubmitted(null) }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const answersByQId = {}
      activeQuiz.questions.forEach((q, i) => {
        if (answers[i] !== undefined) answersByQId[String(q.id)] = answers[i]
      })
      const { data } = await api.post('/quiz/submit', {
        quiz_id: activeQuiz.id,
        answers: answersByQId,
      })
      setSubmitted(data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Submission failed.')
    }
    setSubmitting(false)
  }

  if (activeQuiz) return (
    <div>
      <button onClick={() => setActiveQuiz(null)} style={{
        background:'none', border:'none', color:'#a855f7', cursor:'pointer',
        fontFamily:'Syne,sans-serif', fontSize:'1rem', marginBottom:'24px', padding:0,
      }}>← Back to Quizzes</button>

      <h1 className="section-title" style={{ marginBottom:'6px' }}>{activeQuiz.title}</h1>
      <p style={{ color:'#94a3b8', fontSize:'1rem', marginBottom:'28px' }}>
        Subject: <strong style={{ color:'#a855f7' }}>{activeQuiz.subject?.replace('_',' ')}</strong>
        &nbsp;·&nbsp; {activeQuiz.questions?.length} questions
      </p>

      {submitted ? (
        <div className="card-dark" style={{ padding:'48px', textAlign:'center' }}>
          <p style={{ fontFamily:'Orbitron', fontSize:'2.5rem', color:'#a855f7', margin:'0 0 12px' }}>
            {submitted.score} / {submitted.total}
          </p>
          <p style={{ fontSize:'1.2rem', fontWeight:700, color: submitted.score >= submitted.total/2 ? '#4ade80' : '#f87171' }}>
            {submitted.score === submitted.total ? '🎉 Perfect Score!' :
             submitted.score >= submitted.total/2 ? '👍 Good job!' : '💪 Keep studying!'}
          </p>
          <button className="btn-purple" onClick={() => setActiveQuiz(null)} style={{ marginTop:'24px', padding:'12px 32px', fontSize:'1rem' }}>
            Back to Quizzes
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display:'grid', gap:'16px', marginBottom:'24px' }}>
            {(activeQuiz.questions || []).map((q, i) => (
              <div key={q.id || i} className="card-dark" style={{ padding:'24px' }}>
                <p style={{ color:'#e2e8f0', fontWeight:700, fontSize:'1.1rem', marginBottom:'16px' }}>
                  {i+1}. {q.question_text}
                </p>
                <div style={{ display:'grid', gap:'10px' }}>
                  {(q.options || []).map((opt, j) => {
                    const letter = String.fromCharCode(65+j)
                    const sel = answers[i] === letter
                    return (
                      <label key={j} style={{
                        display:'flex', alignItems:'center', gap:'12px',
                        padding:'12px 18px', borderRadius:'10px', cursor:'pointer',
                        background: sel ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                        border: sel ? '1px solid rgba(168,85,247,0.5)' : '1px solid #1e1030',
                        transition:'all 0.2s',
                      }}>
                        <input type="radio" name={`q${i}`}
                          onChange={() => setAnswers(p => ({...p, [i]: letter}))}
                          checked={sel} style={{ accentColor:'#a855f7', width:'18px', height:'18px' }}
                        />
                        <span style={{ color: sel ? '#d8b4fe' : '#e2e8f0', fontSize:'1rem' }}>
                          <strong style={{ color: sel ? '#a855f7' : '#64748b', marginRight:'8px' }}>{letter}.</strong>
                          {opt}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <button className="btn-purple" onClick={handleSubmit} disabled={submitting}
            style={{ padding:'13px 36px', fontSize:'1.05rem' }}>
            {submitting ? '⏳ Submitting...' : '✅ Submit Quiz'}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom:'8px' }}>📝 Teacher Quizzes</h1>
      <p style={{ color:'#94a3b8', fontSize:'1rem', marginBottom:'28px' }}>Quizzes posted by your teachers — test your knowledge!</p>

      {loading && <p style={{ color:'#94a3b8', fontSize:'1rem' }}>Loading quizzes...</p>}

      {!loading && quizzes.length === 0 && (
        <div className="card-dark" style={{ padding:'56px', textAlign:'center' }}>
          <div style={{ fontSize:'3.5rem', marginBottom:'16px' }}>📭</div>
          <p style={{ color:'#94a3b8', fontSize:'1.1rem' }}>No quizzes posted yet.</p>
          <p style={{ color:'#64748b', fontSize:'0.95rem', marginTop:'8px' }}>Check back later!</p>
        </div>
      )}

      <div style={{ display:'grid', gap:'16px' }}>
        {quizzes.map(q => (
          <div key={q.id} className="card-dark" style={{ padding:'24px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'20px' }}>
            <div>
              <h3 style={{ margin:'0 0 8px', color:'#e2e8f0', fontWeight:700, fontSize:'1.2rem' }}>{q.title}</h3>
              <p style={{ margin:0, color:'#94a3b8', fontSize:'0.95rem' }}>
                <span style={{ background:'rgba(168,85,247,0.1)', color:'#a855f7', padding:'3px 10px', borderRadius:'4px', marginRight:'10px', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase' }}>
                  {q.subject?.replace('_',' ')}
                </span>
                {(q.questions || []).length} questions
              </p>
              {q.description && <p style={{ margin:'8px 0 0', color:'#64748b', fontSize:'0.95rem' }}>{q.description}</p>}
            </div>
            <button className="btn-purple" onClick={() => startQuiz(q)}
              style={{ padding:'11px 28px', fontSize:'1rem', whiteSpace:'nowrap' }}>
              Start Quiz →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}