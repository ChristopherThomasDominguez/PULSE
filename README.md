# PULSE — Powered by IBM watsonx

**Team BIND | CSU AI Hackathon 2026 | Healthcare & Life Sciences**

---

## The Problem

Growing up, my family didn't go to the doctor unless something was obviously broken. I played sports, I had ankle pain, and I normalized it. As an adult I found out I had flat feet — and by then, the damage was already done.

That gap between ignored symptoms and a first real visit is not unique to me. It affects millions of first-generation, low-income, and non-English-speaking patients who have no system prompting them to pay attention over time. They forget symptoms between appointments. They don't know what questions to ask. They arrive unprepared — or they don't arrive at all.

**PULSE closes that gap.**

---

## What PULSE Does

PULSE is a mobile-first agentic health check-in assistant. Users tap a body map to log symptoms in under a minute, in their own language. Three autonomous IBM watsonx agents then work in sequence — no human triggers required — to detect patterns, make an escalation decision, and generate a full visit preparation report.

**PULSE does not diagnose. It remembers, organizes, and advocates.**

### The Three-Agent Flow

```
User submits symptom check-in
        ↓
Agent 1 — Check-in Agent
Logs daily entry from body map input

        ↓
Agent 2 — Pattern Detection Agent
IBM Granite reads across all stored check-ins
Identifies recurring symptom clusters and escalating severity

        ↓
Agent 3 — Escalation + Visit Prep Agent
Decides: monitor / see doctor / urgent
Generates visit prep summary with symptom timeline
and suggested questions to bring to the appointment
```

### IBM watsonx Orchestrate

For clinical document intelligence, PULSE uses IBM watsonx Orchestrate — a manager agent coordinating two specialized sub-agents:

- **Lab Report Sub-Agent** — analyzes uploaded lab results, flags out-of-range values, generates plain-English insights and suggested questions
- **Doctor Notes Sub-Agent** — extracts diagnosis, prescriptions, key advice, and follow-up timelines from visit notes into a structured health record

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Expo (React Native, TypeScript) — iOS & Android via Expo Go |
| Navigation | Expo Router (file-based) |
| Fonts | DM Serif Display + DM Sans |
| Backend | Python FastAPI + Uvicorn |
| AI — Agentic Chain | IBM Granite (direct) via watsonx |
| AI — Document Intelligence | IBM watsonx Orchestrate |
| Storage | visits.json (local, swappable for DB) |
| Version Control | Git + GitHub |

---

## Project Structure

```
Pulse/
├── pulse/                  ← FastAPI backend
│   ├── run.py              ← server entry point
│   ├── requirements.txt
│   ├── .env.example        ← copy to .env and fill in credentials
│   └── backend/
│       ├── app.py          ← FastAPI app + CORS
│       ├── routes.py       ← all API endpoints
│       ├── config.py       ← loads .env credentials
│       ├── storage.py      ← reads/writes visits.json
│       └── agents/
│           ├── granite.py          ← IBM Granite direct calls
│           ├── prep_agent.py       ← pattern detection + visit prep
│           ├── extractor_agent.py  ← Granite fallback for note extraction
│           └── orchestrate.py      ← IBM watsonx Orchestrate integration
└── pulse-mobile/           ← Expo React Native app
    ├── app/                ← all screens (Expo Router)
    ├── components/         ← shared UI components
    ├── constants/          ← theme, colors, fonts
    └── services/
        └── api.ts          ← all backend API calls
```

---

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Expo Go app installed on your phone
- IBM Cloud account with watsonx credentials

---

### Backend Setup

```bash
# 1. Navigate to backend
cd pulse

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up credentials
cp .env.example backend/.env
# Open backend/.env and fill in your IBM credentials

# 4. Start the server
python run.py
```

Server runs at `http://localhost:8000`

Verify it works:
```bash
# Should return: {"status":"ok","granite_ready":false,"orchestrate_ready":false}
curl http://localhost:8000/api/health
```

Open `http://localhost:8000/docs` in your browser to see and test all API endpoints interactively.

---

### Mobile Setup

