import { useState, useEffect } from 'react'
import { getRankings, listJDs, updateCandidateStatus, deleteCandidate } from '../services/api'
import { Trophy, Medal, Award, ChevronRight, Trash2, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScoreBadge, RecommendBadge, ScoreRing } from '../components/ScoreRing'
import { useNavigate } from 'react-router-dom'

const StatusBadge = ({ status }) => {
  const styles = {
    'New': { bg: 'rgba(99,102,241,0.1)', color: 'var(--accent)', icon: Clock },
    'Shortlisted': { bg: 'rgba(16,185,129,0.1)', color: 'var(--success)', icon: UserCheck },
    'Interviewing': { bg: 'rgba(6,182,212,0.1)', color: 'var(--accent-3)', icon: Clock },
    'Hired': { bg: 'rgba(139,92,246,0.1)', color: 'var(--accent-2)', icon: CheckCircle },
    'Rejected': { bg: 'rgba(239,68,68,0.1)', color: 'var(--danger)', icon: XCircle },
  }
  const config = styles[status] || styles['New']
  const Icon = config.icon
  
  return (
    <span className="badge" style={{ background: config.bg, color: config.color, gap: 4 }}>
      <Icon size={12} />
      {status}
    </span>
  )
}

export default function Rankings() {
  const [rankings, setRankings] = useState([])
  const [jds, setJDs] = useState([])
  const [selectedJD, setSelectedJD] = useState('')
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  const fetchData = () => {
    setLoading(true)
    getRankings(selectedJD || null)
      .then(r => setRankings(r.data))
      .catch(() => setRankings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    listJDs().then(r => { setJDs(r.data) })
  }, [])

  useEffect(() => {
    fetchData()
  }, [selectedJD])

  const handleStatusUpdate = async (id, newStatus, e) => {
    e.stopPropagation()
    try {
      await updateCandidateStatus(id, newStatus)
      setRankings(prev => prev.map(c => c.candidate_id === id ? { ...c, hr_status: newStatus } : c))
    } catch (err) {
      alert("Failed to update status")
    }
  }

  const handleDelete = async (id, name, e) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to remove ${name} and their resume from the system?`)) {
      try {
        await deleteCandidate(id)
        setRankings(prev => prev.filter(c => c.candidate_id !== id))
      } catch (err) {
        alert("Failed to delete candidate")
      }
    }
  }

  const rankIcon = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`

  return (
    <div className="page">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">HR Candidate Pipeline</h1>
          <p className="page-subtitle">Track and manage candidates through the recruitment funnel</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="form-input form-select" style={{ width: 220 }}
            value={selectedJD} onChange={e => setSelectedJD(e.target.value)}>
            <option value="">All Job Descriptions</option>
            {jds.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ padding: 100 }}><div className="spinner" /></div>
      ) : rankings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-title">No candidates found</div>
          <div className="empty-state-sub">Upload resumes to start building your pipeline</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rank</th>
                  <th>Candidate Info</th>
                  <th>ATS Score</th>
                  <th>Skills & Experience</th>
                  <th>HR Pipeline Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {rankings.map((c, i) => (
                    <motion.tr key={c.candidate_id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => nav(`/summaries?candidate=${c.candidate_id}`)}>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: 16, color: i < 3 ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {rankIcon(c.rank)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 800, fontSize: 18, color: c.ats_score >= 75 ? 'var(--success)' : c.ats_score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                              {c.ats_score?.toFixed(0)}%
                            </span>
                            <div className="progress-bar" style={{ width: 60 }}>
                              <div className="progress-fill" style={{ width: `${c.ats_score}%`, background: c.ats_score >= 75 ? 'var(--success)' : 'var(--accent)' }} />
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Semantic: {c.semantic_similarity?.toFixed(0)}%</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 500 }}>{c.years_experience ? `${c.years_experience} yrs exp` : 'Entry Level'}</div>
                        <div className="skill-tags">
                          {(c.skills || []).slice(0, 2).map(s => <span key={s} className="skill-tag" style={{ fontSize: 9, padding: '2px 6px' }}>{s}</span>)}
                          {c.skills?.length > 2 && <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>+{c.skills.length - 2} more</span>}
                        </div>
                      </td>
                      <td>
                        <div onClick={e => e.stopPropagation()}>
                          <select 
                            className="form-input" 
                            style={{ width: 130, padding: '4px 8px', fontSize: 11, background: 'var(--bg-card)' }}
                            value={c.hr_status || 'New'}
                            onChange={e => handleStatusUpdate(c.candidate_id, e.target.value, e)}
                          >
                            <option value="New">New</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Hired">Hired</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <div style={{ marginTop: 4 }}><StatusBadge status={c.hr_status} /></div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button 
                            className="btn-icon" 
                            style={{ color: 'var(--danger)', padding: 6, borderRadius: 6, background: 'rgba(239,68,68,0.05)', border: 'none', cursor: 'pointer' }}
                            title="Remove Candidate"
                            onClick={e => handleDelete(c.candidate_id, c.name, e)}
                          >
                            <Trash2 size={16} />
                          </button>
                          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
