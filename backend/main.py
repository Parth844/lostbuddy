from fastapi import FastAPI, UploadFile, File, Query, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
import numpy as np
import uuid
import os

from db import qdrant, cursor, conn, QDRANT_COLLECTION
from face import get_embedding

# ✅ Create app ONLY ONCE
app = FastAPI(title="LostBuddy Face Search API")

@app.get("/")
def root():
    return {"status": "LostBuddy API running 🚀"}

# -------------------------
# ✅ CORS MUST COME FIRST
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://jhku5paqt5rcq.ok.kimi.link", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Static files
# -------------------------
# -------------------------
# Static files
# -------------------------
# Try to find images relative to this file first (Local dev)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, "../final_images")

if not os.path.exists(IMAGES_DIR):
    # Fallback for Docker
    IMAGES_DIR = "/app/final_images"

os.makedirs(IMAGES_DIR, exist_ok=True)

print("📂 Serving images from:", IMAGES_DIR)

app.mount("/uploads", StaticFiles(directory=IMAGES_DIR), name="uploads")

# -------------------------
# Aliases
# -------------------------
@app.get("/persons")
def get_persons_alias():
    return get_cases()

# -------------------------
# Utils
# -------------------------
def load_image(file: UploadFile) -> Image.Image:
    try:
        img = Image.open(file.file).convert("RGB")
        return img
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")
    finally:
        file.file.close()


# -------------------------
# POST /upload-photo
# (validate face only)
# -------------------------
@app.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    img = load_image(file)
    emb = get_embedding(img)

    if emb is None:
        return {"success": False, "message": "No face detected"}

    return {"success": True, "message": "Face detected"}


