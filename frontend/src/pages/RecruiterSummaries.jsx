import { useState, useEffect } from 'react'
import { getSummaries, getCandidateSummary } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ScoreRing, RecommendBadge } from '../components/ScoreRing'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function RecruiterSummaries() {
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    getSummaries().then(r => setSummaries(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page flex-center" style={{ minHeight: '80vh' }}><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Recruiter Summaries</h1>
        <p className="page-subtitle">AI-generated executive candidate assessments with hiring recommendations</p>
      </div>

      {summaries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">No summaries yet</div>
          <div className="empty-state-sub">Process resumes to generate AI recruiter summaries</div>
        </div>
      ) : (
        <div>
          {summaries.map((s, i) => (
            <motion.div key={s.id} className="card mb-4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <ScoreRing score={s.fit_score || 0} size={70} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{s.name}</div>
                    <div style={{ marginTop: 6 }}><RecommendBadge rec={s.recommendation} /></div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </div>
                  {expanded === s.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {expanded === s.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <hr className="divider" />

                    {/* Summary Text */}
                    <div style={{
                      background: 'var(--bg-secondary)', borderRadius: 8,
                      padding: 16, marginBottom: 16,
                      fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7,
                      borderLeft: '3px solid var(--accent)'
                    }}>
                      {s.summary}
                    </div>

                    <div className="grid-3">
                      {/* Strengths */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 8 }}>
                          ✅ Strengths
                        </div>
                        {(s.strengths || []).map((item, j) => (
                          <div key={j} style={{
                            fontSize: 12, color: 'var(--text-secondary)', padding: '6px 10px',
                            background: 'rgba(16,185,129,0.08)', borderRadius: 6, marginBottom: 4
                          }}>{item}</div>
                        ))}
                      </div>

                      {/* Weaknesses */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning)', marginBottom: 8 }}>
                          ⚠️ Areas to Improve
                        </div>
                        {(s.weaknesses || []).map((item, j) => (
                          <div key={j} style={{
                            fontSize: 12, color: 'var(--text-secondary)', padding: '6px 10px',
                            background: 'rgba(245,158,11,0.08)', borderRadius: 6, marginBottom: 4
                          }}>{item}</div>
                        ))}
                      </div>

                      {/* Missing Skills */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>
                          ❌ Missing Skills
                        </div>
                        {(s.missing_skills || []).length === 0 ? (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>None identified</div>
                        ) : (
                          <div className="skill-tags">
                            {s.missing_skills.map(sk => (
                              <span key={sk} style={{
                                padding: '4px 10px', borderRadius: 6, fontSize: 11,
                                background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
                                border: '1px solid rgba(239,68,68,0.2)'
                              }}>{sk}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
