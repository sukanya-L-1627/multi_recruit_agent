import { useState, useRef, useCallback, useEffect } from 'react'
import { uploadResume, listJDs } from '../services/api'
import { Upload, FileText, CheckCircle, X, Loader, Cpu, Activity, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScoreRing, RecommendBadge } from '../components/ScoreRing'
import { useToast } from '../components/Toast'

export default function UploadResume() {
  const [jds, setJDs] = useState([])
  const [selectedJD, setSelectedJD] = useState('')
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState([])
  const [sendEmail, setSendEmail] = useState(false)
  const [progress, setProgress] = useState(0)
  const [agentStatus, setAgentStatus] = useState({})
  const [currentProcessingFile, setCurrentProcessingFile] = useState(null)
  const [clientId] = useState(() => Math.random().toString(36).substring(7))
  const fileRef = useRef()
  const toast = useToast()
  
  const AGENT_ORDER = [
    "Resume Parser Agent",
    "Skill Extraction Agent",
    "ATS Scoring Agent",
    "Interview Question Agent",
    "Recruiter Summary Agent",
    "Email Automation Agent"
  ]

  useEffect(() => {
    listJDs().then(r => {
      setJDs(r.data)
      if (r.data.length > 0) setSelectedJD(r.data[0].id)
    }).catch(() => toast('Failed to load job descriptions', 'error'))
  }, [])

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/progress/${clientId}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'pipeline_update') {
        setAgentStatus(prev => ({
          ...prev,
          [data.agent]: data
        }))
      }
    }

    return () => ws.close()
  }, [clientId])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.pdf'))
    if (dropped.length === 0) return toast('Please upload PDF files only', 'warning')
    setFiles(prev => [...prev, ...dropped])
  }, [])

  const onFileChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selected])
  }

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const handleUpload = async () => {
    if (!selectedJD) return toast('Please select a Job Description first', 'warning')
    if (files.length === 0) return toast('Please add at least one PDF resume', 'warning')

    setProcessing(true)
    setResults([])
    setProgress(0)
    const newResults = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setCurrentProcessingFile(file.name)
      setAgentStatus({}) // reset for each file
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('jd_id', selectedJD)
        fd.append('send_email', sendEmail)
        fd.append('client_id', clientId)
        
        const res = await uploadResume(fd)
        newResults.push({ file: file.name, status: 'success', data: res.data })
        toast(`✅ ${res.data.name} processed`, 'success')
      } catch (err) {
        console.error("Upload error:", err)
        const msg = err.response?.data?.detail || 'Pipeline connection error'
        newResults.push({ file: file.name, status: 'error', error: msg })
        toast(`❌ ${file.name}: ${msg}`, 'error')
      }
      setProgress(Math.round(((i + 1) / files.length) * 100))
      setResults([...newResults])
    }
    setProcessing(false)
    setCurrentProcessingFile(null)
    setFiles([])
  }

  return (
    <div className="page" style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Autonomous Resume Processing</h1>
        <p className="page-subtitle">Deploy your 7-agent AI swarm to analyze, rank, and engage candidates</p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        {/* Step 1: Configuration */}
        <div className="flex-col gap-4">
          <div className="card h-full">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>1</div>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>Configuration</h3>
            </div>
            
            <div className="form-group mb-6">
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Target Job Description</label>
              <select
                className="form-input form-select"
                value={selectedJD}
                onChange={e => setSelectedJD(e.target.value)}
              >
                {jds.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-6">
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Automation Options</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
                  style={{ accentColor: 'var(--accent)', width: 18, height: 18 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Email Outreach</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-email candidates based on fit</div>
                </div>
              </label>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <div
                className={`upload-zone ${dragging ? 'drag-over' : ''}`}
                style={{ minHeight: 180, borderStyle: 'dashed', borderWidth: 2 }}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={24} style={{ color: 'var(--accent)', marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 600 }}>Drop PDF Resumes</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Supports multiple files</div>
                <input ref={fileRef} type="file" accept=".pdf" multiple hidden onChange={onFileChange} />
              </div>

              {files.length > 0 && (
                <div style={{ marginTop: 16, maxHeight: 200, overflowY: 'auto' }}>
                  {files.map((f, i) => (
                    <div key={i} className="flex-between" style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 6 }}>
                      <div className="flex-center gap-2" style={{ overflow: 'hidden' }}>
                        <FileText size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                      </div>
                      <X size={14} onClick={(e) => { e.stopPropagation(); removeFile(i) }} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 24, padding: '14px', height: 50 }}
              onClick={handleUpload}
              disabled={processing || files.length === 0 || !selectedJD}
            >
              {processing ? (
                <><Loader size={18} className="spin" /> Processing swarms...</>
              ) : (
                <><Activity size={18} /> Initialize Pipeline</>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Agent Swarm Activity */}
        <div className="flex-col gap-4">
          <div className="card h-full" style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.08), rgba(255,255,255,1))', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>2</div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Agent Swarm Activity</h3>
            </div>

            {!processing && Object.keys(agentStatus).length === 0 ? (
              <div className="flex-col flex-center h-full" style={{ color: 'var(--text-muted)', opacity: 0.5, padding: 40, textAlign: 'center' }}>
                <Cpu size={48} style={{ marginBottom: 16 }} />
                <p style={{ fontSize: 14 }}>Waiting for pipeline initialization...</p>
                <p style={{ fontSize: 12, marginTop: 8 }}>Initialize to see real-time agent collaboration</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '600px', overflowY: 'auto', paddingRight: 8 }}>
                {currentProcessingFile && (
                  <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Loader size={14} className="spin" /> Processing: {currentProcessingFile}
                  </div>
                )}
                <AnimatePresence>
                  {AGENT_ORDER.map((agentName, i) => {
                    const statusData = agentStatus[agentName]
                    if (!statusData && agentName === "Email Automation Agent" && !sendEmail) return null; // Skip email agent if not selected
                    
                    const status = statusData?.status || 'pending'
                    const message = statusData?.message || 'Waiting to start...'
                    
                    return (
                      <motion.div
                        key={agentName}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`log-item ${status}`}
                        style={{
                          padding: '14px',
                          background: 'var(--bg-secondary)',
                          borderLeft: `3px solid ${status === 'completed' ? 'var(--success)' : status === 'failed' ? 'var(--danger)' : status === 'working' ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: '0 8px 8px 0',
                          opacity: status === 'pending' ? 0.6 : 1
                        }}
                      >
                        <div className="flex-between mb-2">
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {agentName}
                          </span>
                          {status === 'completed' && <CheckCircle size={14} style={{ color: 'var(--success)' }} />}
                          {status === 'working' && <Loader size={14} className="spin" style={{ color: 'var(--accent)' }} />}
                          {status === 'failed' && <X size={14} style={{ color: 'var(--danger)' }} />}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {message}
                        </div>
                        {status === 'working' && (
                          <motion.div 
                            className="loading-bar-mini"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            style={{ height: 2, background: 'var(--accent)', marginTop: 10, opacity: 0.5, borderRadius: 2 }}
                          />
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Analysis Results */}
        <div className="flex-col gap-4">
          <div className="card h-full">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>3</div>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>Intelligence Results</h3>
            </div>

            {results.length === 0 ? (
              <div className="flex-col flex-center h-full" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                <Clock size={48} style={{ marginBottom: 16 }} />
                <p style={{ fontSize: 14 }}>Results will appear here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {results.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: 16,
                      background: 'var(--bg-secondary)',
                      borderRadius: 12,
                      border: `1px solid ${r.status === 'success' ? 'var(--border)' : 'rgba(239,68,68,0.2)'}`
                    }}
                  >
                    <div className="flex-between mb-4">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.status === 'success' ? r.data.name : r.file}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.file}</div>
                      </div>
                      {r.status === 'success' ? (
                        <div style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>SUCCESS</div>
                      ) : (
                        <div style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>FAILED</div>
                      )}
                    </div>

                    {r.status === 'success' ? (
                      <div className="flex-center gap-4">
                        <ScoreRing score={r.data.ats_score || 0} size={70} />
                        <div>
                          <RecommendBadge rec={r.data.recommendation} />
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>ID: #{r.data.candidate_id}</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--danger)', padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 8 }}>
                        {r.error}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
