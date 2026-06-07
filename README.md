# Pehchaan

**AI-powered missing person identification platform.**  
Pehchaan (formerly LostBuddy) helps families and law enforcement find missing persons using privacy-first face recognition, vector search, and a multi-role case management workflow.

---

## Features

- **Face search** — upload a photo and match it against thousands of registered cases using 512-D face embeddings
- **Case management** — full lifecycle from report submission through police verification to confirmed match
- **Three-role system** — Citizen, Law Enforcement (Police), and Admin, each with a dedicated dashboard
- **AI pipeline** — InsightFace (buffalo_s via ONNX Runtime) for detection and embedding; Qdrant for cosine-similarity vector search
- **Admin controls** — user verification, role management, match confirmation/rejection, and an activity audit log
- **Modern SaaS UI** — React + Tailwind, two-panel auth, gradient stat cards, real-time notifications

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Backend | FastAPI (Python 3.12) |
| Auth | OAuth2 + JWT (python-jose) |
| Metadata DB | PostgreSQL 15 |
| Vector DB | Qdrant |
| Face AI | InsightFace buffalo_s (ONNX Runtime) |
| Containers | Docker + Docker Compose |

---

## Project Structure

```
lostbuddy-main/
├── app/                        # React + Vite frontend
│   ├── src/
│   │   ├── pages/              # Route-level page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Cases.tsx
│   │   │   ├── CaseDetails.tsx
│   │   │   ├── ReportMissing.tsx
│   │   │   ├── SearchPerson.tsx
│   │   │   ├── TrackCase.tsx
│   │   │   ├── CitizenDashboard.tsx
│   │   │   ├── PoliceDashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── components/
│   │   │   ├── shared/         # Navbar, Footer, CaseCard, StatusBadge
│   │   │   ├── ui/             # shadcn/ui primitives + CaseCard, SearchFilters
│   │   │   └── home/           # HeroSection, HowItWorks, etc.
│   │   ├── services/
│   │   │   └── api.ts          # Axios client + all API calls
│   │   └── index.css           # Design tokens, shadow system, global styles
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                    # FastAPI backend
│   ├── main.py                 # All routes and business logic
│   ├── db.py                   # PostgreSQL connection + schema init
│   ├── face.py                 # InsightFace embedding helper
│   ├── config.py               # Environment config
│   ├── Dockerfile
│   └── requirements.txt
│
├── final_images/               # Case photo storage (Docker volume, not in git)
├── pgdata/                     # PostgreSQL data (Docker volume, not in git)
├── qdrant_storage/             # Qdrant data (Docker volume, not in git)
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

**Docker setup (recommended):**
- Docker Desktop

**Local dev setup:**
- Python 3.12 (3.13+ is incompatible with onnxruntime)
- Node.js 18+
- PostgreSQL 15 (port 5433)
- Qdrant (port 6333)

---

## Quick Start — Docker

```bash
# 1. Clone
git clone https://github.com/Parth844/lostbuddy.git
cd lostbuddy-main

# 2. Start all services
docker-compose up --build
```

First run downloads the InsightFace model (~100 MB) and seeds the database — allow 5–10 minutes.

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| Swagger docs | http://localhost:8000/docs |
| Qdrant dashboard | http://localhost:6333/dashboard |

To stop without losing data:
```bash
docker-compose down        # safe — keeps pgdata/ and qdrant_storage/
# docker-compose down -v  # DANGER: deletes all data volumes
```

---

## Local Development Setup

### Backend

```bash
cd backend

# Python 3.12 venv (system Python 3.13+ breaks onnxruntime)
python3.12 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

# Start PostgreSQL and Qdrant via Docker, then:
uvicorn main:app --reload --port 8000
```

Required environment variables (create `backend/.env`):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/faces_db
QDRANT_HOST=localhost
QDRANT_PORT=6333
SECRET_KEY=your-secret-key-here
```

### Frontend

```bash
cd app
npm install
npm run dev       # http://localhost:5173
```

Create `app/.env` if the backend is not on the default port:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@pehchaan.com | admin123 |

