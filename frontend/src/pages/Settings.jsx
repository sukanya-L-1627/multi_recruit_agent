import { useState } from 'react'
import { Key, Save, CheckCircle } from 'lucide-react'
import { useToast } from '../components/Toast'
import { updateApiKey } from '../services/api'

export default function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSave = async (e) => {
    e.preventDefault()
    if (!apiKey.trim()) return toast('Please enter an API Key', 'warning')
    
    setLoading(true)
    try {
      await updateApiKey(apiKey)
      toast('API Key saved securely!', 'success')
      setApiKey('')
    } catch (err) {
      toast('Failed to save API Key', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">Configure your Personal Gemini AI Settings.</p>
        </div>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)' }}>
              <Key size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Gemini API Key (BYOK)</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Bring Your Own Key</p>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            In order to use the AI Recruitment Agents, you must provide your own Google Gemini API key. 
            This key will be securely saved to your account.
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">API Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="Paste your new API Key here..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              <Save size={18} /> {loading ? 'Saving...' : 'Update Configuration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
