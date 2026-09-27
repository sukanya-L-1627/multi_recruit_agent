import { motion } from 'framer-motion'
import { 
  FileSearch, 
  Cpu, 
  Zap, 
  BarChart3, 
  MessageSquareText, 
  UserCheck, 
  Mail,
  ChevronRight
} from 'lucide-react'

const agents = [
  {
    id: 1,
    title: "Resume Parser Agent",
    icon: <FileSearch size={24} />,
    color: "#6366f1",
    desc: "Uses advanced NLP to extract structured data (contact, education, experience) from unstructured PDF files.",
    details: "Converts binary PDF content into a clean JSON schema while handling complex multi-column layouts."
  },
  {
    id: 2,
    title: "Skill Extraction Agent",
    icon: <Cpu size={24} />,
    color: "#8b5cf6",
    desc: "Categorizes skills into Technical, Soft, and Domain-specific buckets using a custom-trained NER model.",
    details: "Identifies both explicit mentions and implicit skill sets based on the candidate's project descriptions."
  },
  {
    id: 3,
    title: "ATS Scoring Agent",
    icon: <Zap size={24} />,
    color: "#ec4899",
    desc: "Calculates a multi-dimensional score (0-100) based on keyword matching and semantic similarity.",
    details: "Goes beyond simple keyword counts by using vector embeddings to understand the context of the job description."
  },
  {
    id: 4,
    title: "Candidate Ranking Agent",
    icon: <BarChart3 size={24} />,
    color: "#f59e0b",
    desc: "Orchestrates cross-candidate comparison to build a ranked leaderboard for specific job roles.",
    details: "Weights ATS score, years of experience, and skill density to provide a fair and balanced ranking."
  },
  {
    id: 5,
    title: "Interview Question Agent",
    icon: <MessageSquareText size={24} />,
    color: "#10b981",
    desc: "Generates custom Technical, Behavioral, and Project-based questions tailored to the candidate's profile.",
    details: "Uses LLM prompting to create unique questions that probe specific claims made in the resume."
  },
  {
    id: 6,
    title: "Recruiter Summary Agent",
    icon: <UserCheck size={24} />,
    color: "#3b82f6",
    desc: "Synthesizes all agent outputs into a concise, human-readable executive summary and recommendation.",
    details: "Highlights strengths, flags missing requirements, and provides a clear 'Recommend' or 'Reject' decision."
  },
  {
    id: 7,
    title: "Email Automation Agent",
    icon: <Mail size={24} />,
    color: "#64748b",
    desc: "Closes the loop by sending automated, personalized status updates to candidates via SMTP.",
    details: "Drafts and sends 'Shortlisted' or 'Rejection' emails based on the decision from the Summary Agent."
  }
]

export default function Workflow() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">How It Works</h1>
        <p className="page-subtitle">Visualizing the 7-Agent AI Recruitment Pipeline</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          {/* Vertical Line */}
          <div style={{
            position: 'absolute', left: 40, top: 20, bottom: 20,
            width: 2, background: 'linear-gradient(to bottom, var(--accent), var(--accent-2), transparent)',
            opacity: 0.2
          }} />

          {agents.map((agent, idx) => (
            <motion.div 
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card"
              style={{
                marginLeft: 80,
                marginBottom: 32,
                position: 'relative',
                borderLeft: `4px solid ${agent.color}`
              }}
            >
              {/* Connector Point */}
              <div style={{
                position: 'absolute', left: -50, top: 20,
                width: 20, height: 2, background: 'rgba(255,255,255,0.1)'
              }} />
              <div style={{
                position: 'absolute', left: -72, top: 10,
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--bg-card)', border: `2px solid ${agent.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: agent.color, boxShadow: `0 0 15px ${agent.color}33`
              }}>
                {agent.icon}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    {agent.id}. {agent.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
                    {agent.desc}
                  </p>
                  <div style={{ 
                    padding: '12px 16px', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: 8,
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <span style={{ fontWeight: 600, color: agent.color }}>Logic:</span> {agent.details}
                  </div>
                </div>
              </div>
              
              {idx < agents.length - 1 && (
                <div style={{ 
                  position: 'absolute', bottom: -32, left: -50, 
                  color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' 
                }}>
                  <ChevronRight size={16} style={{ transform: 'rotate(90deg)', opacity: 0.5 }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="card" style={{ 
          marginTop: 40, textAlign: 'center', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1))',
          border: '1px dashed rgba(255,255,255,0.2)'
        }}>
          <h4 style={{ color: 'white', marginBottom: 8 }}>End-to-End Automation</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            The pipeline is designed to be fully autonomous. Once a resume is uploaded, 
            it flows through each agent sequentially, concluding with an automated notification 
            to the candidate and a comprehensive dashboard update for the recruiter.
          </p>
        </div>
      </div>
    </div>
  )
}