New citizen accounts are verified automatically. New police accounts require admin approval before login is permitted.

---

## User Roles & Flows

### Citizen
1. Register → auto-verified
2. Report a missing person (form + photo upload)
3. Browse all cases at `/cases`
4. Track own cases + receive notifications on the Citizen Dashboard
5. Upload a photo to search for a match (`/search`)

### Law Enforcement (Police)
1. Register → pending admin approval
2. Once approved, access the Police Dashboard
3. Review submitted cases, mark verified/rejected
4. Confirm or dismiss AI-flagged face matches
5. View analytics (monthly case activity chart)

### Admin
1. Full user management — verify police accounts, change roles
2. Browse AI-generated potential matches and confirm/reject them
3. Create new admin accounts
4. View system-wide activity log
5. Access aggregate stats across all roles

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user (citizen or police) |
| POST | `/auth/login` | Login → returns JWT |

### Cases

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cases` | Paginated case list with filters (`state`, `status`, `gender`, `search`, `min_age`, `max_age`, `page`, `limit`, `mine`) |
| GET | `/cases/{case_id}` | Single case detail |
| PUT | `/cases/{case_id}/status` | Update case status (police/admin) |
| GET | `/cases/{case_id}/timeline` | Status history for a case |
| POST | `/cases/{case_id}/flag-match` | Flag a potential face match |
| POST | `/report/missing` | Submit a new missing person report |

### Face Search

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload-photo` | Validate face presence in an uploaded image |
| POST | `/register-face` | Register a face embedding + save case to DB |
| POST | `/search` | Match uploaded face against Qdrant; returns ranked results |

### Dashboard & Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/stats` | Stats for the logged-in user's role |
| GET | `/notifications` | User notifications |
| PUT | `/notifications/{id}/read` | Mark notification as read |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | All users with optional role/status filters |
| POST | `/admin/users/{id}/verify` | Approve a pending police account |
| PUT | `/admin/users/{id}/role` | Change a user's role |
| POST | `/admin/create-admin` | Create a new admin account |
| GET | `/admin/activity` | System-wide activity log |
| GET | `/admin/potential-matches` | AI-flagged face matches awaiting review |
| POST | `/admin/matches/{id}/confirm` | Confirm a match |
| POST | `/admin/matches/{id}/reject` | Reject a match |

---

## AI Architecture

```
Image Upload
    ↓
InsightFace buffalo_s (ONNX Runtime)
    ↓
512-D face embedding
    ↓
Qdrant cosine similarity search
    ↓
final_person_id (ranked results)
    ↓
PostgreSQL metadata join
    ↓
Ranked case results returned to frontend
```

- **Qdrant collection:** `missing_person_faces`, vector size 512, cosine distance
- **PostgreSQL** stores all metadata; joined to Qdrant results via `final_person_id`
- Detection and embedding run in the same InsightFace call; no separate detection step

---

## Database Schema (key tables)

| Table | Purpose |
|---|---|
| `users` | Auth accounts — role, is_verified flag, profile image |
| `missing_persons` | Core case records — name, dob, location, tracing_status |
| `face_registrations` | Links a `final_person_id` to its Qdrant point ID and image path |
| `match_candidates` | AI-flagged potential matches pending human review |
| `notifications` | Per-user notifications (match found, status change, etc.) |
| `case_timeline` | Ordered status-change history for each case |
| `activity_log` | Admin audit trail |

---

## Design System

The frontend uses a custom design token layer in `src/index.css`:

- **Accent:** `#2563EB` (blue-600)
- **Background:** `#F7F8FC`
- **Text primary:** `#0F172A` (slate-900)
- **Shadow scale:** `--shadow-xs` through `--shadow-xl` (multi-layer)
- **`.btn-primary`:** gradient blue with inset highlight, hover lift
- **`.glass`:** frosted glass utility for floating chips
- **`.dot-grid`:** radial-gradient dot background pattern

---

## Author

**Parth Tyagi** — built as a production-style AI system for real-world missing person identification.
