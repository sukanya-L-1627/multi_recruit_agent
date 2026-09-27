import { useState, useEffect } from 'react'
import { listCandidates, getInterviewQuestions } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

export default function InterviewQuestions() {
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected] = useState(null)
  const [questions, setQuestions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qLoading, setQLoading] = useState(false)

  useEffect(() => {
    listCandidates().then(r => setCandidates(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const loadQuestions = async (candidateId) => {
    if (selected === candidateId) { setSelected(null); setQuestions(null); return }
    setSelected(candidateId)
    setQLoading(true)
    try {
      const r = await getInterviewQuestions(candidateId)
      setQuestions(r.data)
    } catch {
      setQuestions(null)
    } finally {
      setQLoading(false)
    }
  }

  if (loading) return <div className="page flex-center" style={{ minHeight: '80vh' }}><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Interview Questions</h1>
        <p className="page-subtitle">AI-generated custom interview questionnaires per candidate</p>
      </div>

      {candidates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-title">No candidates yet</div>
          <div className="empty-state-sub">Upload resumes to generate interview questions</div>
        </div>
      ) : (
        <div className="grid-2">
          {/* Candidate List */}
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
              SELECT CANDIDATE
            </h3>
            {candidates.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="card mb-3"
                style={{
                  cursor: 'pointer', border: selected === c.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: selected === c.id ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)'
                }}
                onClick={() => loadQuestions(c.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.email || 'No email'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="skill-tags">
                      {(c.skills || []).slice(0, 2).map(s => <span key={s} className="skill-tag">{s}</span>)}
                    </div>
                    <MessageSquare size={16} style={{ color: selected === c.id ? 'var(--accent)' : 'var(--text-muted)' }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Questions Panel */}
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
              INTERVIEW QUESTIONNAIRE
            </h3>
            {!selected ? (
              <div className="card empty-state" style={{ minHeight: 300 }}>
                <div className="empty-state-icon">👈</div>
                <div className="empty-state-title">Select a candidate</div>
                <div className="empty-state-sub">Click a candidate to view their interview questions</div>
              </div>
            ) : qLoading ? (
              <div className="card flex-center" style={{ minHeight: 200 }}><div className="spinner" /></div>
            ) : !questions ? (
              <div className="card empty-state"><div className="empty-state-title">No questions found</div></div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Technical */}
                <div className="card mb-4">
                  <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: 'var(--accent)' }}>
                    ⚡ Technical Questions
                  </h4>
                  {(questions.technical_questions || []).map((q, i) => (
                    <div key={i} className="question-item">
                      <span style={{ color: 'var(--accent)', fontWeight: 600, marginRight: 8 }}>Q{i+1}.</span>
                      {q}
                    </div>
                  ))}
                </div>

                {/* Behavioral */}
                <div className="card mb-4">
                  <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: 'var(--success)' }}>
                    🧠 Behavioral Questions
                  </h4>
                  {(questions.behavioral_questions || []).map((q, i) => (
                    <div key={i} className="question-item behavioral">
                      <span style={{ color: 'var(--success)', fontWeight: 600, marginRight: 8 }}>Q{i+1}.</span>
                      {q}
                    </div>
                  ))}
                </div>

                {/* Project */}
                <div className="card">
                  <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: 'var(--accent-3)' }}>
                    🛠️ Project-Based Questions
                  </h4>
                  {(questions.project_questions || []).map((q, i) => (
                    <div key={i} className="question-item project">
                      <span style={{ color: 'var(--accent-3)', fontWeight: 600, marginRight: 8 }}>Q{i+1}.</span>
                      {q}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
