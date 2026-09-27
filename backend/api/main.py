"""
FastAPI backend — production-ready with full CORS, logging, and error handling.
"""
import os
import sys
import shutil
import json
import logging
from typing import Optional, List, Dict
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import jwt
from core.auth import SECRET_KEY, ALGORITHM
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

# Ensure backend/ is on the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import (
    init_db, get_db, Candidate, JobDescription,
    ATSScore, RecruiterSummary, InterviewQuestion, User
)
from core.pipeline import (
    run_full_pipeline, candidate_ranking_agent, skill_extraction_agent
)
from core.auth import (
    verify_password, get_password_hash, create_access_token
)
from tools.vector_store import VectorStore

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Recruitment Platform API",
    description="Multi-Agent AI Recruitment Automation System",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── WebSocket Manager ─────────────────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"WebSocket client {client_id} connected.")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"WebSocket client {client_id} disconnected.")

    async def send_update(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending WS update: {e}")
                self.disconnect(client_id)

manager = ConnectionManager()

@app.websocket("/ws/progress/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(client_id)

# ── Startup ───────────────────────────────────────────────────────────────────
vector_store: Optional[VectorStore] = None

@app.on_event("startup")
async def startup_event():
    global vector_store
    logger.info("Initializing database...")
    init_db()
    
    # Create default HR user if not exists
    db = next(get_db())
    admin = db.query(User).filter(User.email == "sukanya@gmail.com").first()
    if not admin:
        logger.info("Creating default user sukanya@gmail.com...")
        new_user = User(
            username="sukanya",
            email="sukanya@gmail.com",
            hashed_password=get_password_hash("12345"),
            role="HR"
        )
        db.add(new_user)
        db.commit()
    
    logger.info("Initializing FAISS vector store...")
    try:
        vector_store = VectorStore()
        logger.info(f"Vector store ready. Indexed candidates: {vector_store.total_candidates}")
    except Exception as e:
        logger.warning(f"Vector store init failed (non-fatal): {e}")
    logger.info("Backend ready.")

os.makedirs("resumes", exist_ok=True)

# ── Pydantic Schemas ──────────────────────────────────────────────────────────
class JDCreate(BaseModel):
    title: str
    description: str
    required_skills: Optional[List[str]] = []
    experience_required: Optional[str] = ""

class SearchQuery(BaseModel):
    query: str
    top_k: Optional[int] = 10

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "HR"
    
class StatusUpdate(BaseModel):
    status: str

class APIKeyUpdate(BaseModel):
    gemini_api_key: str

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "running", "version": "2.0.0", "message": "AI Recruitment API"}

@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "vector_store_size": vector_store.total_candidates if vector_store else 0
    }

# ── Authentication ───────────────────────────────────────────────────────────
@app.post("/auth/register", tags=["Auth"])
def register(user: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or Email already registered")
    
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "username": new_user.username}

@app.post("/auth/login", tags=["Auth"])
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": db_user.username, "role": db_user.role})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "username": db_user.username,
        "email": db_user.email,
        "role": db_user.role,
        "has_api_key": bool(db_user.gemini_api_key)
    }