# -------------------------
# POST /register-face
# (store new face + metadata)
# -------------------------
@app.post("/register-face")
async def register_face(
    file: UploadFile = File(...),
    name: str = Query(...),
    sex: str = Query(...),
    birth_year: int = Query(...),
    state: str = Query(...),
    district: str = Query(...),
    police_station: str = Query(...),
):
    img = load_image(file)
    emb = get_embedding(img)

    if emb is None:
        return {"success": False, "message": "No face detected"}

    final_person_id = str(uuid.uuid4())

    # Store vector in Qdrant
    qdrant.upsert(
        collection_name=QDRANT_COLLECTION,
        points=[
            {
                "id": final_person_id,
                "vector": emb.tolist(),
                "payload": {
                    "FinalPersonId": final_person_id
                }
            }
        ]
    )

    # Store metadata in PostgreSQL
    cursor.execute(
        """
        INSERT INTO persons
        (final_person_id, name, sex, birth_year, state, district, police_station, tracing_status, image_file)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            final_person_id,
            name,
            sex,
            birth_year,
            state,
            district,
            police_station,
            "missing",
            file.filename,
        )
    )

    return {
        "success": True,
        "FinalPersonId": final_person_id,
        "message": "Face registered successfully"
    }


# -------------------------
# POST /search
# -------------------------
@app.post("/search")
async def search_face(
    file: UploadFile = File(...),
    top: int = Query(5)
):
    img = load_image(file)
    emb = get_embedding(img)

    if emb is None:
        return {"success": True, "matches": [], "message": "No face detected"}

    results = qdrant.search(
        collection_name=QDRANT_COLLECTION,
        query_vector=emb.tolist(),
        limit=top
    )

    matches = []

    for r in results:
        # similarity threshold (important)
        if r.score < 0.60:
            continue

        pid = r.payload.get("FinalPersonId")

        cursor.execute(
            "SELECT * FROM persons WHERE final_person_id = %s",
            (pid,)
        )
        row = cursor.fetchone()
        if not row:
            continue

        matches.append({
            "FinalPersonId": pid,
            "score": float(r.score),
            "name": row[1],
            "sex": row[2],
            "birth_year": row[3],
            "state": row[4],
            "district": row[5],
            "police_station": row[6],
            "tracing_status": row[7],
            "image_file": row[8],
        })

    return {
        "success": True,
        "matches": matches
    }


# -------------------------
# GET /cases
# -------------------------


@app.get("/cases/{case_id}")
def get_case_by_id(case_id: str):
    cursor.execute(
        """
        SELECT final_person_id, name, sex, birth_year, state,
               district, police_station, tracing_status, image_file
        FROM persons
        WHERE final_person_id = %s
        """,
        (case_id,)
    )
    row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Case not found")

    return {
        "success": True,
        "data": {
            "final_person_id": row[0],
            "name": row[1],
            "sex": row[2],
            "birth_year": row[3],
            "state": row[4],
            "district": row[5],
            "police_station": row[6],
            "tracing_status": row[7],
            "image_file": row[8],
        },
    }

@app.post("/report/missing")
async def report_missing(
    name: str = Form(...),
    gender: str = Form(...),
    birth_year: int = Form(...),
    state: str = Form(...),
    district: str = Form(...),
    police_station: str = Form(...),
    photo: UploadFile = File(...)
):
    try:
        final_person_id = f"FP_{uuid.uuid4().hex[:12]}"

        filename = f"{final_person_id}.jpg"
        image_path = os.path.join(IMAGES_DIR, filename)

        with open(image_path, "wb") as f:
            f.write(await photo.read())

        # Proper image handling (avoid file-lock issues)
        with Image.open(image_path) as im:
            img = im.convert("RGB")

        embedding = get_embedding(img)
        if embedding is None:
            raise HTTPException(status_code=400, detail="No face detected in uploaded image")

        # Ensure embedding is a plain Python list of floats
        vector = embedding.tolist() if hasattr(embedding, "tolist") else list(embedding)

        qdrant.upsert(
            collection_name=QDRANT_COLLECTION,
            points=[
                {
                    "id": uuid.uuid4().int >> 64,
                    "vector": vector,
                    "payload": {
                        "FinalPersonId": final_person_id
                    },
                }
            ],
        )

        cursor.execute(
            """
            INSERT INTO persons (
                final_person_id,
                name,
                sex,
                birth_year,
                state,
                district,
                police_station,
                tracing_status,
                image_file
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                final_person_id,
                name,
                gender.upper(),
                birth_year,
                state.upper(),
                district.upper(),
                police_station.upper(),
                "Untraced",
                filename,
            ),
        )

        conn.commit()

        return {
            "success": True,
            "case_id": final_person_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

        
from fastapi import Query

@app.get("/dashboard/stats")
def get_dashboard_stats():
    cursor.execute("SELECT COUNT(*) FROM persons")
    total_cases = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM persons WHERE tracing_status = 'Traced'")
    traced = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM persons WHERE tracing_status IN ('Untraced', 'missing')")
    untraced = cursor.fetchone()[0]

    # Assuming 'matched' status indicates a confirmed match
    cursor.execute("SELECT COUNT(*) FROM persons WHERE tracing_status = 'matched'")
    matched = cursor.fetchone()[0]

    # 1. Status Distribution
    # We map DB tracing_status to frontend friendly labels
    # submitted: 'missing', 'Untraced'
    # verified: (custom logic or explicit status if added) - here simplifying
    # matched: 'matched'
    
    cursor.execute("""
        SELECT tracing_status, COUNT(*) 
        FROM persons 
        GROUP BY tracing_status
    """)
    status_rows = cursor.fetchall()
    
    # Init defaults
    distribution = {
        "submitted": 0,
        "verified": 0,
        "under_review": 0,
        "matched": 0,
        "closed": 0
    }
    
    for status, count in status_rows:
        s = status.lower()
        if s in ['missing', 'untraced']:
            distribution['submitted'] += count
        elif s == 'matched':
            distribution['matched'] += count
        elif s == 'verified':
            distribution['verified'] += count
        elif s == 'under-review':
            distribution['under_review'] += count
        elif s == 'closed':
            distribution['closed'] += count
        else:
            # Fallback for others
            distribution['submitted'] += count

    # 2. Weekly Activity (Last 7 days)
    # Using Postgres to_char for day name.
    # Note: If no cases on a day, it won't return a row. We handle filling gaps in Python or frontend.
    # We'll return the raw counts per day name for simplicity.
    
    cursor.execute("""
        SELECT to_char(created_at, 'Day'), COUNT(*)
        FROM persons
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY 1, EXTRACT(DOW FROM created_at)
        ORDER BY EXTRACT(DOW FROM created_at)
    """)
    activity_rows = cursor.fetchall()
    
    # Format: [{'day': 'Mon', 'cases': 5}, ...]
    weekly_activity = []
    for day, count in activity_rows:
        weekly_activity.append({"day": day.strip()[:3], "cases": count})

    return {
        "success": True,
        "stats": {
            "total_cases": total_cases,
            "traced": traced,
            "untraced": untraced,
            "matched": matched,
            "case_status_distribution": distribution,
            "weekly_activity": weekly_activity
        }
    }


@app.get("/cases")
def get_cases(
    page: int = 1,
    limit: int = 24,
    search: str | None = None,
    state: str | None = None,
    status: str | None = None,
    gender: str | None = None,
    min_age: int | None = None,
    max_age: int | None = None,
):
    offset = (page - 1) * limit
    conditions = []
    values = []

    if search:
        conditions.append("LOWER(name) LIKE %s")
        values.append(f"%{search.lower()}%")

    if state:
        conditions.append("state = %s")
        values.append(state.upper())

    if status:
        conditions.append("tracing_status = %s")
        values.append(status)

    if gender:
        conditions.append("LOWER(sex) = LOWER(%s)")
        values.append(gender)

    if min_age is not None and max_age is not None:
        import datetime
        current_year = datetime.datetime.now().year
        # Age 10 => born in 2015 (if 2025). max_birth_year
        # Age 20 => born in 2005. min_birth_year
        # Range age [10, 20] => birth_year [2005, 2015]
        # birth_year >= (current - max_age) AND birth_year <= (current - min_age)
        
        min_birth_year = current_year - max_age
        max_birth_year = current_year - min_age
        
        conditions.append("birth_year >= %s AND birth_year <= %s")
        values.append(min_birth_year)
        values.append(max_birth_year)

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    # total count
    cursor.execute(
        f"SELECT COUNT(*) FROM persons {where_clause}",
        tuple(values),
    )
    total = cursor.fetchone()[0]

    # paginated data
    cursor.execute(
        f"""
        SELECT final_person_id, name, sex, birth_year, state,
               district, police_station, tracing_status, image_file
        FROM persons
        {where_clause}
        ORDER BY final_person_id
        LIMIT %s OFFSET %s
        """,
        tuple(values + [limit, offset]),
    )

    rows = cursor.fetchall()

    return {
        "success": True,
        "page": page,
        "limit": limit,
        "total": total,
        "data": [
            {
                "final_person_id": r[0],
                "name": r[1],
                "sex": r[2],
                "birth_year": r[3],
                "state": r[4],
                "district": r[5],
                "police_station": r[6],
                "tracing_status": r[7],
                "image_file": r[8],
            }
            for r in rows
        ],
    }
