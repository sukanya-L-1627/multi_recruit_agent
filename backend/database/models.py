from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Text,
    ForeignKey, DateTime, JSON, Boolean
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database/recruitment.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, default="Unknown")
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    resume_filename = Column(String(500), nullable=False)
    resume_path = Column(String(1000), nullable=True)
    raw_text = Column(Text, nullable=True)
    education = Column(JSON, nullable=True, default=list)
    experience = Column(JSON, nullable=True, default=list)
    skills = Column(JSON, nullable=True, default=list)
    certifications = Column(JSON, nullable=True, default=list)
    projects = Column(JSON, nullable=True, default=list)
    years_experience = Column(Float, nullable=True, default=0.0)
    embedding_stored = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    hr_status = Column(String(50), default="New") # New, Shortlisted, Interviewing, Hired, Rejected

    ats_scores = relationship("ATSScore", back_populates="candidate", cascade="all, delete-orphan")
    summaries = relationship("RecruiterSummary", back_populates="candidate", cascade="all, delete-orphan")
    interview_questions = relationship("InterviewQuestion", back_populates="candidate", cascade="all, delete-orphan")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, nullable=True, default=list)
    preferred_skills = Column(JSON, nullable=True, default=list)
    experience_required = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    ats_scores = relationship("ATSScore", back_populates="job_description", cascade="all, delete-orphan")


class ATSScore(Base):
    __tablename__ = "ats_scores"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    score = Column(Float, nullable=False, default=0.0)
    matched_keywords = Column(JSON, nullable=True, default=list)
    missing_keywords = Column(JSON, nullable=True, default=list)
    semantic_similarity = Column(Float, nullable=True, default=0.0)
    skill_match_percent = Column(Float, nullable=True, default=0.0)
    experience_match = Column(Boolean, default=False)
    rank = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="ats_scores")
    job_description = relationship("JobDescription", back_populates="ats_scores")


class RecruiterSummary(Base):
    __tablename__ = "recruiter_summaries"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    summary = Column(Text, nullable=True)
    strengths = Column(JSON, nullable=True, default=list)
    weaknesses = Column(JSON, nullable=True, default=list)
    missing_skills = Column(JSON, nullable=True, default=list)
    recommendation = Column(String(50), nullable=True)
    fit_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="summaries")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    technical_questions = Column(JSON, nullable=True, default=list)
    behavioral_questions = Column(JSON, nullable=True, default=list)
    project_questions = Column(JSON, nullable=True, default=list)
    difficulty_level = Column(String(50), default="Medium")
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="interview_questions")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="HR")
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Initialize database and create all tables."""
    os.makedirs("database", exist_ok=True)
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for FastAPI to get DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