```bash
# 1. Navigate to mobile app
cd pulse-mobile

# 2. Install dependencies
npm install

# 3. Start Expo
npx expo start
```

Scan the QR code with Expo Go on your phone.

> **Physical device note:** If running on a real phone, update `BASE_URL` in `pulse-mobile/services/api.ts` from `localhost` to your machine's LAN IP address. Run `ipconfig` (Windows) or `ifconfig` (Mac) to find it. Example: `http://192.168.1.42:8000`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server + IBM credential status |
| GET | `/api/concerns` | All logged symptom check-ins |
| POST | `/api/log-concern` | Log a new symptom entry |
| POST | `/api/prep` | Generate AI visit prep from all concerns |
| POST | `/api/extract` | Extract structured data from doctor notes |
| POST | `/api/analyze-labs` | Analyze lab report via Orchestrate |
| POST | `/api/save-visit` | Save a visit to the health timeline |
| GET | `/api/timeline` | Full health timeline |
| POST | `/api/run-agent-chain` | **Demo endpoint** — fires all 3 agents in sequence |

---

## Running the Live Demo

The demo endpoint fires all three agents autonomously from a single POST request.

### Pre-demo checklist

```bash
# 1. Confirm backend is running
curl http://localhost:8000/api/health

# 2. Confirm 7 days of ankle data are seeded
curl http://localhost:8000/api/concerns

# 3. Confirm Expo Go is open on the Check-in screen
# 4. Have backup video ready on a separate device
```

### The live demo moment

Submit Day 8 — the entry that triggers escalation:

```bash
curl -X POST http://localhost:8000/api/run-agent-chain \
  -H "Content-Type: application/json" \
  -d '{
    "body_area": "Left lower leg / ankle",
    "symptom": "Cannot walk normally. Pain radiating up the leg.",
    "urgency_level": "high",
    "severity": 8
  }'
```

Expected response:
```json
{
  "chain_complete": true,
  "step1_logged": { ... },
  "step2_pattern": {
    "escalation_level": "urgent",
    "severity_trend": "increasing",
    ...
  },
  "step3_visit_prep": {
    "escalation_decision": "urgent",
    "suggested_questions": [ ... ],
    ...
  }
}
```

All three agents fire without any additional human input. That is the demo.

---

## Environment Variables

Copy `pulse/.env.example` to `pulse/backend/.env` and fill in:

```bash
# IBM Granite — direct text generation
WATSONX_API_KEY=
WATSONX_PROJECT_ID=
WATSONX_URL=https://us-south.ml.cloud.ibm.com
GRANITE_MODEL_ID=ibm/granite-13b-chat-v2

# IBM watsonx Orchestrate — lab + notes agents
ORCHESTRATE_URL=
ORCHESTRATE_API_KEY=
ORCHESTRATE_INSTANCE_ID=

# Feature flag — set true when Orchestrate is wired
USE_ORCHESTRATE=false
```

The app runs in mock mode with no credentials. Set `USE_ORCHESTRATE=true` only after Han has wired `orchestrate.py`.

---

## Responsible AI

PULSE is designed around responsible AI from the ground up.

- **No diagnosis** — PULSE never tells users what they have. All clinical judgment is deferred to a licensed provider.
- **Grounded generation** — IBM Granite only organizes what the user has already logged. It does not generate medical information from its own training.
- **Data ownership** — health data is stored locally. Nothing is sent anywhere except to IBM for generation tasks.
- **Transparency** — every agent output is shown to the user before any action is taken.
- **Language accessibility** — English, Spanish, Mandarin, and Tagalog by design.

---

## Team BIND

| Name | Role |
|---|---|
| Christopher Dominguez | PM + Pitch Lead |
| John Alora | AI/ML Lead — IBM Granite |
| Han Htoo Zin | AI/ML + Integration — IBM watsonx Orchestrate |
| Seth Lunas | Backend — FastAPI + storage |
| Frontend Dev | Mobile UI — Expo React Native |

---

*PULSE — Powered by IBM watsonx | CSU AI Hackathon 2026 | $10,000 prize pool*
