# 🧭 LostBuddy

LostBuddy is a full‑stack **missing person identification platform** built using **AI‑based face recognition**, designed to scale to **thousands of real records** with production‑grade architecture.

It combines **FastAPI**, **PostgreSQL**, **Qdrant**, **InsightFace**, and **Docker** to provide accurate face matching, fast filtering, and reliable case discovery.

---

## ✨ Key Features

- 🧠 AI face detection & recognition (InsightFace)
- 🔍 Face‑based search using vector similarity (Qdrant)
- 📄 Browse 8,000+ cases with backend pagination
- 🏷️ Backend filtering (State, Status, Gender)
- 🔗 Dedicated case detail API (`/cases/{id}`)
- 🖼️ Image serving from Docker volumes
- 🐳 Fully Dockerized (single‑command setup)

---

## 🧱 Tech Stack

| Layer | Technology |
|-----|-----------|
| Frontend | React + Vite |
| Backend | FastAPI |
| Metadata DB | PostgreSQL |
| Vector DB | Qdrant |
| AI | InsightFace |
| Containers | Docker & Docker Compose |

---

## 📁 Project Structure

```

lostbuddy/
├── backend/ # FastAPI backend
│ ├── main.py
│ ├── db.py
│ ├── Dockerfile
│ └── requirements.txt
│
├── frontend/ # React + Vite frontend
│ ├── src/
│ └── package.json
│
├── final_images/ # Face images (Docker volume)
├── pgdata/ # PostgreSQL data (Docker volume)
├── qdrant_storage/ # Qdrant data (Docker volume)
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md

````

> ⚠️ `final_images/`, `pgdata/`, and `qdrant_storage/` are **not committed** to GitHub.

---

## ⚙️ Prerequisites

- Docker Desktop (Mac / Windows / Linux)
- Git

No local Python or Node installation required if using Docker.

---

## 🐳 Run with Docker (Recommended)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Parth844/lostbuddy.git
cd lostbuddy
````

### 2️⃣ Create environment file

```bash
cp .env.example .env
```

### 3️⃣ Start everything

```bash
docker-compose up --build
```

⏳ First run may take time (AI model download).

---

## 🌐 Access the App

| Service          | URL                             |
| ---------------- | ------------------------------- |
| Frontend         | http://localhost:8080           |
| Backend API      | http://localhost:8000           |
| Swagger Docs     | http://localhost:8000/docs      |
| Qdrant Dashboard | http://localhost:6333/dashboard |

---

## 🔌 Backend API Overview

### `GET /cases`

- Paginated list of cases
- Supports filters:
  - `state`
  - `status`
  - `gender`
  - `page`
  - `limit`

### `GET /cases/{id}`

- Fetch **one case directly**
- Solves pagination‑related “Case not found” issues

### `POST /upload-photo`

- Upload image
- Validates face presence

### `POST /search`

- Matches uploaded face against database
- Returns ranked similarity results

---

## 🧠 Architecture Overview

```
Image Upload
   ↓
InsightFace (buffalo_s)
   ↓
512‑D Face Embedding
   ↓
Qdrant (Vector Search)
   ↓
FinalPersonId
   ↓
PostgreSQL (Metadata)
```

- **Qdrant** stores vectors only
- **PostgreSQL** stores all metadata
- Joined via `final_person_id`

---

## 📊 Performance & Scalability

- Backend pagination (SQL `LIMIT / OFFSET`)
- Backend filtering (no frontend data mismatch)
- Direct `/cases/{id}` lookup (O(1))
- Designed for **10k+ records**

---

## 🔐 Security Notes

- `.env` is never committed
- Docker volumes isolate DB data
- CORS can be restricted in production

---

## 🚀 Future Enhancements

- Role‑based access (Admin / Police / Public)
- Similarity threshold tuning
- GPU acceleration
- Audit logs
- Cloud deployment (AWS / GCP / Azure)

---

## 👨‍💻 Author

**Parth Tyagi**  
Built as a real‑world, production‑style AI system.

---

## 🏁 Status

✅ Fully working  
✅ Dockerized  
✅ Scalable  
✅ Portfolio‑ready
