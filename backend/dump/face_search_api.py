import os
import uuid
import numpy as np
import psycopg2
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from deepface import DeepFace
from qdrant_client import QdrantClient

# =========================
# CONFIG
# =========================
QDRANT_COLLECTION = "face_embeddings"

POSTGRES = {
    "host": "localhost",
    "port": 5433,
    "dbname": "lostbuddy",
    "user": "lostbuddy",
    "password": "lostbuddy"
}

UPLOAD_DIR = "temp_uploads"
FACE_IMAGES_DIR = "face_crops"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================
# INIT APP
# =========================
app = FastAPI(title="LostBuddy Face Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve face images
app.mount(
    "/face-images",
    StaticFiles(directory=FACE_IMAGES_DIR),
    name="face-images"
)

# =========================
# CLIENTS
# =========================
qdrant = QdrantClient(host="localhost", port=6333)

pg = psycopg2.connect(**POSTGRES)
pg.autocommit = True

# =========================
# HEALTH CHECK
# =========================
@app.get("/")
def health():
    return {"status": "Face Search API running"}

# =========================
# FACE SEARCH
# =========================
@app.post("/search-face")
async def search_face(
    file: UploadFile = File(...),
    top_k: int = 5,
    min_score: float = 0.8
):
    ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}{ext}")

    try:
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Generate embedding
        rep = DeepFace.represent(
            img_path=file_path,
            model_name="Facenet512",
            enforce_detection=False,
            detector_backend="skip"
        )

        if not rep:
            raise ValueError("No embedding generated")

        embedding = np.array(rep[0]["embedding"])
        embedding = embedding / np.linalg.norm(embedding)

        # Qdrant search
        results = qdrant.search(
            QDRANT_COLLECTION,
            embedding.tolist(),
            limit=top_k
        )

        cur = pg.cursor()
        best_matches = {}
        current_year = datetime.now().year

        for r in results:
            person_id = r.payload.get("person_id")

            if not person_id or r.score < min_score:
                continue

            # Keep best match per person
            if (
                person_id not in best_matches
                or r.score > best_matches[person_id]["score"]
            ):
                cur.execute(
                    """
                    SELECT
                        p.name,
                        p.sex,
                        p.birth_year,
                        p.state,
                        p.district,
                        p.police_station,
                        p.tracing_status,
                        f.image_path
                    FROM persons p
                    JOIN face_embeddings f ON p.person_id = f.person_id
                    WHERE p.person_id = %s
                    LIMIT 1
                    """,
                    (person_id,)
                )

                row = cur.fetchone()
                if not row:
                    continue

                best_matches[person_id] = {
                    "person_id": person_id,
                    "score": float(r.score),
                    "name": row[0],
                    "sex": row[1],
                    "age": current_year - row[2] if row[2] else None,
                    "state": row[3],
                    "district": row[4],
                    "police_station": row[5],
                    "tracing_status": row[6],
                    "image_path": row[7]
                }

        cur.close()

        return {
            "query_image": file.filename,
            "matches": list(best_matches.values())
        }

    except Exception as e:
        print("🔥 SEARCH ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
