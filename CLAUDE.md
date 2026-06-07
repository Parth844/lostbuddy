# Pehchaan — Claude Code Guide

## Project Overview

AI-powered missing person identification platform. Users report cases, police verify them, and an InsightFace + Qdrant pipeline matches uploaded photos against registered cases. Three roles: Citizen, Police, Admin.

- **Frontend:** `app/` — React 18 + Vite + TypeScript + Tailwind + shadcn/ui
- **Backend:** `backend/` — FastAPI (Python 3.12) with JWT auth
- **Databases:** PostgreSQL 15 (port 5433) + Qdrant (port 6333)

---

## Development Commands

### Frontend (`app/`)

```bash
cd app
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to app/dist/
npm run lint      # eslint check
```

### Backend (`backend/`)

```bash
cd backend
python3.12 -m venv venv          # MUST use Python 3.12 — 3.13+ breaks onnxruntime
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Docker (all services)

```bash
docker-compose up --build        # first run: ~10 min (downloads InsightFace model)
docker-compose up postgres qdrant -d   # start only DBs (for local backend dev)
docker-compose down              # stop, keep data
docker-compose down -v           # DANGER: deletes pgdata/ and qdrant_storage/
```

All 4 services are containerized: `pehchaan_frontend` (nginx:80→5173), `pehchaan_backend` (8000), `pehchaan_postgres` (5433→5432), `pehchaan_qdrant` (6333).

---

## Architecture

```
Frontend (React) → Axios → FastAPI → PostgreSQL (metadata)
                                   → Qdrant (face vectors)
                                   → InsightFace (ONNX embedding)
```

- PostgreSQL is on **port 5433** (not the default 5432 — Docker maps 5433→5432)
- Qdrant collection: `missing_person_faces`, vector size 512, cosine distance
- `final_person_id` is the join key between Qdrant and PostgreSQL
- Global psycopg2 `cursor`/`conn` in `db.py` — call `conn.commit()` after every write, `conn.rollback()` on exception
- `db.py` reads connection config from env vars with local-dev defaults (`POSTGRES_HOST=localhost`, `POSTGRES_PORT=5433`). In Docker, `docker-compose.yml` overrides these to `postgres:5432`.

## Image Storage

- `final_images/` — registered case photos, served at `/uploads/<filename>`
- `user_uploads/` — photos uploaded for search/report, served at `/user-uploads/<filename>`
- Both paths are resolved relative to `backend/` locally, or `/app/...` inside Docker
- Never committed to git (in `.gitignore`)

---

## Key Files

| File | Purpose |
|---|---|
| `backend/main.py` | All FastAPI routes and business logic |
| `backend/db.py` | PostgreSQL + Qdrant connections, `init_db()` schema migration |
| `backend/face.py` | `get_embedding(img)` → 512-D numpy array via InsightFace buffalo_s |
| `app/src/services/api.ts` | All Axios calls; JWT token injected from `localStorage` |
| `app/src/index.css` | Design tokens, shadow system, `.btn-primary`, `.glass`, `.dot-grid` |
| `app/src/components/shared/Navbar.tsx` | Auth-aware nav; reads `user_role`/`user_name` from localStorage |
| `app/src/components/shared/StatusBadge.tsx` | Dot + label badge; no lucide icon dependency |

---

## Auth

- JWT stored in `localStorage` as `token`; user role as `user_role`; display name as `user_name`
- Token injected by Axios request interceptor in `api.ts`
- Citizen accounts are auto-verified (`is_verified = true`) on registration
- Police accounts start unverified; admin must approve via `/admin/users/{id}/verify`
- Admin credentials: `admin@pehchaan.com` / `admin123`

---

## Design System

Use these conventions everywhere in the frontend:

- **Background:** `bg-[#F7F8FC]` (page), `bg-white` (cards)
- **Cards:** `rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.06)]`
- **Hover lift:** `hover:shadow-[0_6px_20px_rgba(15,23,42,0.09)] hover:-translate-y-0.5 transition-all duration-200`
- **Primary button:** `bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600/30 shadow-sm`
- **Stat numbers:** `font-bold font-['Sora'] text-slate-900 tracking-tight`
- **Stat labels:** `text-xs font-semibold uppercase tracking-wide text-slate-400`
- **Stat icon container:** `w-11 h-11 rounded-xl bg-gradient-to-br from-X-400 to-X-600`
- **Text primary:** `text-slate-900` (never `text-[#0B1A3E]`)
- **Text secondary:** `text-slate-500` (never `text-gray-500` or `text-gray-600`)
- **Dividers:** `border-slate-100` or `divide-slate-100/80`
- **Input focus:** `focus:border-blue-400 focus:ring-2 focus:ring-blue-100`
- **Section headings inside cards:** `text-xs font-semibold uppercase tracking-wide text-slate-400`

Do not use bare `text-gray-*`, `border-gray-*`, or `bg-gray-*` — use `slate-*` equivalents.

---

## API Conventions

- All protected routes require `Authorization: Bearer <token>` header
- `GET /cases` supports: `page`, `limit`, `search`, `status`, `state`, `gender`, `min_age`, `max_age`, `mine` (bool)
- Case status values: `submitted` → `verified` → `under-review` → `matched` / `closed` / `rejected`
- After any DB write in `main.py`, always call `conn.commit()`; wrap in try/except with `conn.rollback()`
- Qdrant point IDs must be integers — use `uuid.uuid4().int >> 64` to generate them

---

## Common Gotchas

- **Python version:** onnxruntime does not support Python 3.13+. Always use `python3.12 -m venv`.
- **PostgreSQL port:** The DB runs on host port `5433`, not `5432`. Update any DB tool connections accordingly.
- **File upload + form fields:** FastAPI cannot mix `BaseModel` body with `UploadFile` — use `Form(...)` parameters instead.
- **Image saving:** Always `await file.read()` and write bytes to disk before calling `Image.open()`. Do not pass the `UploadFile` object to PIL directly — the stream gets exhausted.
- **Vite proxy:** `/uploads` and `/user-uploads` requests in dev are proxied to `http://localhost:8000` via `vite.config.ts`. No CORS issue in dev.
- **`@` alias:** Maps to `app/src/`. Use `@/components/...`, `@/services/...`, etc.
