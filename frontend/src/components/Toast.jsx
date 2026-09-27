import { useState, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: <CheckCircle size={16} style={{ color: 'var(--success)' }} />,
  error: <XCircle size={16} style={{ color: 'var(--danger)' }} />,
  warning: <AlertCircle size={16} style={{ color: 'var(--warning)' }} />,
  info: <Info size={16} style={{ color: 'var(--accent)' }} />,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(({ id, message, type }) => (
          <div key={id} className={`toast ${type}`}>
            {icons[type]}
            <span>{message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
