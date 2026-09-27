import { useState, useEffect } from 'react'
import { createJD, listJDs, getJD } from '../services/api'
import { Plus, FileText, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../components/Toast'

export default function JobDescriptions() {
  const [jds, setJDs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', experience_required: '', required_skills: '' })
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const load = () => listJDs().then(r => setJDs(r.data)).catch(() => toast('Failed to load JDs', 'error'))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return toast('Title and description are required', 'warning')
    setSubmitting(true)
    try {
      const skills = form.required_skills ? form.required_skills.split(',').map(s => s.trim()).filter(Boolean) : []
      await createJD({ ...form, required_skills: skills })
      toast('Job description created!', 'success')
      setForm({ title: '', description: '', experience_required: '', required_skills: '' })
      setShowForm(false)
      load()
    } catch {
      toast('Failed to create job description', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Job Descriptions</h1>
          <p className="page-subtitle">Manage job postings to match against candidate resumes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} /> New Job Description
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="card mb-6"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>Create Job Description</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-input" placeholder="e.g. Senior AI Engineer"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Required</label>
                  <input className="form-input" placeholder="e.g. 3+ years"
                    value={form.experience_required} onChange={e => setForm({ ...form, experience_required: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Required Skills (comma-separated)</label>
                <input className="form-input" placeholder="Python, FastAPI, LangChain, FAISS..."
                  value={form.required_skills} onChange={e => setForm({ ...form, required_skills: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Full Job Description *</label>
                <textarea className="form-input form-textarea" rows={6}
                  placeholder="Paste the complete job description here..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : '💾 Save Job Description'}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JD List */}
      {jds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No job descriptions yet</div>
          <div className="empty-state-sub">Create your first JD to start matching resumes</div>
        </div>
      ) : (
        <div>
          {jds.map((jd, i) => (
            <motion.div key={jd.id} className="card mb-4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex-between" style={{ cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === jd.id ? null : jd.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(99,102,241,0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FileText size={18} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{jd.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      ID: #{jd.id} · {new Date(jd.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {expanded === jd.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              <AnimatePresence>
                {expanded === jd.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <JDDetail id={jd.id} />
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

function JDDetail({ id }) {
  const [detail, setDetail] = useState(null)
  useEffect(() => {
    getJD(id).then(r => setDetail(r.data))
  }, [id])

  if (!detail) return <div style={{ padding: '16px 0' }}><div className="spinner" style={{ width: 24, height: 24 }} /></div>

  return (
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
      {detail.required_skills?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Required Skills</div>
          <div className="skill-tags">
            {detail.required_skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
          </div>
        </div>
      )}
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {detail.description}
      </div>
    </div>
  )
}
