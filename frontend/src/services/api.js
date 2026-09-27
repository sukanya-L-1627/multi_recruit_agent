import axios from 'axios'

const BASE = 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE,
  timeout: 120000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Job Descriptions ──────────────────────────────────
export const createJD = (data) => api.post('/job-descriptions/', data)
export const listJDs = () => api.get('/job-descriptions/')
export const getJD = (id) => api.get(`/job-descriptions/${id}`)

// ── Resume Upload ─────────────────────────────────────
export const uploadResume = (formData) =>
  api.post('/upload-resume/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Candidates ────────────────────────────────────────
export const listCandidates = (params) => api.get('/candidates/', { params })
export const getCandidate = (id) => api.get(`/candidates/${id}`)
export const deleteCandidate = (id) => api.delete(`/candidates/${id}`)
export const updateCandidateStatus = (id, status) => api.patch(`/candidates/${id}/status`, { status })
export const clearCandidates = () => api.post('/candidates/clear')

// ── Rankings ──────────────────────────────────────────
export const getRankings = (jdId) =>
  api.get('/rankings/', { params: jdId ? { jd_id: jdId } : {} })

// ── Summaries ─────────────────────────────────────────
export const getSummaries = () => api.get('/summaries/')
export const getCandidateSummary = (id) => api.get(`/summaries/${id}`)

// ── Interview Questions ───────────────────────────────
export const getInterviewQuestions = (id) => api.get(`/interview-questions/${id}`)

// ── Search ────────────────────────────────────────────
export const semanticSearch = (query, top_k = 10) =>
  api.post('/search/', { query, top_k })

// ── Analytics ─────────────────────────────────────────
export const getAnalytics = () => api.get('/analytics/')

// ── Health ────────────────────────────────────────────
export const healthCheck = () => api.get('/health')

// ── Auth ──────────────────────────────────────────────
export const login = (email, password) => api.post('/auth/login', { email, password })
export const register = (username, email, password) => api.post('/auth/register', { username, email, password })
