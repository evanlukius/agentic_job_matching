# 🤖 Evan's Job Agent

An agentic job-finder web app that scans **live job listings from JobStreet Indonesia** in real-time, scores every result against Evan Agustian Lukius's CV, and generates tailored cover letters + auto-fill form data.

---

## ✨ Features

- **Live job scanning** — hits the JobStreet Indonesia API with 8 parallel queries on every scan
- **AI match scoring** — each job is scored against the candidate's skills, education, and experience
- **Cover letter generator** — produces a tailored Bahasa Indonesia surat lamaran for any job
- **Auto-fill data** — all CV fields pre-formatted for copy-pasting into application forms
- **Smart filters** — search by keyword, work type, arrangement, min match %, date range
- **Direct apply links** — every card links straight to the JobStreet listing
- **Mark as applied** — track which jobs you've submitted to

---

## 🏗️ Architecture

```
job-agent/
├── server.js          # Express backend — proxies JobStreet API, scores jobs
├── vite.config.js     # Vite dev server with /api proxy to :3001
├── src/
│   ├── App.jsx                    # Main layout & state
│   ├── hooks/
│   │   └── useJobScan.js          # Agent orchestration hook
│   ├── components/
│   │   ├── AgentConsole.jsx       # Live terminal-style scan log
│   │   ├── CandidatePanel.jsx     # CV profile sidebar
│   │   ├── JobCard.jsx            # Expandable job card (details / cover / autofill)
│   │   ├── StatsBar.jsx           # Summary stats row
│   │   └── FilterBar.jsx          # Search & filter controls
│   └── data/
│       ├── candidateProfile.js    # Evan's CV data
│       └── agentSteps.js          # Cover letter & auto-fill generators
```

**Backend** (`server.js`) runs on port **3001** and exposes:

| Endpoint | Description |
|---|---|
| `GET /api/scan` | Fires 8 parallel JobStreet queries, deduplicates, scores, and returns ranked jobs |
| `GET /api/search?q=...&page=...` | Single keyword search against JobStreet |
| `GET /api/health` | Health check — returns current server date |

**Frontend** (Vite + React) runs on port **5173** and proxies all `/api/*` requests to the backend.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
cd job-agent
npm install
```

### Run (two terminals)

**Terminal 1 — backend API:**
```bash
node server.js
# → Job Agent API running on http://localhost:3001
```

**Terminal 2 — frontend dev server:**
```bash
npm run dev
# → http://localhost:5173
```

Then open **http://localhost:5173** and click **▶ Scan Live Jobs**.

---

## 🔍 How the Scan Works

When you click **Scan Live Jobs**, the agent:

1. Loads the candidate profile and extracts skill keywords
2. Fires **8 parallel search queries** to `id.jobstreet.com`:
   - `IT fresh graduate Indonesia`
   - `Officer Development Program IT`
   - `Management Trainee IT digital`
   - `Junior Web Developer ReactJS PHP`
   - `Cloud Engineer GCP DevOps`
   - `Data Analyst SQL Python fresh graduate`
   - `IT Business Analyst ERP`
   - `Software Engineer fresh graduate`
3. Deduplicates results by job ID
4. Scores each job (0–99%) based on keyword overlap with the candidate's skills
5. Ranks by match score and renders the results

### Match Scoring

Each job is scored against these candidate attributes:

- **Skills:** SQL, GCP, ReactJS, PHP, Python, Data Analysis, ERP, Quality Control, Web Development
- **Role types:** ODP, Management Trainee, Fresh Graduate, Cloud Engineer, Data Analyst
- **Recency bonus:** jobs posted within 3 days get +8 pts, within 7 days +5 pts
- **Full-time bonus:** +5 pts
- **Salary listed bonus:** +3 pts

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Backend | Node.js, Express |
| HTTP client | node-fetch |
| Job data source | JobStreet Indonesia (`id.jobstreet.com`) |
| Styling | Plain CSS custom properties (no framework) |

---

## 📋 Candidate Profile

All job matching and generated content is based on **Evan Agustian Lukius**:

- **Education:** S1 Information Technology, Universitas Kristen Maranatha — GPA 3.68
- **Experience:** Institutional Relations Intern (Maranatha), Quality Management Trainee (Kyosui Co., Ltd. Japan), Web Administrator (Maranatha)
- **Projects:** Bangkit Academy Cloud Computing Cohort 2024 (Google/Tokopedia/Gojek/Traveloka), KopAI capstone
- **Languages:** Indonesian (native), English (professional), Japanese (N4/N3)
- **Skills:** SQL, GCP, ReactJS, PHP, Python, Data Analysis, ERP, Microsoft Office, Quality Control

To adapt this for a different candidate, edit `src/data/candidateProfile.js` and the scoring keywords in `server.js`.

---

## 📝 Notes

- The JobStreet API is a public-facing search endpoint used by the website itself. No API key is required.
- Results reflect what is live on JobStreet Indonesia at the time of the scan.
- The backend adds a randomised session ID per request to avoid rate limiting.
- Cover letters are generated client-side from a template — no external AI API is called.
