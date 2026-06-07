# Pehchaan

**AI-powered missing person identification platform.**  
Pehchaan helps families and law enforcement find missing persons using privacy-first face recognition, vector search, and a multi-role case management workflow.

---

## Features

- **Face search** — upload a photo and match it against thousands of registered cases using 512-D face embeddings
- **Case management** — full lifecycle from report submission through police verification to confirmed match
- **Three-role system** — Citizen, Law Enforcement (Police), and Admin, each with a dedicated dashboard
- **AI pipeline** — InsightFace (buffalo_s via ONNX Runtime) for detection and embedding; Qdrant for cosine-similarity vector search
- **Admin controls** — user verification, role management, match confirmation/rejection, and activity audit log
- **Modern SaaS UI** — React + Tailwind, two-panel auth, gradient stat cards, real-time notifications

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Backend | FastAPI (Python 3.12) |
| Auth | OAuth2 + JWT |
| Metadata DB | PostgreSQL 15 |
| Vector DB | Qdrant |
| Face AI | InsightFace buffalo_s (ONNX Runtime) |
| Containers | Docker + Docker Compose |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Mac / Windows / Linux)
- Git

No local Python or Node installation required — Docker handles everything.

---

## Run with Docker (Recommended)

### 1. Clone the repository

```bash
git clone https://github.com/Parth844/lostbuddy.git
cd lostbuddy
```

### 2. Start all services

```bash
docker-compose up --build
```

> **First run:** Docker will download images, install dependencies, and download the InsightFace AI model (~100 MB). Allow **5–10 minutes**. You'll see log output — this is normal.

When you see `Uvicorn running on http://0.0.0.0:8000` the stack is ready.

### 3. Open in browser

| Service | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **Swagger docs** | http://localhost:8000/docs |
| **Qdrant dashboard** | http://localhost:6333/dashboard |

### Stop the stack

```bash
docker-compose down          # stops containers, keeps all data
# docker-compose down -v    # ⚠️  DELETES databases and embeddings — destructive
```

### Restart later (no rebuild needed)

```bash
docker-compose up
```

---

## Services

| Container | Role | Port |
|---|---|---|
| `pehchaan_frontend` | React app served by nginx | 5173 → 80 |
| `pehchaan_backend` | FastAPI + InsightFace | 8000 |
| `pehchaan_postgres` | PostgreSQL 15 (metadata) | 5433 → 5432 |
| `pehchaan_qdrant` | Qdrant (face vectors) | 6333 |

---

## Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@pehchaan.com | admin123 |

- **Citizens** are verified automatically on registration.
- **Police** accounts require admin approval before login is permitted.

---

## Local Development Setup

Use this if you want hot-reload for active development.

### Backend

```bash
cd backend

# Python 3.12 required — onnxruntime does not support 3.13+
python3.12 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

# Start Postgres and Qdrant via Docker first:
docker-compose up postgres qdrant -d

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd app
npm install
npm run dev     # http://localhost:5173
```

Create `app/.env` if needed:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Project Structure

```
lostbuddy-main/
├── app/                        # React + Vite frontend
│   ├── src/
│   │   ├── pages/              # Route-level page components
│   │   ├── components/
│   │   │   ├── shared/         # Navbar, Footer, CaseCard, StatusBadge
│   │   │   └── ui/             # shadcn/ui primitives + SearchFilters
│   │   ├── services/api.ts     # All Axios calls + JWT injection
│   │   └── index.css           # Design tokens, shadow system
│   ├── Dockerfile              # Multi-stage: node:20 build → nginx serve
│   └── nginx.conf              # SPA routing + /uploads proxy
│
├── backend/                    # FastAPI backend
│   ├── main.py                 # All routes and business logic
│   ├── db.py                   # PostgreSQL + Qdrant connections (env-driven)
│   ├── face.py                 # InsightFace embedding helper
│   └── Dockerfile              # Python 3.12 two-stage build
│
├── docker-compose.yml          # All 4 services wired together
├── .env.example                # Copy to .env to customise credentials
├── final_images/               # Registered case photos (Docker volume, not in git)
├── user_uploads/               # Search/report uploads (Docker volume, not in git)
├── pgdata/                     # PostgreSQL data (Docker volume, not in git)
└── qdrant_storage/             # Qdrant data (Docker volume, not in git)
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register (citizen auto-verified; police needs approval) |
| POST | `/auth/login` | Login → JWT token |

### Cases
| Method | Endpoint | Description |
|---|---|---|
| GET | `/cases` | Paginated list — filters: `state`, `status`, `gender`, `search`, `min_age`, `max_age`, `mine` |
| GET | `/cases/{id}` | Single case detail |
| PUT | `/cases/{id}/status` | Update status (police/admin) |
| GET | `/cases/{id}/timeline` | Status change history |
| POST | `/report/missing` | Submit new missing person report |

### Face Search
| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload-photo` | Validate face in uploaded image |
| POST | `/register-face` | Save face embedding + case to DB |
| POST | `/search` | Match photo against Qdrant; ranked results |

### Dashboard & Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/stats` | Stats for current user's role |
| GET | `/notifications` | User notifications |
| PUT | `/notifications/{id}/read` | Mark as read |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | All users |
| POST | `/admin/users/{id}/verify` | Approve police account |
| PUT | `/admin/users/{id}/role` | Change user role |
| POST | `/admin/create-admin` | Create admin account |
| GET | `/admin/activity` | System activity log |
| GET | `/admin/potential-matches` | AI-flagged matches pending review |
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
Ranked case results
```

- **Qdrant collection:** `missing_person_faces` — vector size 512, cosine distance
- `final_person_id` is the join key between Qdrant and PostgreSQL

---

## Author

**Parth Tyagi** — built as a production-style AI system for real-world missing person identification.
