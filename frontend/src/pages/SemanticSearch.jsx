import { useState } from 'react'
import { semanticSearch } from '../services/api'
import { Search, Loader, User, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EXAMPLE_QUERIES = [
  'Find NLP candidates with FastAPI experience',
  'Find Python developers with AI projects',
  'Senior engineers with LangChain and RAG skills',
  'Candidates with cloud and Kubernetes experience',
  'ML engineers with PyTorch and TensorFlow',
]

export default function SemanticSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async (q) => {
    const term = q || query
    if (!term.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const r = await semanticSearch(term, 10)
      setResults(r.data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Semantic Search</h1>
        <p className="page-subtitle">Natural language RAG-powered search through your candidate pool</p>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="search-bar">
          <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            className="search-input"
            placeholder="e.g. Find NLP candidates with FastAPI experience..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <button className="btn btn-primary" onClick={() => search()} disabled={loading || !query.trim()}>
            {loading ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={15} />}
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Example Queries */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>💡 Try these:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXAMPLE_QUERIES.map(q => (
              <button key={q} className="badge badge-indigo"
                style={{ cursor: 'pointer', border: 'none', fontWeight: 400, fontSize: 12, padding: '6px 12px' }}
                onClick={() => { setQuery(q); search(q) }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex-center" style={{ padding: 60 }}>
          <div className="flex-col flex-center gap-3">
            <div className="spinner" />
            <div className="loading-text">Searching vector database...</div>
          </div>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No matching candidates found</div>
          <div className="empty-state-sub">Try different keywords or upload more resumes</div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Found <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{results.length}</span> candidates matching your query
          </div>
          <AnimatePresence>
            {results.map((r, i) => (
              <motion.div key={r.candidate_id} className="card mb-3"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Similarity Score */}
                  <div style={{
                    width: 60, height: 60, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(99,102,241,0.15)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                      {Math.round(r.similarity_score * 100)}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>MATCH</div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {r.email || 'No email'} · {r.years_experience ? `${r.years_experience} yrs exp` : 'Unknown exp'}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{r.candidate_id}</span>
                    </div>

                    {/* Similarity Bar */}
                    <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{
                          width: `${r.similarity_score * 100}%`,
                          background: 'linear-gradient(90deg, var(--accent), var(--accent-2))'
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 }}>
                        {(r.similarity_score * 100).toFixed(1)}% match
                      </span>
                    </div>

                    {/* Skills */}
                    {r.skills?.length > 0 && (
                      <div className="skill-tags">
                        {r.skills.slice(0, 8).map(s => <span key={s} className="skill-tag">{s}</span>)}
                        {r.skills.length > 8 && <span className="badge badge-gray">+{r.skills.length - 8}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
