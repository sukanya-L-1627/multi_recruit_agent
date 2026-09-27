# AI-Powered Multi-Agent Recruitment Automation Platform

> Enterprise-grade AI recruitment system where **7 autonomous agents** collaborate to automate resume screening, ATS scoring, candidate ranking, interview preparation, and HR outreach.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?logo=google)](https://ai.google.dev)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://www.sqlite.org/)
[![FAISS](https://img.shields.io/badge/FAISS-Vector%20Search-blue)](https://faiss.ai/)

---

## 🌟 Project Overview

The **Multi-Agent Recruitment Automation Platform** is a state-of-the-art AI tool designed to radically reduce the time HR teams spend on manual resume screening. 

By leveraging the power of Google's Gemini models and a suite of 7 specialized AI agents, the platform can parse resumes, match them against job descriptions (JDs), score their ATS compatibility, generate custom interview questions, provide actionable recruiter summaries, and automate candidate outreach via email.

With its sleek, modern React frontend, recruiters get real-time insights, beautifully visualized analytics, and semantic search capabilities across their entire candidate pool.

## ✨ Key Features

- **🛡️ Secure HR Authentication:** Role-based access control with JWT authentication for secure pipeline management.
- **🤖 7-Agent Autonomous Swarm:** A coordinated pipeline of specialized AI agents working sequentially on each candidate.
- **📊 Real-Time Intelligence Dashboard:** Beautifully visualized analytics using Recharts to track candidate ATS scores, skill distributions, and pipeline status.
- **🧠 FAISS Semantic Search:** Powered by `SentenceTransformers`, allowing recruiters to search candidates by concepts and meaning, not just exact keywords.
- **📄 Advanced PDF Parsing:** Extracts structured data (skills, experience, education, contact info) directly from candidate resumes.
- **⚙️ Real-Time WebSocket Updates:** Watch the agents work in real-time as they process resumes via WebSocket connections.

---

## 🏗️ The 7-Agent Pipeline Architecture

When a resume is uploaded, it is passed through an orchestrated pipeline:

```text
Upload PDF Resume 
       ↓
1. [Parser Agent] ──> Extracts structured candidate data (name, email, experience).
       ↓
2. [Skill Extractor] ─> Categorizes technical/soft skills across 8 domains.
       ↓
3. [ATS Scorer] ──────> Computes a 0-100 ATS compatibility score based on the JD.
       ↓
4. [Candidate Ranker] ─> Ranks candidates dynamically based on aggregate metrics.
       ↓
5. [Interview Agent] ─> Generates 15 custom technical & behavioral questions.
       ↓
6. [Summary Agent] ───> Creates an executive summary and a Hire/Reject recommendation.
       ↓
7. [Email Agent] ─────> (Optional) Sends automated status update emails to candidates.
       ↓
Results surface on the React Dashboard!
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, CSS Modules, Framer Motion, Lucide React, Recharts |
| **Backend** | Python 3.11, FastAPI, Uvicorn, WebSockets |
| **AI / LLMs** | Google Gemini (via `google-genai` SDK) |
| **Embeddings** | Sentence Transformers (`all-MiniLM-L6-v2`) |
| **Vector DB** | FAISS (IndexFlatIP for cosine similarity) |
| **Database** | SQLite + SQLAlchemy ORM |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- A Google Gemini API Key

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
cp .env.example .env
# Edit .env to add your GOOGLE_API_KEY and other credentials

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
*The backend will automatically create the `recruitment.db` SQLite database and required tables upon startup.*

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### Accessing the Platform
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📖 Usage Walkthrough

1. **Login**: Use the default HR credentials or create a new account on the secure login page.
2. **Create a Job Description (JD)**: Navigate to "Job Descriptions" to create a new JD specifying required skills and experience.
3. **Upload Resumes**: Go to "Upload Resume", select your target JD, optionally enable "Email Outreach", and drop multiple PDF resumes into the dropzone.
4. **Watch the Swarm**: Click "Initialize Pipeline" and watch the real-time console as the 7 AI agents analyze the resumes.
5. **View Intelligence**: Once complete, see instant ATS scores and recruiter recommendations.
6. **Analytics Dashboard**: Visit the main Dashboard to view pipeline statistics, score distributions, and top extracted skills.
7. **Semantic Search**: Use the "Semantic Search" page to find candidates using natural language queries (e.g., *"Looking for someone with deep learning and cloud architecture experience"*).
8. **Candidate Deep-Dive**: Explore the Rankings, Recruiter Summaries, and Interview Questions pages for granular insights into individual applicants.

---

## 📁 Project Structure

```text
├── backend/
│   ├── agents/              # The 7 specific AI agents
│   ├── api/                 # FastAPI routes and WebSocket definitions
│   ├── core/                # Pipeline orchestration logic
│   ├── database/            # SQLite config and SQLAlchemy ORM models
│   ├── tasks/               # Agent tasks & workflow definitions
│   ├── tools/               # External tools (PDF parser, FAISS, Gemini Client)
│   ├── resumes/             # Local storage for uploaded PDF resumes
│   └── main.py              # Application entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Sidebar, Topbar, Toast)
│   │   ├── pages/           # Application views (Dashboard, UploadResume, etc.)
│   │   ├── services/        # Axios API client setup
│   │   ├── App.jsx          # React Router configuration
│   │   └── index.css        # Global styles and design system tokens
│   └── index.html           # HTML template
```

---

## 🔒 Security Notes
- Passwords are encrypted using `bcrypt` before storage.
- API endpoints are protected via JWT Bearer authentication.
- Candidate files are securely saved locally (or can be configured for cloud storage).

## 🚀 Future Improvements
- Multi-tenant support for different companies or HR agencies.
- Integration with external ATS platforms (Workday, Greenhouse).
- Advanced email templating with SendGrid or AWS SES.
- Cloud deployment configurations (Docker, Kubernetes).
