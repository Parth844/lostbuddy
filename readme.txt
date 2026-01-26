# 🧠 Missing Person Face Search System

This document explains **everything completed so far**, step by step, so you (or anyone else) can set up the system from scratch without confusion.

The system is designed using **industry‑grade architecture**:

- **Qdrant** → vector database (face embeddings)
- **PostgreSQL** → metadata database (name, state, police station, etc.)
- **InsightFace** → face detection & embedding
- **Docker** → run databases cleanly

---

## 📁 Project Structure (Current)

```
final_budddy/
├── final_images/              # FinalPersonId.jpg images (1 face per person)
├── faces_found.csv            # Metadata of persons with valid faces
├── faces_not_found.csv        # Persons with no usable face
├── create_qdrant_collection.py
├── ingest_embeddings.py
├── progress_checkpoint.csv    # Resume-safe checkpoint
├── qdrant_storage/            # Qdrant persistent data (Docker volume)
├── pgdata/                    # PostgreSQL persistent data (Docker volume)
└── README.md                  # This file
```

---

## 🧩 System Architecture (High Level)

```
Image (.jpg)
   ↓
InsightFace (buffalo_s)
   ↓
Face Embedding (512‑D)
   ↓
Qdrant Vector DB  ── FinalPersonId ── PostgreSQL Metadata DB
```

- **Qdrant** stores only vectors + `FinalPersonId`
- **PostgreSQL** stores all human‑readable metadata

---

## ⚙️ Prerequisites

### 1️⃣ Python Environment

```bash
python --version   # Python 3.10+ recommended
```

Create virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install insightface qdrant-client psycopg2-binary pillow numpy tqdm requests
```

---

## 🐳 Docker Setup

### 2️⃣ Verify Docker Installation

```bash
docker --version
docker ps
```

If Docker is not running (macOS):

```bash
open -a Docker
```

Wait until Docker Desktop shows **“Docker is running”**.

---

## 🧠 Start Qdrant (Vector Database)

### 3️⃣ Run Qdrant Container

```bash
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

### 4️⃣ Verify Qdrant

```bash
docker ps
```

Open dashboard in browser:

```
http://localhost:6333/dashboard
```

---

## 🗄️ Start PostgreSQL (Metadata Database)

### 5️⃣ Run PostgreSQL Container

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_DB=faces_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v $(pwd)/pgdata:/var/lib/postgresql/data \
  postgres:15
