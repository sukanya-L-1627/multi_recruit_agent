import { useEffect, useState } from 'react'
import { getAnalytics, clearCandidates, deleteCandidate } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts'
import { Trash2, Users, FileText, TrendingUp, Cpu, Award } from 'lucide-react'
import { motion } from 'framer-motion'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6']

const StatCard = ({ icon: Icon, label, value, color, delay }) => {
  const colorMap = {
    indigo: '#6366f1',
    cyan: '#06b6d4',
    green: '#10b981',
    amber: '#f59e0b'
  }
  const hex = colorMap[color] || '#6366f1'
  return (
    <motion.div className="card" 
      style={{ 
        background: `linear-gradient(135deg, ${hex}15 0%, ${hex}02 100%)`, 
        border: `1px solid ${hex}20`,
        display: 'flex', alignItems: 'center', gap: 16, padding: '24px'
      }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <div style={{ 
        width: 50, height: 50, borderRadius: 12, background: `${hex}20`, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: hex 
      }}>
        <Icon size={24} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 600 }}>{label}</div>
      </div>
    </motion.div>
  )
}

const AgentCard = ({ icon, name, status, desc, delay }) => (
  <motion.div className="card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: 'rgba(99,102,241,0.15)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 20
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{name}</span>
          <span className="badge badge-green" style={{ fontSize: 10 }}>{status}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{desc}</div>
      </div>
    </div>
  </motion.div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'rgba(10, 10, 15, 0.95)', 
        border: '1px solid rgba(255,255,255,0.15)', 
        borderRadius: 12, 
        padding: '12px 16px', 
        fontSize: 12,
        color: '#fff',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>
        <div style={{ color: '#f8fafc', marginBottom: 6, fontWeight: 700 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600 }}>
             <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || p.color || '#fff' }} />
             <span>{p.name || 'Count'}:</span>
             <span>{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000)
    
    getAnalytics()
      .then(r => {
        setAnalytics(r.data)
        clearTimeout(timer)
      })
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false))
      
    return () => clearTimeout(timer)
  }, [])

  const agents = [
    { icon: '📄', name: 'Resume Parser Agent', status: 'Active', desc: 'Extracts name, email, skills, and experience from PDF resumes' },
    { icon: '🔍', name: 'Skill Extraction Agent', status: 'Active', desc: 'Categorizes technical and soft skills across 8 domains' },
    { icon: '🎯', name: 'ATS Scoring Agent', status: 'Active', desc: 'Semantic + keyword matching for ATS compatibility scoring' },
    { icon: '🏆', name: 'Candidate Ranking Agent', status: 'Active', desc: 'Ranks candidates by ATS score, experience, and skills' },
    { icon: '💬', name: 'Interview Question Agent', status: 'Active', desc: 'Generates custom technical and behavioral questions' },
    { icon: '📊', name: 'Recruiter Summary Agent', status: 'Active', desc: 'Creates concise executive summaries with recommendations' },
    { icon: '✉️', name: 'Email Automation Agent', status: 'Active', desc: 'Sends shortlist, rejection, and interview invite emails' },
  ]

  const scoreDistData = analytics ? Object.entries(analytics.score_distribution).map(([range, count]) => ({
    range, count
  })) : []

  const recData = analytics ? Object.entries(analytics.recommendation_breakdown).map(([name, value]) => ({
    name, value
  })) : []

  const statusData = analytics?.status_breakdown ? Object.entries(analytics.status_breakdown).map(([name, value]) => ({ name, value })) : []
  const topSkillsData = analytics?.top_skills?.slice(0, 8) || []

  if (loading) return (
    <div className="page flex-center" style={{ minHeight: '80vh' }}>
      <div className="flex-col flex-center gap-3">
        <div className="spinner" />
        <div className="loading-text">Loading dashboard...</div>
      </div>
    </div>
  )

  return (
    <div className="page" style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header flex-between" style={{ marginBottom: 40 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="page-title" style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>RecruitAI Intelligence Control</h1>
          <p className="page-subtitle" style={{ fontSize: 15 }}>Master dashboard for your autonomous recruitment pipeline</p>
        </motion.div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="status-dot" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>Agents Online</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-6">
        <StatCard icon={Users} label="Global Candidates" value={analytics?.total_candidates ?? 0} color="indigo" delay={0.1} />
        <StatCard icon={FileText} label="Active JDs" value={analytics?.total_jds ?? 0} color="cyan" delay={0.2} />
        <StatCard icon={TrendingUp} label="Platform Avg Score" value={`${analytics?.average_ats_score ?? 0}%`} color="green" delay={0.3} />
        <StatCard icon={Award} label="Knowledge Base" value={analytics?.vector_store_size ?? 0} color="amber" delay={0.4} />
      </div>

      {/* Charts Row */}
      <div className="grid-3 mb-6">
        {/* Score Distribution */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex-between mb-6">
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>ATS Score Distribution</h3>
          </div>
          {scoreDistData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="distGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" fill="url(#distGradient)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: 200 }}>
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">No data yet</div>
            </div>
          )}
        </motion.div>

        {/* HR Pipeline Status */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <div className="flex-between mb-6">
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>HR Pipeline Status</h3>
          </div>
          {statusData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', height: 200 }}>
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value" paddingAngle={5} stroke="none">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[(i+2) % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {statusData.map((r, i) => (
                  <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[(i+2) % COLORS.length] }} />
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{r.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ height: 200 }}>
              <div className="empty-state-icon">🔄</div>
              <div className="empty-state-title">No status data</div>
            </div>
          )}
        </motion.div>

        {/* Recommendation Breakdown */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="flex-between mb-6">
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Recruiter Recommendations</h3>
          </div>
          {recData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', height: 200 }}>
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie data={recData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value" paddingAngle={5} stroke="none">
                    {recData.map((_, i) => <Cell key={i} fill={COLORS[(i+4) % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recData.map((r, i) => (
                  <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[(i+4) % COLORS.length] }} />
                    <span style={{ color: 'var(--text-secondary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ height: 200 }}>
              <div className="empty-state-icon">🎯</div>
              <div className="empty-state-title">No recommendations</div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Skills & Danger Zone */}
      <div className="grid-2 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {topSkillsData.length > 0 && (
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <div className="flex-between mb-6">
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Top Candidate Skills</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topSkillsData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashSkillGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }} width={90} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" fill="url(#dashSkillGradient)" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} 
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: '1px dashed var(--danger)', background: 'rgba(239,68,68,0.02)' }}>
          <div style={{ color: 'var(--danger)', marginBottom: 16 }}><Trash2 size={36} /></div>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>System Cleanup</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 24px', maxWidth: '80%' }}>
            Remove all candidate records, resumes, and AI analysis data from the system.
          </p>
          <button 
            className="btn" 
            style={{ background: 'var(--danger)', color: 'white', border: 'none', width: '80%', padding: '12px' }}
            onClick={async () => {
              if (window.confirm("⚠️ Are you sure you want to delete ALL candidate data and resumes? This cannot be undone.")) {
                try {
                  await clearCandidates()
                  window.location.reload()
                } catch (err) {
                  alert("Failed to clear data")
                }
              }
            }}
          >
            Clear All Platform Data
          </button>
        </motion.div>
      </div>

      {/* Recent Candidates */}
      <div className="page-header mb-4 mt-8">
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>👥 Recent Candidates</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Quickly manage your latest applicants</p>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>ATS Score</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.recent_candidates?.length > 0 ? (
                analytics.recent_candidates.map((c, i) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: c.ats_score >= 85 ? 'var(--success)' : c.ats_score >= 50 ? 'var(--accent)' : 'var(--danger)' }}>
                        {c.ats_score?.toFixed(0)}%
                      </span>
                    </td>
                    <td>
                       <span className="badge badge-gray" style={{ fontSize: 11 }}>{c.hr_status || 'New'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete ${c.name}?`)) {
                            await deleteCandidate(c.id);
                            window.location.reload();
                          }
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px 8px', borderRadius: 6 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                    No candidates yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Agents */}
      <div className="page-header mb-4 mt-8">
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>🤖 Active AI Agents</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>7 autonomous agents collaborating in your recruitment pipeline</p>
      </div>
      <div className="grid-4" style={{ paddingBottom: 40 }}>
        {agents.map((a, i) => (
          <AgentCard key={a.name} {...a} delay={0.05 * i} />
        ))}
      </div>
    </div>
  )
}
