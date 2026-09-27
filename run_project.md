# How to Run the Platform

## Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed
- Google Gemini API key

---

## Step 1 — Backend Setup

```powershell
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO: Application startup complete.
INFO: Uvicorn running on http://127.0.0.1:8000
```

---

## Step 2 — Frontend Setup

Open a **new terminal**:

```powershell
cd frontend
npm install     # only first time
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Step 3 — First Use Workflow

1. **Create a Job Description**
   - Go to "Job Descriptions" → click "New Job Description"
   - Paste your JD and save

2. **Upload Resumes**
   - Go to "Upload Resume"
   - Select your JD from the dropdown
   - Drag & drop PDF resumes
   - Click "Process Resumes with AI"
   - Wait 20–40 seconds per resume

3. **View Results**
   - **Rankings** — ranked candidate list with ATS scores
   - **ATS Analytics** — charts and score distribution
   - **Recruiter Summaries** — AI hiring recommendations
   - **Interview Questions** — per-candidate questionnaires
   - **Semantic Search** — natural language candidate search

---

## API Documentation

Visit http://localhost:8000/docs for interactive Swagger UI.

Key endpoints:
- `POST /job-descriptions/` — create JD
- `POST /upload-resume/` — process resume through agents
- `GET /rankings/` — get ranked candidates
- `GET /analytics/` — dashboard analytics
- `POST /search/` — semantic vector search
