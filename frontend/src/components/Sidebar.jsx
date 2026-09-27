import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Upload, FileText, Trophy,
  BarChart3, FileCheck, MessageSquare, Search, Zap
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'main' },
  { to: '/upload-resume', icon: Upload, label: 'Upload Resume', section: 'pipeline' },
  { to: '/job-descriptions', icon: FileText, label: 'Job Descriptions', section: 'pipeline' },
  { to: '/workflow', icon: Zap, label: 'How it Works', section: 'pipeline' },
  { to: '/rankings', icon: Trophy, label: 'Candidate Rankings', section: 'insights' },
  { to: '/analytics', icon: BarChart3, label: 'ATS Analytics', section: 'insights' },
  { to: '/summaries', icon: FileCheck, label: 'Recruiter Summaries', section: 'insights' },
  { to: '/interview-questions', icon: MessageSquare, label: 'Interview Questions', section: 'insights' },
  { to: '/search', icon: Search, label: 'Semantic Search', section: 'tools' },
  { to: '/settings', icon: LayoutDashboard, label: 'Settings', section: 'tools' },
]

const sections = {
  main: 'Navigation',
  pipeline: 'Pipeline',
  insights: 'Insights',
  tools: 'Tools',
}

export default function Sidebar() {
  const grouped = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {})

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🤖</div>
        <div>
          <div className="sidebar-logo-text">RecruitAI</div>
          <div className="sidebar-logo-sub">Multi-Agent Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} className="nav-section">
            <div className="nav-label">{sections[section]}</div>
            {items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to} to={to} end={to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <Icon className="nav-item-icon" size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Zap size={12} style={{ color: 'var(--accent)' }} />
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Powered by Gemini AI</span>
          </div>
          <div>7 Autonomous Agents Active</div>
        </div>
      </div>
    </aside>
  )
}
