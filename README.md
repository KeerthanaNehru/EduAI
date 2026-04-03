# 🎓 EduAI — Intelligent Educational Platform

A full-stack AI-powered educational platform for teachers and students.
Built with **FastAPI** (backend) + **React + Vite** (frontend) + **Groq API (Llama)**.

---

## 🚀 Quick Start (Step-by-Step)

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free Groq API key (see below)

---

### Step 1 — Get Your FREE Groq API Key

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

✅ Completely free — no credit card required.

---

### Step 2 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy aiosqlite pyjwt passlib python-multipart
pip install pydantic-settings httpx PyPDF2 youtube-transcript-api python-jose bcrypt

# Create your .env file
cp .env.example .env
# Open .env and paste your Groq API key: GROQ_API_KEY=gsk_...

# Seed the database (creates sample teachers and students)
python seed.py

# Start the backend
uvicorn app.main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔑 Default Login Credentials (after running seed.py)

### Teachers
| Subject | Email | Password |
|---|---|---|
| Maths | maths@school.com | teacher123 |
| Physics | physics@school.com | teacher123 |
| Chemistry | chemistry@school.com | teacher123 |
| English | english@school.com | teacher123 |
| Tamil | tamil@school.com | teacher123 |
| Computer Science | cs@school.com | teacher123 |
| Biology | biology@school.com | teacher123 |

### Students
| Email | Password |
|---|---|
| student1@school.com | student123 |
| student2@school.com | student123 |

---

## 🤖 AI Features (Powered by Groq Llama API)

| Feature | Description |
|---|---|
| **SummaryAI** | Summarizes PDFs, documents, YouTube videos into clear bullet points |
| **QuizGenerationAI** | Auto-generates 5-question MCQ quizzes from any content |
| **DoubtClarifyingAI** | Conversational chat — ask doubts and get theory + examples |

---

## 📁 Project Structure

```
EduAI/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── groq_client.py     ← Groq AI Client (Llama)
│   │   │   ├── summary_ai.py
│   │   │   ├── quiz_ai.py
│   │   │   └── doubt_ai.py
│   │   ├── models/        ← Database models
│   │   ├── routers/       ← API endpoints
│   │   ├── schemas/       ← Pydantic schemas
│   │   ├── services/      ← PDF/YouTube extractors
│   │   ├── config.py      ← Settings
│   │   └── main.py        ← FastAPI app
│   ├── .env.example       ← Copy to .env
│   └── seed.py            ← Sample data
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.jsx      ← Animated home page
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── TeacherDashboard.jsx
        │   ├── StudentDashboard.jsx
        │   ├── StudentContent.jsx   ← File viewer fixed ✅
        │   ├── StudentAI.jsx        ← Conversational AI ✅
        │   ├── StudentQuizzes.jsx
        │   └── StudentResults.jsx
        ├── components/
        │   └── Layout.jsx
        └── App.jsx
```

---

## ✅ Bugs Fixed in This Version

1. **AI "Connection Refused" error** — Ensure you have a valid Groq API key.
2. **Students can't open files** — Added `/content/file/{id}` endpoint + frontend fetch
3. **Plain white theme** — Full dark purple/black theme throughout
4. **No landing page** — Added animated 3D network sphere landing page
5. **DoubtAI not conversational** — Upgraded to full chat interface with history

---

## 🆓 Free Resources Used

| Resource | Purpose | Cost |
|---|---|---|
| Groq Llama 3.1 8B Instant| AI (Summary, Quiz, Doubt) | Fast API |
| SQLite + aiosqlite | Database | FREE |
| FastAPI + Uvicorn | Backend server | FREE |
| React + Vite | Frontend | FREE |
| Tailwind CSS | Styling | FREE |
| PyPDF2 | PDF text extraction | FREE |
| youtube-transcript-api | YouTube transcripts | FREE |

