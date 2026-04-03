import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

const TAB_INFO = {
  summary: { icon:'🧠', label:'SummaryAI', desc:'Get an AI-generated summary of any content' },
  quiz:    { icon:'📝', label:'QuizGenerationAI', desc:'Test your knowledge with AI-generated quizzes' },
  doubt:   { icon:'💬', label:'DoubtClarifyingAI', desc:'Chat with AI to clarify your doubts (conversational)' },
}

export default function StudentAI() {
  const [contents, setContents] = useState([])
  const [activeAI, setActiveAI] = useState('summary')
  const [contentId, setContentId] = useState('')
  const [loading, setLoading] = useState(false)

  // Summary
  const [summary, setSummary] = useState('')

  // Quiz
  const [quizQuestions, setQuizQuestions] = useState([])
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizVerified, setQuizVerified] = useState(null)
  const [quizData, setQuizData] = useState(null)

  // Doubt — conversational chat
  const [chatHistory, setChatHistory] = useState([])
  const [doubt, setDoubt] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    Promise.all(['maths','physics','chemistry','english','tamil','biology','computer_science']
      .map(s => api.get(`/content/student/subject/${s}`)))
      .then(res => setContents(res.flatMap(r => r.data)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [chatHistory])

  // Reset state when switching AI tool
  const switchAI = (tool) => {
    setActiveAI(tool); setSummary(''); setQuizQuestions([]); setQuizVerified(null); setQuizData(null); setQuizAnswers({})
    // Don't reset chat — let it persist per content
  }

  const handleSummary = async () => {
    if (!contentId) return; setLoading(true); setSummary('')
    try {
      const { data } = await api.post('/ai/summary', { content_id: parseInt(contentId) })
      setSummary(data.summary)
    } catch (err) { setSummary(`Error: ${err.response?.data?.detail || 'Failed. Try again.'}`) }
    setLoading(false)
  }

  const handleQuizGen = async () => {
    if (!contentId) return; setLoading(true); setQuizVerified(null); setQuizAnswers({}); setQuizQuestions([])
    try {
      const { data } = await api.post('/ai/quiz/generate', { content_id: parseInt(contentId), num_questions: 5 })
      setQuizQuestions(data.questions || []); setQuizData(data)
    } catch (err) { alert(err.response?.data?.detail || 'Quiz generation failed.') }
    setLoading(false)
  }

  const handleQuizVerify = async () => {
    if (!quizData) return; setLoading(true)
    try {
      const { data } = await api.post('/ai/quiz/verify', { content_id: parseInt(contentId), questions: quizData.questions, answers: quizAnswers })
      setQuizVerified(data)
    } catch (err) { alert('Verification failed.') }
    setLoading(false)
  }

  const handleDoubt = async () => {
    if (!contentId || !doubt.trim()) return
    const userMsg = doubt.trim(); setDoubt(''); setLoading(true)
    setChatHistory(prev => [...prev, { role:'user', text: userMsg }])
    try {
      const { data } = await api.post('/ai/doubt', { content_id: parseInt(contentId), doubt: userMsg })
      setChatHistory(prev => [...prev, { role:'ai', text: data.clarification }])
    } catch (err) {
      setChatHistory(prev => [...prev, { role:'ai', text: `Sorry, I couldn't answer that. ${err.response?.data?.detail || 'Please try again.'}`, error: true }])
    }
    setLoading(false)
  }

  const cardStyle = { padding:'24px', background:'#0d0d1a', border:'1px solid #1e1030', borderRadius:'14px' }
  const selectedContent = contents.find(c => String(c.id) === String(contentId))

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom:'6px' }}>🤖 AI Study Tools</h1>
      <p style={{ color:'#64748b', fontSize:'0.875rem', marginBottom:'24px' }}>Powered by Groq Llama — Fast AI for smarter learning</p>

      {/* AI Tab Switcher */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'24px', flexWrap:'wrap' }}>
        {Object.entries(TAB_INFO).map(([key, info]) => (
          <button key={key} onClick={() => switchAI(key)}
            style={{
              padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.875rem', transition:'all 0.2s',
              background: activeAI===key ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
              color: activeAI===key ? '#c084fc' : '#64748b',
              border: activeAI===key ? '1px solid rgba(168,85,247,0.4)' : '1px solid #1e1030',
            }}>
            {info.icon} {info.label}
          </button>
        ))}
      </div>

      <p style={{ color:'#64748b', fontSize:'0.8rem', marginBottom:'20px' }}>{TAB_INFO[activeAI].desc}</p>

      {/* Content Selector */}
      <div style={{ marginBottom:'24px' }}>
        <label style={{ display:'block', color:'#94a3b8', fontSize:'0.75rem', marginBottom:'8px', letterSpacing:'0.08em', textTransform:'uppercase' }}>Select Content to Analyse</label>
        <select className="input-dark" value={contentId} onChange={e => { setContentId(e.target.value); setChatHistory([]) }} style={{ maxWidth:'500px', cursor:'pointer' }}>
          <option value="">Choose a file or content...</option>
          {contents.map(c => <option key={c.id} value={c.id}>{c.title} [{c.content_type} — {c.subject.replace('_',' ')}]</option>)}
        </select>
      </div>

      {/* ── SUMMARY AI ── */}
      {activeAI === 'summary' && (
        <div>
          <button className="btn-purple" onClick={handleSummary} disabled={loading || !contentId}>
            {loading ? '⏳ Summarising...' : '🧠 Generate Summary'}
          </button>
          {summary && (
            <div style={{ ...cardStyle, marginTop:'20px' }}>
              <h3 style={{ color:'#a855f7', fontFamily:'Orbitron', fontSize:'0.9rem', marginBottom:'14px', letterSpacing:'0.06em' }}>
                Summary — {selectedContent?.title}
              </h3>
              <div style={{ color:'#e2e8f0', lineHeight:1.8, whiteSpace:'pre-wrap', fontSize:'0.9rem' }}>{summary}</div>
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ AI ── */}
      {activeAI === 'quiz' && (
        <div>
          <button className="btn-purple" onClick={handleQuizGen} disabled={loading || !contentId}>
            {loading && !quizQuestions.length ? '⏳ Generating...' : '📝 Generate Quiz (5 Questions)'}
          </button>
          {quizQuestions.length > 0 && (
            <div style={{ marginTop:'20px' }}>
              <h3 style={{ color:'#94a3b8', fontSize:'0.8rem', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'16px' }}>
                Quiz — {selectedContent?.title}
              </h3>
              <div style={{ display:'grid', gap:'14px' }}>
                {quizQuestions.map((q, i) => (
                  <div key={i} style={cardStyle}>
                    <p style={{ color:'#e2e8f0', fontWeight:600, marginBottom:'14px' }}>{i+1}. {q.question_text}</p>
                    <div style={{ display:'grid', gap:'8px' }}>
                      {(q.options||[]).map((opt, j) => {
                        const letter = String.fromCharCode(65+j)
                        const isSelected = quizAnswers[i] === letter
                        const isCorrect = quizVerified && quizVerified.results?.[i]?.correct
                        const isWrong = quizVerified && !quizVerified.results?.[i]?.correct && isSelected
                        return (
                          <label key={j} style={{
                            display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', borderRadius:'8px', cursor: quizVerified ? 'default' : 'pointer',
                            background: isCorrect && isSelected ? 'rgba(34,197,94,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : isSelected ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
                            border: isCorrect && isSelected ? '1px solid rgba(34,197,94,0.4)' : isWrong ? '1px solid rgba(239,68,68,0.3)' : isSelected ? '1px solid rgba(168,85,247,0.3)' : '1px solid #1e1030',
                          }}>
                            <input type="radio" name={`q${i}`} value={opt} disabled={!!quizVerified}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, [i]: letter }))}
                              checked={isSelected} style={{ accentColor:'#a855f7' }} />
                            <span style={{ color: isCorrect&&isSelected ? '#4ade80' : isWrong ? '#f87171' : '#e2e8f0', fontSize:'0.9rem' }}>{opt}</span>
                          </label>
                        )
                      })}
                    </div>
                    {quizVerified && (
                      <div style={{ marginTop:'10px', padding:'8px 12px', borderRadius:'8px', background: quizVerified.results?.[i]?.correct ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', fontSize:'0.8rem', color: quizVerified.results?.[i]?.correct ? '#4ade80' : '#f87171' }}>
                        {quizVerified.results?.[i]?.correct ? '✅ Correct! Well done!' : `❌ ${quizVerified.results?.[i]?.message}`}
                        <p style={{ color:'#94a3b8', marginTop:'4px' }}>{quizVerified.results?.[i]?.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {!quizVerified && (
                <button className="btn-purple" onClick={handleQuizVerify} disabled={loading} style={{ marginTop:'16px' }}>
                  {loading ? '⏳ Checking...' : '✅ Submit Answers'}
                </button>
              )}
              {quizVerified && (
                <div style={{ ...cardStyle, marginTop:'16px', background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.3)', textAlign:'center' }}>
                  <p style={{ fontFamily:'Orbitron', fontSize:'1.5rem', color:'#c084fc', margin:0 }}>
                    {quizVerified.score} / {quizVerified.total}
                  </p>
                  <p style={{ color: quizVerified.score === quizVerified.total ? '#4ade80' : quizVerified.score >= quizVerified.total/2 ? '#fbbf24' : '#f87171', marginTop:'8px', fontWeight:600 }}>
                    {quizVerified.score === quizVerified.total ? '🎉 Perfect Score! Amazing!' : quizVerified.score >= quizVerified.total/2 ? '👍 Good work! Keep it up!' : '💪 Keep studying — you\'ve got this!'}
                  </p>
                  <button className="btn-outline" onClick={() => { setQuizVerified(null); setQuizAnswers({}) }} style={{ marginTop:'12px', fontSize:'0.8rem' }}>Try Again</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── DOUBT AI — Conversational Chat ── */}
      {activeAI === 'doubt' && (
        <div>
          {!contentId && <p style={{ color:'#64748b', fontSize:'0.875rem' }}>👆 Please select a content above to start chatting.</p>}
          {contentId && (
            <div>
              {/* Chat window */}
              <div style={{ ...cardStyle, minHeight:'300px', maxHeight:'440px', overflowY:'auto', marginBottom:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
                {chatHistory.length === 0 && (
                  <div style={{ textAlign:'center', color:'#475569', padding:'40px 20px' }}>
                    <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>💬</div>
                    <p style={{ margin:0 }}>Ask any doubt about <strong style={{ color:'#7c3aed' }}>{selectedContent?.title}</strong></p>
                    <p style={{ margin:'6px 0 0', fontSize:'0.8rem' }}>I'll explain with theory, examples, and practical context!</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ display:'flex', justifyContent: msg.role==='user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth:'80%', padding:'12px 16px', borderRadius: msg.role==='user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: msg.role==='user' ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : msg.error ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)',
                      border: msg.role==='ai' ? (msg.error ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(168,85,247,0.15)') : 'none',
                      color: msg.role==='user' ? 'white' : msg.error ? '#f87171' : '#e2e8f0',
                      fontSize:'0.875rem', lineHeight:1.7, whiteSpace:'pre-wrap',
                    }}>
                      {msg.role === 'ai' && <span style={{ fontSize:'0.7rem', color:'#7c3aed', display:'block', marginBottom:'6px', fontFamily:'Orbitron', letterSpacing:'0.08em' }}>◆ EDUAI</span>}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display:'flex', justifyContent:'flex-start' }}>
                    <div style={{ padding:'12px 16px', borderRadius:'14px 14px 14px 4px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(168,85,247,0.15)', color:'#7c3aed', fontSize:'0.875rem' }}>
                      ◆ Thinking...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ display:'flex', gap:'10px' }}>
                <textarea
                  className="input-dark" value={doubt} onChange={e => setDoubt(e.target.value)}
                  placeholder="Ask your doubt here... (e.g. Can you explain this concept with an example?)"
                  rows={2} style={{ flex:1, resize:'none', padding:'12px 16px' }}
                  onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleDoubt() } }}
                />
                <button className="btn-purple" onClick={handleDoubt} disabled={loading || !doubt.trim()} style={{ padding:'12px 20px', alignSelf:'flex-end' }}>
                  Send →
                </button>
              </div>
              <p style={{ color:'#334155', fontSize:'0.75rem', marginTop:'6px' }}>Press Enter to send · Shift+Enter for new line</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
