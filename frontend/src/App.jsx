import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import { ToastProvider } from './components/Toast'
import Dashboard from './pages/Dashboard'
import UploadResume from './pages/UploadResume'
import JobDescriptions from './pages/JobDescriptions'
import Rankings from './pages/Rankings'
import Analytics from './pages/Analytics'
import RecruiterSummaries from './pages/RecruiterSummaries'
import InterviewQuestions from './pages/InterviewQuestions'
import SemanticSearch from './pages/SemanticSearch'
import Workflow from './pages/Workflow'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import Home from './pages/Home'

export default function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    const handleStorage = () => setIsAuth(!!localStorage.getItem('token'))
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const ProtectedRoute = ({ children }) => {
    if (!isAuth) return <Navigate to="/login" replace />
    return children
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                  <Topbar />
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="upload-resume" element={<UploadResume />} />
                    <Route path="job-descriptions" element={<JobDescriptions />} />
                    <Route path="rankings" element={<Rankings />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="summaries" element={<RecruiterSummaries />} />
                    <Route path="summaries" element={<RecruiterSummaries />} />
                    <Route path="interview-questions" element={<InterviewQuestions />} />
                    <Route path="search" element={<SemanticSearch />} />
                    <Route path="workflow" element={<Workflow />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
