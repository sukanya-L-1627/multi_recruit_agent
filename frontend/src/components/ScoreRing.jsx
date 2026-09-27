export function ScoreRing({ score, size = 120 }) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const filled = (score / 100) * circumference
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#06b6d4' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--border)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease' }}
        />
      </svg>
      <div className="score-ring-label">
        {Math.round(score)}
        <span className="score-ring-sub">/ 100</span>
      </div>
    </div>
  )
}

export function ScoreBadge({ score }) {
  const cls = score >= 85 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low'
  return <span className={`${cls}`} style={{ fontWeight: 700 }}>{score?.toFixed(1)}</span>
}

export function RecommendBadge({ rec }) {
  const map = {
    'Strongly Recommend': 'badge-green',
    'Recommend': 'badge-cyan',
    'Consider': 'badge-amber',
    'Reject': 'badge-red',
  }
  return <span className={`badge ${map[rec] || 'badge-gray'}`}>{rec || '—'}</span>
}
