import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { healthCheck } from '../services/api'
import { Bell, RefreshCw, LogOut, User as UserIcon } from 'lucide-react'

const pageTitles = {
  '/dashboard': 'Dashboard Overview',
  '/upload-resume': 'Upload Resume',
  '/job-descriptions': 'Job Descriptions',
  '/rankings': 'Candidate Rankings',
  '/analytics': 'ATS Analytics',
  '/summaries': 'Recruiter Summaries',
  '/interview-questions': 'Interview Questions',
  '/search': 'Semantic Search',
  '/workflow': 'Platform Workflow',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [online, setOnline] = useState(null)
  
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  useEffect(() => {
    const check = async () => {
      try {
        await healthCheck()
        setOnline(true)
      } catch {
        setOnline(false)
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    window.location.reload()
  }

  return (
    <header className="topbar">
      <span className="topbar-title">{pageTitles[pathname] || 'Recruitment AI'}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="topbar-status">
          <span
            className="status-dot"
            style={{ background: online === null ? 'var(--warning)' : online ? 'var(--success)' : 'var(--danger)' }}
          />
          {online === null ? 'Connecting...' : online ? 'Backend Online' : 'Backend Offline'}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
        </div>
        
        {user && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            paddingLeft: 16, 
            marginLeft: 16, 
            borderLeft: '1px solid var(--border)' 
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.username}</div>
              <div style={{ fontSize: 11, color: 'var(--accent)' }}>{user.role}</div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-secondary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)'
            }}>
              <UserIcon size={16} />
            </div>
            <button 
              onClick={handleLogout}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 4, display: 'flex'
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
