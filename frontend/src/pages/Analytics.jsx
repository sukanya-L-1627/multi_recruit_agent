import { useState, useEffect } from 'react'
import { getAnalytics } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, CartesianGrid
} from 'recharts'
import { motion } from 'framer-motion'
import { Users, Target, FileText, Database } from 'lucide-react'

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899']

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
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
      {payload.map((p,i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || p.color || '#fff' }} />
          <span>{p.name || 'Count'}:</span>
          <span>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page flex-center" style={{ minHeight:'80vh' }}><div className="spinner" /></div>
  if (!data) return <div className="page"><div className="empty-state"><div className="empty-state-title">Failed to load analytics</div></div></div>

  const scoreDist = Object.entries(data.score_distribution).map(([range,count]) => ({ range, count }))
  const recData = Object.entries(data.recommendation_breakdown).map(([name,value]) => ({ name, value }))
  const topSkills = (data.top_skills || []).slice(0, 10)

  const radarData = scoreDist.map(({ range, count }) => ({ subject: range, A: count, fullMark: Math.max(...scoreDist.map(s => s.count), 1) }))

  return (
    <div className="page" style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>Intelligence Analytics</h1>
        <p className="page-subtitle" style={{ fontSize: 15 }}>Deep insights into your AI-driven candidate pipeline</p>
      </div>

      {/* KPI Row */}
      <div className="grid-4 mb-6" style={{ gap: 20 }}>
        {[
          { label: 'Total Candidates', value: data.total_candidates, color: '#6366f1', icon: Users, bg: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.02) 100%)' },
          { label: 'Avg ATS Score', value: `${data.average_ats_score}%`, color: '#10b981', icon: Target, bg: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.02) 100%)' },
          { label: 'Job Descriptions', value: data.total_jds, color: '#06b6d4', icon: FileText, bg: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0.02) 100%)' },
          { label: 'Vector Indexed', value: data.vector_store_size, color: '#8b5cf6', icon: Database, bg: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.02) 100%)' },
        ].map((k, i) => (
          <motion.div key={k.label} className="card" 
            style={{ 
              background: k.bg, 
              border: `1px solid ${k.color}20`,
              display: 'flex', alignItems: 'center', gap: 16, padding: '24px'
            }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div style={{ 
              width: 50, height: 50, borderRadius: 12, background: `${k.color}20`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color 
            }}>
              <k.icon size={24} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 600 }}>{k.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid-2 mb-6" style={{ gap: 20 }}>
        {/* Score Distribution Bar */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex-between mb-6">
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Score Distribution</h3>
            <span className="badge badge-indigo">ATS Match</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={scoreDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="range" tick={{ fill:'var(--text-muted)',fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)',fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[6,6,0,0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recommendation Pie */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex-between mb-6">
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Hiring Recommendations</h3>
            <span className="badge badge-green">AI Summary</span>
          </div>
          {recData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', height: 260 }}>
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie data={recData} cx="50%" cy="50%" outerRadius={90} innerRadius={60}
                    dataKey="value" paddingAngle={6} stroke="none">
                    {recData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recData.map((r, i) => (
                  <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: 'var(--text-primary)', flex: 1 }}>{r.name}</span>
                    <span style={{ fontWeight: 700 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ height: 260 }}><div className="empty-state-title">No data</div></div>
          )}
        </motion.div>
      </div>

      <div className="grid-2 mb-6" style={{ gap: 20 }}>
        {/* Top Skills */}
        {topSkills.length > 0 && (
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <div className="flex-between mb-6">
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>Top Extracted Skills</h3>
              <span className="badge badge-amber">Market Demand</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSkills} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="skillGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#c084fc" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill:'var(--text-muted)',fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="skill" tick={{ fill:'var(--text-secondary)',fontSize:11, fontWeight: 600 }} width={100} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" fill="url(#skillGradient)" radius={[0,6,6,0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Score Radar */}
        {radarData.length > 0 && (
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between mb-2">
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>Score Radar Analysis</h3>
              <span className="badge badge-cyan">Pipeline Shape</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} outerRadius={100}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} />
                <Radar name="Candidates" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.25} />
                <Tooltip content={<Tip />} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  )
}
