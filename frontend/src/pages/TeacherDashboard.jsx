import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { key:'content', icon:'📁', label:'Upload Content' },
  { key:'quiz', icon:'📝', label:'Post Quiz' },
  { key:'results', icon:'🏆', label:'Post Results' },
]
const CONTENT_TYPES = ['document','pdf','video','audio','youtube']
const CONTENT_ICONS = { document:'📃', pdf:'📄', video:'🎬', audio:'🎵', youtube:'▶️' }

const inp = { marginBottom:'14px' }
const lbl = { display:'block', color:'#94a3b8', fontSize:'0.72rem', marginBottom:'6px', letterSpacing:'0.08em', textTransform:'uppercase' }

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('content')
  const [contents, setContents] = useState([])
  const [quizzes, setQuizzes] = useState([])

  // Upload
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contentType, setContentType] = useState('pdf')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Quiz
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDesc, setQuizDesc] = useState('')
  const [questions, setQuestions] = useState([{ question_text:'', options:['','','',''], correct_answer:'A' }])
  const [postingQuiz, setPostingQuiz] = useState(false)

  // Results
  const [resultTestName, setResultTestName] = useState('')
  const [resultTotal, setResultTotal] = useState('')
  const [registeredStudents, setRegisteredStudents] = useState([])
  const [studentMarks, setStudentMarks] = useState({}) // { studentId: { marks: '', feedback: '' } }
  const [postingResult, setPostingResult] = useState(false)
  const [resultSuccess, setResultSuccess] = useState(false)

  const loadContent = async () => { try { const { data } = await api.get('/content/teacher/my'); setContents(data) } catch {} }
  const loadQuizzes = async () => { try { const { data } = await api.get('/quiz/teacher/my'); setQuizzes(data) } catch {} }

  useEffect(() => { loadContent(); loadQuizzes() }, [])

  useEffect(() => {
    if (activeTab === 'results') {
      const fetchStudents = async () => {
        try {
          const { data } = await api.get('/results/students')
          setRegisteredStudents(data)
          // Initialize marks state for each student if not already present
          const initialMarks = {}
          data.forEach(s => {
            initialMarks[s.id] = { marks: '', feedback: '' }
          })
          setStudentMarks(initialMarks)
        } catch (err) { console.error("Failed to load students", err) }
      }
      fetchStudents()
    }
  }, [activeTab])

  const handleUpload = async (e) => {
    e.preventDefault(); setUploading(true); setUploadSuccess(false)
    try {
      const fd = new FormData()
      fd.append('subject', user.subject); fd.append('title', title)
      fd.append('description', description); fd.append('content_type', contentType)
      if (contentType === 'youtube') fd.append('url', url)
      else if (file) fd.append('file', file)
      await api.post('/content/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setTitle(''); setDescription(''); setUrl(''); setFile(null); setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
      loadContent()
    } catch (err) { alert(err.response?.data?.detail || 'Upload failed') }
    setUploading(false)
  }

  const addQuestion = () => setQuestions([...questions, { question_text:'', options:['','','',''], correct_answer:'A' }])
  const removeQuestion = (i) => setQuestions(questions.filter((_,idx) => idx !== i))
  const updateQuestion = (i, field, value) => {
    const q = [...questions]
    if (field === 'options') q[i].options = value; else q[i][field] = value
    setQuestions(q)
  }

  const handlePostQuiz = async (e) => {
    e.preventDefault(); setPostingQuiz(true)
    try {
      await api.post('/quiz/', { subject: user.subject, title: quizTitle, description: quizDesc, questions: questions.map(q => ({ question_text: q.question_text, options: q.options, correct_answer: q.correct_answer })) })
      setQuizTitle(''); setQuizDesc(''); setQuestions([{ question_text:'', options:['','','',''], correct_answer:'A' }])
      loadQuizzes()
    } catch (err) { alert(err.response?.data?.detail || 'Failed to post quiz') }
    setPostingQuiz(false)
  }

  const handlePostResult = async (e) => {
    e.preventDefault(); setPostingResult(true); setResultSuccess(false)
    try {
      const payload = {
        subject: user.subject,
        test_name: resultTestName,
        total_marks: parseFloat(resultTotal),
        results: Object.entries(studentMarks)
          .filter(([_, data]) => data.marks !== '')
          .map(([id, data]) => ({
            student_id: parseInt(id),
            marks_obtained: parseFloat(data.marks),
            feedback: data.feedback || undefined
          }))
      }
      
      if (payload.results.length === 0) {
        alert("Please enter marks for at least one student.")
        setPostingResult(false)
        return
      }

      await api.post('/results/bulk', payload)
      setResultTestName(''); setResultTotal('')
      const clearedMarks = {}
      registeredStudents.forEach(s => clearedMarks[s.id] = { marks: '', feedback: '' })
      setStudentMarks(clearedMarks)
      setResultSuccess(true); setTimeout(() => setResultSuccess(false), 5000)
    } catch (err) { alert(err.response?.data?.detail || 'Failed to post results') }
    setPostingResult(false)
  }

  const cardStyle = { background:'#0d0d1a', border:'1px solid #1e1030', borderRadius:'16px', padding:'26px' }
  const subjectLabel = user?.subject?.replace('_',' ').toUpperCase()

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 className="section-title" style={{ marginBottom:'6px' }}>Teacher Dashboard</h1>
          <span style={{ background:'rgba(168,85,247,0.12)', color:'#a855f7', border:'1px solid rgba(168,85,247,0.25)', padding:'4px 14px', borderRadius:'999px', fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.1em' }}>
            {subjectLabel} TEACHER
          </span>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <span style={{ color:'#475569', fontSize:'0.8rem' }}>{user?.full_name}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'28px', flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'0.875rem', transition:'all 0.2s',
            background: activeTab===t.key ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
            color: activeTab===t.key ? '#c084fc' : '#64748b',
            border: activeTab===t.key ? '1px solid rgba(168,85,247,0.4)' : '1px solid #1e1030',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT TAB ── */}
      {activeTab === 'content' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
          {/* Upload Form */}
          <div style={cardStyle}>
            <h2 style={{ color:'#e2e8f0', fontWeight:700, marginBottom:'20px', fontSize:'1rem' }}>📤 Upload New Content</h2>
            <form onSubmit={handleUpload}>
              {uploadSuccess && <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80', borderRadius:'8px', padding:'10px 14px', fontSize:'0.85rem', marginBottom:'14px' }}>✅ Content uploaded successfully!</div>}
              <div style={inp}><label style={lbl}>Title</label><input className="input-dark" placeholder="e.g. Chapter 3 - Quadratic Equations" value={title} onChange={e=>setTitle(e.target.value)} required /></div>
              <div style={inp}><label style={lbl}>Description (optional)</label><textarea className="input-dark" placeholder="Brief description..." value={description} onChange={e=>setDescription(e.target.value)} rows={2} style={{ resize:'none' }} /></div>
              <div style={inp}>
                <label style={lbl}>Content Type</label>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {CONTENT_TYPES.map(ct => (
                    <button key={ct} type="button" onClick={()=>setContentType(ct)} style={{
                      padding:'7px 14px', borderRadius:'8px', cursor:'pointer', fontFamily:'Syne,sans-serif', fontSize:'0.8rem', fontWeight:600, transition:'all 0.2s',
                      background: contentType===ct ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
                      color: contentType===ct ? '#c084fc' : '#64748b',
                      border: contentType===ct ? '1px solid rgba(168,85,247,0.35)' : '1px solid #1e1030',
                    }}>
                      {CONTENT_ICONS[ct]} {ct}
                    </button>
                  ))}
                </div>
              </div>
              {contentType === 'youtube'
                ? <div style={inp}><label style={lbl}>YouTube URL</label><input className="input-dark" type="url" placeholder="https://youtube.com/watch?v=..." value={url} onChange={e=>setUrl(e.target.value)} required /></div>
                : <div style={inp}><label style={lbl}>File</label><input type="file" onChange={e=>setFile(e.target.files?.[0])} required style={{ color:'#94a3b8', fontSize:'0.875rem', width:'100%' }} /></div>
              }
              <button type="submit" className="btn-purple" disabled={uploading} style={{ width:'100%', padding:'12px', marginTop:'4px' }}>
                {uploading ? '⏳ Uploading...' : '📤 Upload Content'}
              </button>
            </form>
          </div>

          {/* Uploaded Content List */}
          <div style={cardStyle}>
            <h2 style={{ color:'#e2e8f0', fontWeight:700, marginBottom:'20px', fontSize:'1rem' }}>📚 My Uploaded Content ({contents.length})</h2>
            <div style={{ maxHeight:'420px', overflowY:'auto', display:'grid', gap:'10px' }}>
              {contents.length === 0 && <p style={{ color:'#475569', fontSize:'0.875rem', textAlign:'center', padding:'30px' }}>No content uploaded yet.</p>}
              {contents.map(c => (
                <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:'rgba(255,255,255,0.03)', borderRadius:'10px', border:'1px solid #1e1030' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'14px', flex:1 }}>
                    <span style={{ fontSize:'1.8rem' }}>{CONTENT_ICONS[c.content_type]}</span>
                    <div>
                      <p style={{ margin:0, color:'#e2e8f0', fontSize:'1rem', fontWeight:700 }}>{c.title}</p>
                      <p style={{ margin:'4px 0 0', color:'#64748b', fontSize:'0.85rem', textTransform:'uppercase' }}>{c.content_type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (c.url) { window.open(c.url, '_blank'); return }
                      if (c.file_path) {
                        const token = localStorage.getItem('token')
                        fetch(`/api/content/file/${c.id}`, { headers: { Authorization: `Bearer ${token}` } })
                          .then(r => { if (!r.ok) throw new Error('Not found'); return r.blob() })
                          .then(blob => window.open(URL.createObjectURL(blob), '_blank'))
                          .catch(() => alert('Could not open file.'))
                      }
                    }}
                    className="btn-outline"
                    style={{ padding:'7px 18px', fontSize:'0.9rem', whiteSpace:'nowrap' }}
                  >
                    {c.content_type === 'youtube' ? '▶ Watch' : '📂 Open'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── QUIZ TAB ── */}
      {activeTab === 'quiz' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
          <div style={{ ...cardStyle, maxHeight:'80vh', overflowY:'auto' }}>
            <h2 style={{ color:'#e2e8f0', fontWeight:700, marginBottom:'20px', fontSize:'1rem' }}>📝 Create & Post Quiz</h2>
            <form onSubmit={handlePostQuiz}>
              <div style={inp}><label style={lbl}>Quiz Title</label><input className="input-dark" placeholder="e.g. Chapter 3 Quiz" value={quizTitle} onChange={e=>setQuizTitle(e.target.value)} required /></div>
              <div style={inp}><label style={lbl}>Description (optional)</label><textarea className="input-dark" placeholder="Instructions..." value={quizDesc} onChange={e=>setQuizDesc(e.target.value)} rows={2} style={{ resize:'none' }} /></div>

              <label style={{ ...lbl, marginTop:'8px' }}>Questions ({questions.length})</label>
              {questions.map((q, i) => (
                <div key={i} style={{ marginBottom:'14px', padding:'14px', background:'rgba(168,85,247,0.05)', border:'1px solid rgba(168,85,247,0.15)', borderRadius:'10px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                    <span style={{ color:'#7c3aed', fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.06em' }}>Q{i+1}</span>
                    {questions.length > 1 && <button type="button" onClick={()=>removeQuestion(i)} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:'0.8rem' }}>✕ Remove</button>}
                  </div>
                  <input className="input-dark" placeholder="Question text" value={q.question_text} onChange={e=>updateQuestion(i,'question_text',e.target.value)} required style={{ marginBottom:'8px' }} />
                  {q.options.map((opt, j) => (
                    <input key={j} className="input-dark" placeholder={`Option ${String.fromCharCode(65+j)}`} value={opt} onChange={e=>{ const o=[...q.options]; o[j]=e.target.value; updateQuestion(i,'options',o) }} required style={{ marginBottom:'6px', fontSize:'0.85rem' }} />
                  ))}
                  <div style={{ marginTop:'8px' }}>
                    <label style={lbl}>Correct Answer</label>
                    <select className="input-dark" value={q.correct_answer} onChange={e=>updateQuestion(i,'correct_answer',e.target.value)} style={{ cursor:'pointer' }}>
                      {['A','B','C','D'].map(x => <option key={x} value={x}>Option {x}</option>)}
                    </select>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addQuestion} className="btn-outline" style={{ width:'100%', marginBottom:'12px', fontSize:'0.85rem' }}>+ Add Question</button>
              <button type="submit" className="btn-purple" disabled={postingQuiz} style={{ width:'100%', padding:'12px' }}>
                {postingQuiz ? '⏳ Posting...' : '📝 Post Quiz to Students'}
              </button>
            </form>
          </div>

          <div style={cardStyle}>
            <h2 style={{ color:'#e2e8f0', fontWeight:700, marginBottom:'20px', fontSize:'1rem' }}>📋 My Posted Quizzes ({quizzes.length})</h2>
            <div style={{ display:'grid', gap:'10px' }}>
              {quizzes.length === 0 && <p style={{ color:'#475569', fontSize:'0.875rem', textAlign:'center', padding:'30px' }}>No quizzes posted yet.</p>}
              {quizzes.map(q => (
                <div key={q.id} style={{ padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:'10px', border:'1px solid #1e1030' }}>
                  <p style={{ margin:0, color:'#e2e8f0', fontSize:'0.875rem', fontWeight:600 }}>{q.title}</p>
                  <p style={{ margin:'4px 0 0', color:'#64748b', fontSize:'0.75rem' }}>{(q.questions||[]).length} questions</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS TAB ── */}
      {activeTab === 'results' && (
        <div style={{ maxWidth:'100%' }}>
          <div style={cardStyle}>
            <div style={{ marginBottom: '24px', display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:'20px', flexWrap:'wrap' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ color:'#e2e8f0', fontWeight:700, marginBottom:'8px', fontSize:'1rem' }}>🏆 Bulk Results Entry</h2>
                <p style={{ color:'#64748b', fontSize:'0.8rem', margin:0 }}>Enter marks for all registered students at once. Each student only sees their own marks.</p>
              </div>
              <div style={{ display:'flex', gap:'12px' }}>
                <div style={{ width:'200px' }}><label style={lbl}>Test / Exam Name</label><input className="input-dark" placeholder="Unit Test 1" value={resultTestName} onChange={e=>setResultTestName(e.target.value)} required /></div>
                <div style={{ width:'120px' }}><label style={lbl}>Max Marks</label><input className="input-dark" type="number" placeholder="100" value={resultTotal} onChange={e=>setResultTotal(e.target.value)} required /></div>
              </div>
            </div>

            {resultSuccess && <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80', borderRadius:'8px', padding:'10px 14px', fontSize:'0.85rem', marginBottom:'20px' }}>✅ All results have been posted successfully!</div>}
            
            <div style={{ overflowX:'auto', borderRadius:'12px', border:'1px solid #1e1030', background:'rgba(255,255,255,0.01)' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #1e1030', textAlign:'left' }}>
                    <th style={{ padding:'14px 18px', color:'#94a3b8', fontWeight:600 }}>STUDENT NAME</th>
                    <th style={{ padding:'14px 18px', color:'#94a3b8', fontWeight:600 }}>ID</th>
                    <th style={{ padding:'14px 18px', color:'#94a3b8', fontWeight:600 }}>ROLL NUMBER</th>
                    <th style={{ padding:'14px 18px', color:'#94a3b8', fontWeight:600, width:'140px' }}>MARKS OBTAINED</th>
                    <th style={{ padding:'14px 18px', color:'#94a3b8', fontWeight:600 }}>FEEDBACK / COMMENTS</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredStudents.length === 0 && (
                    <tr><td colSpan="5" style={{ padding:'40px', textAlign:'center', color:'#475569' }}>No students enrolled in this subject yet.</td></tr>
                  )}
                  {registeredStudents.map(student => (
                    <tr key={student.id} style={{ borderBottom:'1px solid #1e1030', transition:'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding:'12px 18px', color:'#e2e8f0', fontWeight:500 }}>{student.full_name}</td>
                      <td style={{ padding:'12px 18px', color:'#64748b' }}>#{student.id}</td>
                      <td style={{ padding:'12px 18px', color:'#e2e8f0', fontWeight:600 }}>{student.roll_number || '—'}</td>
                      <td style={{ padding:'12px 18px' }}>
                        <input 
                          className="input-dark-sm" 
                          type="number" 
                          placeholder="0"
                          style={{ width:'100%', textAlign:'center' }}
                          value={studentMarks[student.id]?.marks || ''}
                          onChange={e => setStudentMarks({...studentMarks, [student.id]: { ...studentMarks[student.id], marks: e.target.value }})}
                        />
                      </td>
                      <td style={{ padding:'12px 18px' }}>
                        <input 
                          className="input-dark-sm" 
                          placeholder="Optional feedback..."
                          style={{ width:'100%' }}
                          value={studentMarks[student.id]?.feedback || ''}
                          onChange={e => setStudentMarks({...studentMarks, [student.id]: { ...studentMarks[student.id], feedback: e.target.value }})}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop:'24px', display:'flex', justifyContent:'flex-end' }}>
              <button 
                type="button" 
                onClick={handlePostResult} 
                className="btn-purple" 
                disabled={postingResult || !resultTestName || !resultTotal} 
                style={{ padding:'14px 40px', fontSize:'0.9rem' }}
              >
                {postingResult ? '⏳ Posting Results...' : '🏆 Post Results to All Students'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