@app.post("/auth/update-api-key", tags=["Auth"])
def update_api_key(
    update: APIKeyUpdate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not logged in")
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    
    db_user = db.query(User).filter(User.username == payload.get("sub")).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.gemini_api_key = update.gemini_api_key
    db.commit()
    return {"message": "API Key saved securely."}

# ── Job Descriptions ──────────────────────────────────────────────────────────
@app.post("/job-descriptions/", tags=["Job Descriptions"])
def create_jd(jd: JDCreate, db: Session = Depends(get_db)):
    db_jd = JobDescription(
        title=jd.title,
        description=jd.description,
        required_skills=jd.required_skills,
        experience_required=jd.experience_required
    )
    db.add(db_jd)
    db.commit()
    db.refresh(db_jd)
    return {"id": db_jd.id, "title": db_jd.title, "message": "Job description created"}

@app.get("/job-descriptions/", tags=["Job Descriptions"])
def list_jds(db: Session = Depends(get_db)):
    jds = db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()
    return [{"id": j.id, "title": j.title, "created_at": str(j.created_at)} for j in jds]

@app.get("/job-descriptions/{jd_id}", tags=["Job Descriptions"])
def get_jd(jd_id: int, db: Session = Depends(get_db)):
    jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    return {"id": jd.id, "title": jd.title, "description": jd.description,
            "required_skills": jd.required_skills, "created_at": str(jd.created_at)}

# ── Resume Upload & Pipeline ──────────────────────────────────────────────────
@app.post("/upload-resume/", tags=["Candidates"])
async def upload_resume(
    file: UploadFile = File(...),
    jd_id: int = Form(...),
    send_email: bool = Form(False),
    client_id: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Get JD
    jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found.")

    # Extract user API key and inject into environment
    if authorization:
        try:
            token = authorization.replace("Bearer ", "")
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user = db.query(User).filter(User.username == payload.get("sub")).first()
            if user and user.gemini_api_key:
                os.environ["GEMINI_API_KEY"] = user.gemini_api_key
                os.environ["GOOGLE_API_KEY"] = user.gemini_api_key
        except:
            pass

    # Save file
    safe_name = file.filename.replace(" ", "_")
    file_path = os.path.join("resumes", safe_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Define progress callback
    async def progress_callback(data: dict):
        if client_id:
            await manager.send_update(client_id, {
                "type": "pipeline_update",
                "file": file.filename,
                **data
            })

    # Run full multi-agent pipeline
    result = await run_full_pipeline(
        file_path=file_path,
        jd_text=jd.description,
        job_title=jd.title,
        send_email=send_email,
        status_callback=progress_callback
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Pipeline failed"))

    parsed = result["parsed"]
    skills = result["skills"]
    ats = result["ats"]
    summary = result["summary"]
    interview_qs = result["interview_questions"]

    rec_text = summary.get("recommendation", "")
    if rec_text == "Strongly Recommend":
        status_val = "Hired"
    elif rec_text == "Recommend":
        status_val = "Shortlisted"
    elif rec_text == "Consider":
        status_val = "Review"
    else:
        status_val = "Rejected"

    # Save candidate
    candidate = Candidate(
        name=parsed.get("name", "Unknown"),
        email=parsed.get("email", ""),
        phone=parsed.get("phone", ""),
        resume_filename=safe_name,
        resume_path=file_path,
        raw_text=parsed.get("raw_text", "")[:5000],
        education=parsed.get("education", []),
        experience=parsed.get("experience", []),
        skills=skills.get("all_skills", []),
        certifications=parsed.get("certifications", []),
        projects=parsed.get("projects", []),
        years_experience=parsed.get("years_experience", 0),
        hr_status=status_val,
    )
    db.add(candidate)
    db.flush()

    # Save ATS score
    ats_record = ATSScore(
        candidate_id=candidate.id,
        job_description_id=jd.id,
        score=ats.get("score", 0),
        matched_keywords=ats.get("matched_keywords", []),
        missing_keywords=ats.get("missing_keywords", []),
        semantic_similarity=ats.get("semantic_similarity", 0),
        skill_match_percent=ats.get("skill_match_percent", 0),
    )
    db.add(ats_record)

    # Save recruiter summary
    summ_record = RecruiterSummary(
        candidate_id=candidate.id,
        summary=summary.get("summary", ""),
        strengths=summary.get("strengths", []),
        weaknesses=summary.get("weaknesses", []),
        missing_skills=summary.get("missing_skills", []),
        recommendation=summary.get("recommendation", ""),
        fit_score=summary.get("fit_score", 0),
    )
    db.add(summ_record)

    # Save interview questions
    iq_record = InterviewQuestion(
        candidate_id=candidate.id,
        technical_questions=interview_qs.get("technical_questions", []),
        behavioral_questions=interview_qs.get("behavioral_questions", []),
        project_questions=interview_qs.get("project_questions", []),
    )
    db.add(iq_record)
    db.commit()

    # Add to vector store
    if vector_store and parsed.get("raw_text"):
        try:
            vector_store.add_candidate(candidate.id, parsed["name"], parsed["raw_text"])
            candidate.embedding_stored = True
            db.commit()
        except Exception as e:
            logger.warning(f"Vector store add failed: {e}")

    return {
        "candidate_id": candidate.id,
        "name": candidate.name,
        "ats_score": ats.get("score", 0),
        "recommendation": summary.get("recommendation", ""),
        "email_result": result.get("email_result"),
        "message": "Resume processed successfully by all AI agents."
    }

# ── Candidates ────────────────────────────────────────────────────────────────
@app.get("/candidates/", tags=["Candidates"])
def list_candidates(
    skip: int = 0, limit: int = 50,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Candidate)
    if search:
        q = q.filter(Candidate.name.ilike(f"%{search}%"))
    candidates = q.order_by(Candidate.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": c.id, "name": c.name, "email": c.email, "phone": c.phone,
            "skills": c.skills or [], "years_experience": c.years_experience,
            "resume_filename": c.resume_filename, "hr_status": c.hr_status,
            "created_at": str(c.created_at)
        }
        for c in candidates
    ]

@app.patch("/candidates/{candidate_id}/status", tags=["Candidates"])
def update_candidate_status(candidate_id: int, status_update: StatusUpdate, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    c.hr_status = status_update.status
    db.commit()
    return {"message": f"Status updated to {status_update.status}", "hr_status": c.hr_status}

@app.delete("/candidates/{candidate_id}", tags=["Candidates"])
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Remove file if exists
    if c.resume_path and os.path.exists(c.resume_path):
        try: os.remove(c.resume_path)
        except: pass
        
    db.delete(c)
    db.commit()
    return {"message": f"Candidate {candidate_id} deleted."}

@app.post("/candidates/clear", tags=["Candidates"])
def clear_all_candidates(db: Session = Depends(get_db)):
    try:
        # Delete files
        resumes_dir = "resumes"
        if os.path.exists(resumes_dir):
            for f in os.listdir(resumes_dir):
                os.remove(os.path.join(resumes_dir, f))
        
        # Clear database tables
        db.query(ATSScore).delete()
        db.query(RecruiterSummary).delete()
        db.query(InterviewQuestion).delete()
        db.query(Candidate).delete()
        db.commit()
        
        # Reset vector store
        global vector_store
        if vector_store:
            vector_store.clear()
            
        return {"message": "All candidates and resumes cleared successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ── ATS Rankings ──────────────────────────────────────────────────────────────
@app.get("/rankings/", tags=["Rankings"])
def get_rankings(jd_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(ATSScore, Candidate, JobDescription).join(
        Candidate, ATSScore.candidate_id == Candidate.id
    ).join(
        JobDescription, ATSScore.job_description_id == JobDescription.id
    )
    if jd_id:
        q = q.filter(ATSScore.job_description_id == jd_id)
    results = q.order_by(ATSScore.score.desc()).all()
    rankings = []
    for i, (ats, cand, jd) in enumerate(results):
        rankings.append({
            "rank": i + 1,
            "candidate_id": cand.id,
            "name": cand.name,
            "email": cand.email,
            "ats_score": ats.score,
            "semantic_similarity": ats.semantic_similarity,
            "skill_match_percent": ats.skill_match_percent,
            "matched_keywords": ats.matched_keywords or [],
            "missing_keywords": ats.missing_keywords or [],
            "years_experience": cand.years_experience,
            "skills": cand.skills or [],
            "job_title": jd.title,
            "hr_status": cand.hr_status
        })
    return rankings

# ── Recruiter Summaries ───────────────────────────────────────────────────────
@app.get("/summaries/", tags=["Summaries"])
def get_summaries(db: Session = Depends(get_db)):
    summaries = db.query(RecruiterSummary, Candidate).join(
        Candidate, RecruiterSummary.candidate_id == Candidate.id
    ).all()
    return [
        {
            "id": s.id, "candidate_id": c.id, "name": c.name,
            "summary": s.summary, "strengths": s.strengths,
            "weaknesses": s.weaknesses, "missing_skills": s.missing_skills,
            "recommendation": s.recommendation, "fit_score": s.fit_score,
            "created_at": str(s.created_at)
        }
        for s, c in summaries
    ]

@app.get("/summaries/{candidate_id}", tags=["Summaries"])
def get_candidate_summary(candidate_id: int, db: Session = Depends(get_db)):
    s = db.query(RecruiterSummary).filter(
        RecruiterSummary.candidate_id == candidate_id
    ).order_by(RecruiterSummary.created_at.desc()).first()
    if not s:
        raise HTTPException(status_code=404, detail="Summary not found")
    return {
        "summary": s.summary, "strengths": s.strengths,
        "weaknesses": s.weaknesses, "missing_skills": s.missing_skills,
        "recommendation": s.recommendation, "fit_score": s.fit_score
    }

# ── Interview Questions ───────────────────────────────────────────────────────
@app.get("/interview-questions/{candidate_id}", tags=["Interview"])
def get_interview_questions(candidate_id: int, db: Session = Depends(get_db)):
    iq = db.query(InterviewQuestion).filter(
        InterviewQuestion.candidate_id == candidate_id
    ).order_by(InterviewQuestion.created_at.desc()).first()
    if not iq:
        raise HTTPException(status_code=404, detail="Interview questions not found")
    return {
        "technical_questions": iq.technical_questions,
        "behavioral_questions": iq.behavioral_questions,
        "project_questions": iq.project_questions
    }

# ── Semantic Search ───────────────────────────────────────────────────────────
@app.post("/search/", tags=["Search"])
def semantic_search(query: SearchQuery, db: Session = Depends(get_db)):
    if not vector_store or vector_store.total_candidates == 0:
        # Fallback: text search in DB
        candidates = db.query(Candidate).filter(
            Candidate.name.ilike(f"%{query.query}%")
        ).limit(query.top_k).all()
        return [{"candidate_id": c.id, "name": c.name, "similarity_score": 0.0} for c in candidates]

    results = vector_store.search(query.query, top_k=query.top_k)
    enriched = []
    for r in results:
        cand = db.query(Candidate).filter(Candidate.id == r["candidate_id"]).first()
        if cand:
            enriched.append({
                **r,
                "email": cand.email,
                "skills": cand.skills or [],
                "years_experience": cand.years_experience
            })
    return enriched

# ── Analytics ─────────────────────────────────────────────────────────────────
@app.get("/analytics/", tags=["Analytics"])
def get_analytics(db: Session = Depends(get_db)):
    total_candidates = db.query(Candidate).count()
    total_jds = db.query(JobDescription).count()
    ats_scores = db.query(ATSScore.score).all()
    scores = [s[0] for s in ats_scores]
    avg_score = round(sum(scores) / len(scores), 2) if scores else 0
    score_distribution = {
        "90-100": sum(1 for s in scores if s >= 90),
        "75-89": sum(1 for s in scores if 75 <= s < 90),
        "55-74": sum(1 for s in scores if 55 <= s < 75),
        "35-54": sum(1 for s in scores if 35 <= s < 55),
        "0-34": sum(1 for s in scores if s < 35),
    }
    recommendations = db.query(
        RecruiterSummary.recommendation
    ).all()
    rec_counts = {}
    for (r,) in recommendations:
        if r:
            rec_counts[r] = rec_counts.get(r, 0) + 1

    all_skills = []
    for (skills,) in db.query(Candidate.skills).all():
        if skills:
            all_skills.extend(skills)
    skill_freq = {}
    for sk in all_skills:
        skill_freq[sk] = skill_freq.get(sk, 0) + 1
    top_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:15]
    
    # Recent candidates
    recent = db.query(Candidate).order_by(Candidate.created_at.desc()).limit(5).all()
    recent_list = []
    for c in recent:
        # Get highest ATS score for this candidate
        best_ats = db.query(ATSScore.score).filter(ATSScore.candidate_id == c.id).order_by(ATSScore.score.desc()).first()
        recent_list.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "hr_status": c.hr_status,
            "ats_score": best_ats[0] if best_ats else 0
        })

    # HR Status Breakdown
    statuses = db.query(Candidate.hr_status).all()
    status_counts = {}
    for (s,) in statuses:
        s = s or "New"
        status_counts[s] = status_counts.get(s, 0) + 1

    return {
        "total_candidates": total_candidates,
        "total_jds": total_jds,
        "average_ats_score": avg_score,
        "score_distribution": score_distribution,
        "recommendation_breakdown": rec_counts,
        "status_breakdown": status_counts,
        "recent_candidates": recent_list,
        "top_skills": [{"skill": s, "count": c} for s, c in top_skills],
        "vector_store_size": vector_store.total_candidates if vector_store else 0
    }
