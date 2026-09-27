import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Users, Search, Target, Mail, BarChart3, 
  ArrowRight, ShieldCheck, Zap, Globe, Sparkles,
  Briefcase, Cpu, Layers, CheckCircle2, ChevronRight, Play,
  Check, BrainCircuit, Network, MessageSquare, TrendingUp
} from 'lucide-react'

const FloatingShapes = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          position: 'absolute', top: '10%', left: '-5%', width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, transparent 60%)',
          borderRadius: '50%', filter: 'blur(60px)'
        }}
      />
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ 
          position: 'absolute', top: '20%', right: '-10%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.04) 0%, transparent 60%)',
          borderRadius: '50%', filter: 'blur(80px)'
        }}
      />
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')

  const tiles = [
    {
      icon: Network,
      title: "Agent Swarm Intelligence",
      subtitle: "7 specialized, autonomous agents orchestrating your entire recruitment funnel with precision.",
      color: "var(--accent)" // Indigo 600
    },
    {
      icon: BrainCircuit,
      title: "Deep Semantic Matching",
      subtitle: "Going beyond mere keywords. We use advanced RAG to understand true capability and potential.",
      color: "var(--accent-2)" // Violet 500
    },
    {
      icon: MessageSquare,
      title: "Hyper-Personalized Outreach",
      subtitle: "Automated engagement that feels human. Convert top passive talent with tailored messaging.",
      color: "var(--success)" // Emerald 600
    },
    {
      icon: TrendingUp,
      title: "Dynamic Candidate Ranking",
      subtitle: "Instant, multidimensional scoring ensures the absolute best talent always rises to the top.",
      color: "var(--warning)" // Amber 600
    }
  ]

  return (
    <div className="page" style={{ padding: 0, overflowX: 'hidden', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      
      {/* Navigation Bar */}
      <nav style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        width: '90%', maxWidth: 1200, height: 70, zIndex: 1000,
        background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
        borderRadius: 20, border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--accent-3))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)' }}>
            <Layers size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: 'var(--text-primary)' }}>RecruitAI</span>
        </div>
        <div className="flex-center gap-6">
          {!isLoggedIn ? (
            <>
              <button onClick={() => navigate('/login')} className="btn" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, background: 'transparent', border: 'none' }}>Sign In</button>
              <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 600 }}>
                Get Started
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 600 }}>
              Access Platform <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '90vh', display: 'flex', alignItems: 'center',
        padding: '160px 5% 80px', position: 'relative', textAlign: 'center',
        overflow: 'hidden', background: 'var(--bg-secondary)'
      }}>
        <FloatingShapes />

        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div 
              className="badge mb-8" 
              style={{ 
                padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 600, 
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '50%', width: 24, height: 24, marginRight: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                 <Sparkles size={14} color="var(--accent)" />
              </span>
              Introducing the Multi-Agent Recruitment Platform
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(48px, 6vw, 84px)', 
              fontWeight: 800, lineHeight: 1.05, marginBottom: 28,
              letterSpacing: -2, color: 'var(--text-primary)'
            }}>
              Streamline your interviews.<br/>
              <span style={{ color: 'var(--accent)' }}>Empower your hiring decisions.</span>
            </h1>
            
            <p style={{ 
              fontSize: 'clamp(18px, 2vw, 22px)', color: 'var(--text-secondary)',
              maxWidth: 750, margin: '0 auto 48px', lineHeight: 1.6,
              fontWeight: 400
            }}>
              RecruitAI orchestrates a specialized fleet of AI agents to parse, evaluate, and rank candidates, giving you the context you need to conduct focused, effective interviews.
            </p>

            <div className="flex-center gap-4" style={{ flexWrap: 'wrap' }}>
              <motion.button 
                whileHover={{ y: -2, boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
                className="btn btn-primary" 
                style={{ padding: '18px 40px', fontSize: 16, borderRadius: 14, fontWeight: 600, border: 'none' }}
              >
                Access Platform <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </motion.button>
            </div>
            
            <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={16} color="var(--success)" /> Automated ATS Parsing</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={16} color="var(--success)" /> Interviewer Analytics</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Tiles - Icon Based Grid */}
      <section style={{ padding: '100px 5%', background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16, letterSpacing: -1, color: 'var(--text-primary)' }}>The 7-Agent Architecture.</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>A collaborative swarm of intelligent agents designed to automate your entire talent pipeline.</p>
          </div>

          <div className="grid-2" style={{ gap: 24 }}>
            {tiles.map((tile, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 24, padding: 32, display: 'flex', alignItems: 'flex-start', gap: 24,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ 
                  width: 80, height: 80, background: 'var(--bg-primary)', borderRadius: 20, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)',
                  color: tile.color
                }}>
                  <tile.icon size={36} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>{tile.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>{tile.subtitle}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 600, color: tile.color, cursor: 'pointer' }}>
                    Learn more <ArrowRight size={16} style={{ marginLeft: 6 }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Presentation Section - Workflow Text Block */}
      <section style={{ padding: '120px 5%', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="grid-2" style={{ alignItems: 'center', gap: 80 }}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Semantic Engine</div>
              <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 24, lineHeight: 1.1, letterSpacing: -1, color: 'var(--text-primary)' }}>
                Stop keyword searching.<br/>Start discovering.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 36, lineHeight: 1.6 }}>
                Legacy ATS platforms filter out your best candidates because they miss a specific keyword. RecruitAI utilizes deep semantic RAG (Retrieval-Augmented Generation) to comprehend context, trajectory, and actual capability.
              </p>
              <div className="flex-col gap-5">
                 {[
                   { title: "Contextual Document Analysis", desc: "Understand skills in the context of achievements." },
                   { title: "Cross-functional Matching", desc: "Identify high-potential candidates across different titles." },
                   { title: "Automated Prescreening", desc: "Instantly generate customized technical interview questions." }
                 ].map((item, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                     <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>
                       <Check size={14} strokeWidth={3} />
                     </div>
                     <div>
                       <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 2 }}>{item.title}</div>
                       <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{item.desc}</div>
                     </div>
                   </div>
                 ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Minimalist Abstract Workflow representation instead of image */}
              <div style={{ 
                borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
                background: 'var(--bg-primary)', padding: 40, display: 'flex', flexDirection: 'column', gap: 24
              }}>
                {[
                  { label: "Resume Ingestion & Parsing", icon: Users, width: '100%', color: 'var(--accent)' },
                  { label: "Semantic Capability Mapping", icon: BrainCircuit, width: '85%', color: 'var(--accent-2)' },
                  { label: "Predictive ATS Scoring", icon: BarChart3, width: '70%', color: 'var(--warning)' },
                  { label: "Automated Interview Prep", icon: Target, width: '90%', color: 'var(--success)' },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.color }}>
                      <step.icon size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>{step.label}</div>
                       <div style={{ width: step.width, height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${step.color}, transparent)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Clean Footer CTA */}
      <section style={{ padding: '100px 5%', background: 'var(--bg-primary)' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ 
            maxWidth: 1000, margin: '0 auto', padding: '80px 40px', borderRadius: 32,
            background: '#0f172a', textAlign: 'center', position: 'relative', overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)'
          }}
        >
          {/* Subtle light flares inside dark CTA */}
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '60%', height: '200%', background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-50%', left: '-10%', width: '60%', height: '200%', background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 60%)', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, marginBottom: 20, letterSpacing: -1, color: '#fff' }}>
              Ready to start evaluating?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 18, maxWidth: 600, margin: '0 auto 40px', fontWeight: 400 }}>
              Access the interviewer dashboard to view candidate pipelines and generate targeted interview questions.
            </p>
            <div className="flex-center gap-4" style={{ flexWrap: 'wrap' }}>
               <button 
                 onClick={() => navigate('/login')} 
                 style={{ padding: '16px 32px', fontSize: 16, borderRadius: 12, fontWeight: 600, background: '#fff', color: '#0f172a', border: 'none', cursor: 'pointer' }}
               >
                 Go to Dashboard
               </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Simple Professional Footer */}
      <footer style={{ padding: '60px 5% 40px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: 'var(--text-primary)' }}>RecruitAI</span>
          </div>
          
          <div className="flex-center gap-8 mb-12" style={{ flexWrap: 'wrap' }}>
            {['Home', 'Interview Guidelines', 'Candidate Analytics', 'System Status', 'Help Center'].map((item, i) => (
              <a 
                key={i} href="#" 
                style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}
              >
                {item}
              </a>
            ))}
          </div>
          
          <div style={{ width: '100%', height: 1, background: 'var(--border)', marginBottom: 32 }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: 'var(--text-muted)', fontSize: 14 }}>
            <p>RecruitAI Internal Platform</p>
            <div style={{ display: 'flex', gap: 24 }}>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}