```

### 6️⃣ Verify PostgreSQL

```bash
docker ps
```

---

## 🧪 Connect to PostgreSQL (Recommended Way)

You **do not need `psql` installed locally**.

```bash
docker exec -it postgres psql -U postgres -d faces_db
```

Password:

```
postgres
```

Inside psql:

```sql
\dt
```

Exit:

```sql
\q
```

---

## 🧬 Create Qdrant Collection

### 7️⃣ Run Collection Creation Script

```bash
python create_qdrant_collection.py
```

Expected output:

```
✅ Qdrant collection created with payload index
```

(or)

```
ℹ️ Qdrant collection already exists
```

Collection details:

- Name: `missing_person_faces`
- Vector size: `512`
- Distance: `COSINE`

---

## 🧠 Dataset Preparation (Already Done)

### What exists already

- Face‑filtered images in `final_images/`
- One image per `FinalPersonId`
- `faces_found.csv` contains:

```
FinalPersonId, Name, Sex, BirthYear, State, District,
PoliceStation, TracingStatus, ImageFile
```

---

## 🚀 Embedding + Metadata Ingestion

### 8️⃣ Run Ingestion Script

```bash
python ingest_embeddings.py
```

What this script does:

- Reads `faces_found.csv`
- Loads `final_images/FP_xxx.jpg`
- Generates face embedding (`buffalo_s`)
- Inserts embedding into **Qdrant**
- Inserts metadata into **PostgreSQL**
- Skips already‑inserted `FinalPersonId`

This script is **resume‑safe**.

---

## 🔍 Verify Data After Ingestion

### Qdrant

```bash
curl http://localhost:6333/collections
```

### PostgreSQL

```bash
docker exec -it postgres psql -U postgres -d faces_db
```

```sql
SELECT COUNT(*) FROM persons;
SELECT * FROM persons LIMIT 5;
```

---

## ✅ Current Status Checklist

| Component          | Status   |
| ------------------ | -------- |
| Image dataset      | ✅ Ready |
| Face filtering     | ✅ Done  |
| Qdrant running     | ✅       |
| PostgreSQL running | ✅       |
| Vector ingestion   | ✅       |
| Metadata ingestion | ✅       |

---

## 🔜 Next Steps (Future)

- 🔍 FastAPI face search API
- 📊 Admin dashboards
- 🧠 Threshold tuning
- 🔐 Authentication
- 🚀 GPU acceleration

---

## 🏁 Summary

You now have a **fully working, end-to-end face search system**:

- React + Vite frontend
- FastAPI backend
- InsightFace face detection & embedding
- Qdrant vector database
- PostgreSQL metadata database

All components are running locally, connected, and tested via real API calls.

---

## 🌐 Backend API (Now Live)

Backend runs on:

```
http://127.0.0.1:8000
```

Swagger UI:

```
http://127.0.0.1:8000/docs
```

---

## 🔌 API Endpoints (Frontend-Compatible)

These endpoints exactly match the existing frontend `api.js`.

### 1️⃣ POST `/upload-photo`

**Purpose**: Validate whether a face exists in the uploaded image.

- Input: Image file (`multipart/form-data`)
- Output:

```json
{
  "success": true,
  "message": "Face detected"
}
```

---

### 2️⃣ POST `/match-face`

**Purpose**: Match uploaded face against database.

- Input: Image file (`multipart/form-data`)
- Output:

```json
{
  "matches": [
    {
      "FinalPersonId": "FP_xxxxx",
      "score": 0.42,
      "name": "Person Name",
      "sex": "Female",
      "birth_year": 2010,
      "state": "DELHI",
      "district": "EAST DISTRICT",
      "police_station": "XYZ",
      "tracing_status": "Untraced",
      "image_file": "FP_xxxxx.jpg"
    }
  ]
}
```

---

### 3️⃣ GET `/persons`

**Purpose**: Fetch list of stored persons (for admin / listing).

- Output: Array of persons with metadata

---

## 🧪 Verified Working Logs

The following logs confirm full system health:

```
GET /docs → 200 OK
POST /upload-photo → 200 OK
POST /match-face → 200 OK
GET /persons → 200 OK
```

Face detection and embedding warnings are **non-blocking** and expected on CPU-only macOS systems.

---

## 📊 Current Dataset Status

| Stage               | Count  |
| ------------------- | ------ |
| Persons scanned     | 12,000 |
| Faces detected      | 8,722  |
| Embeddings ingested | 8,717  |

A small difference is expected due to image quality and alignment failures.

---

## 🧠 Important Notes

- NumPy is pinned to `< 2.0` for InsightFace compatibility
- CPUExecutionProvider is used (expected on macOS)
- System is resume-safe and restart-safe

---

## 🔜 Next Planned Enhancements

- Similarity threshold tuning
- Image serving endpoint (`/images/{FinalPersonId}`)
- Pagination and filtering
- Authentication (admin vs public)
- Docker Compose (single-command startup)
- Deployment (cloud / VPS)

---

This system follows **real-world architecture used in production face search systems** and is ready for further scaling and UI integration.

///////////////////////////////////////////////////////////////

# 🧭 LostBuddy

LostBuddy is a missing person identification platform using **Face Recognition**, **FastAPI**, **PostgreSQL**, and **Qdrant**.

## 🚀 Features

- Upload & match faces using AI
- Browse 8,000+ missing person cases
- Backend pagination & filtering
- Dockerized setup (one command run)
- Image serving from backend

## 🧱 Tech Stack

- Frontend: React + Vite
- Backend: FastAPI
- Database: PostgreSQL
- Vector DB: Qdrant
- AI: InsightFace
- Containerization: Docker

## 🐳 Run with Docker (Recommended)

### 1️⃣ Clone repo

```bash
git clone https://github.com/<your-username>/lostbuddy.git
cd lostbuddy


We can polish this later with screenshots ✨)

---

## 🌍 STEP 4: Create GitHub repo (UI)

1. Go to **github.com**
2. Click **+ → New repository**
3. Repo name: `lostbuddy`
4. Description:  
   `Missing person identification system using AI & face recognition`
5. Public ✅
6. ❌ Do NOT initialize with README (you already have one)
7. Click **Create repository**

---

## 🔗 STEP 5: Push your code (commands)

Run these **from your project root**:

```bash
git init
git add .
git commit -m "Initial commit: LostBuddy full-stack setup"
git branch -M main
git remote add origin https://github.com/<your-username>/lostbuddy.git
git push -u origin main