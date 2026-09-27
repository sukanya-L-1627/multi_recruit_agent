import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { LogIn, User, Lock, Loader, ShieldCheck, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '../components/Toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast('Please enter all fields', 'warning')
    
    setLoading(true)
    try {
      const res = await login(email, password)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify({
        username: res.data.username,
        email: res.data.email,
        role: res.data.role
      }))
      toast(`Welcome back, ${res.data.username}!`, 'success')
      navigate('/dashboard')
      window.location.reload() 
    } catch (err) {
      toast(err.response?.data?.detail || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050508', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background Gradients */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
        filter: 'blur(80px)', zIndex: 0
      }} />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ position: 'absolute', top: 40, left: 40, zIndex: 10 }}
      >
        <button onClick={() => navigate('/')} className="btn" style={{ color: 'var(--text-muted)', gap: 8 }}>
          <ArrowLeft size={18} /> Back to RecruitAI
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: '100%', maxWidth: 440, padding: 48,
          background: 'rgba(15, 15, 25, 0.8)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 28,
          boxShadow: '0 40px 80px rgba(0, 0, 0, 0.6)',
          position: 'relative', zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 15px 30px rgba(99, 102, 241, 0.3)',
            fontSize: 32, fontWeight: 800, color: 'white'
          }}>
            R
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, color: 'white', marginBottom: 12 }}>HR Portal Login</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5 }}>
            Access the Multi-Agent Recruitment Platform <br/> using your enterprise credentials.
          </p>
        </div>

        <form onSubmit={handleLogin} autoComplete="off">
          {/* Dummy inputs to trick browser auto-fill */}
          <input type="text" name="prevent_autofill" style={{ display: 'none' }} tabIndex="-1" />
          <input type="password" name="password_fake" style={{ display: 'none' }} tabIndex="-1" />

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Corporate Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                name={`user_email_${Math.random().toString(36).substring(7)}`}
                className="form-input"
                style={{ padding: '14px 16px 14px 48px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, color: 'white' }}
                placeholder="Enter your work email"
                autoComplete="new-password"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 32 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Access Key</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                name={`user_pass_${Math.random().toString(36).substring(7)}`}
                className="form-input"
                style={{ padding: '14px 16px 14px 48px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, color: 'white' }}
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%', justifyContent: 'center', padding: '16px',
              fontSize: 16, fontWeight: 700, borderRadius: 14,
              boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
            }}
            disabled={loading}
          >
            {loading ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : (
              <>
                <LogIn size={20} />
                Access Dashboard
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)' }} />
      </motion.div>
    </div>
  )
}
