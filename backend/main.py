from fastapi import FastAPI, UploadFile, File, Query, Form, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image
import numpy as np
import uuid
import os
import logging
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt

from db import qdrant, get_cursor, ping as db_ping, QDRANT_COLLECTION
from face import get_embedding, get_primary_face, get_all_face_embeddings
from qdrant_client.models import VectorParams, Distance
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# --- Logging ---
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("pehchaan")

# --- Auth Configuration ---
SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    SECRET_KEY = "dev-insecure-secret-change-me"
    logger.warning(
        "SECRET_KEY not set in environment — using an insecure development "
        "default. Set SECRET_KEY for any non-local deployment."
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "300"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

# --- Upload validation ---
MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))  # 10 MB


# --- Auth Models ---
class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

class TokenData(BaseModel):
    email: str | None = None

# --- database Init ---
def init_db():
    with get_cursor(commit=True) as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone VARCHAR(20),
                role VARCHAR(20) DEFAULT 'citizen',
                profile_image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS persons (
                id SERIAL PRIMARY KEY,
                final_person_id VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255),
                sex VARCHAR(10),
                birth_year INTEGER,
                state VARCHAR(100),
                district VARCHAR(100),
                police_station VARCHAR(100),
                tracing_status VARCHAR(50),
                image_file VARCHAR(255),
                reporter_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                title VARCHAR(255),
                message TEXT,
                type VARCHAR(50),
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS case_timeline (
                id SERIAL PRIMARY KEY,
                case_id VARCHAR(255),
                title VARCHAR(255),
                description TEXT,
                status VARCHAR(50),
                event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS potential_matches (
                id SERIAL PRIMARY KEY,
                case_id VARCHAR(255),
                submitted_image VARCHAR(255),
                score FLOAT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

    # Run each migration independently so one failure doesn't roll back others
    for migration in [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE",
        "ALTER TABLE persons ADD COLUMN IF NOT EXISTS reporter_id INTEGER",
        "ALTER TABLE persons ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        # Indexes on common filter columns (Phase 2) — avoid full table scans as data grows
        "CREATE INDEX IF NOT EXISTS idx_persons_state ON persons (state)",
        "CREATE INDEX IF NOT EXISTS idx_persons_tracing_status ON persons (tracing_status)",
        "CREATE INDEX IF NOT EXISTS idx_persons_reporter_id ON persons (reporter_id)",
        "CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id)",
        "CREATE INDEX IF NOT EXISTS idx_case_timeline_case_id ON case_timeline (case_id)",
    ]:
        try:
            with get_cursor(commit=True) as cursor:
                cursor.execute(migration)
        except Exception:
            logger.exception("Migration failed: %s", migration)

    try:
        with get_cursor(commit=True) as cursor:
            cursor.execute("UPDATE users SET is_verified = TRUE WHERE role != 'police'")
    except Exception:
        logger.exception("Backfill is_verified failed")

    # Normalize legacy tracing_status values to the canonical set used by the
    # frontend (submitted/verified/under-review/matched/closed). Without this,
    # status filtering silently returns nothing for migrated rows.
    try:
        with get_cursor(commit=True) as cursor:
            cursor.execute("UPDATE persons SET tracing_status = 'submitted' WHERE tracing_status IN ('missing', 'Untraced')")
            cursor.execute("UPDATE persons SET tracing_status = 'matched' WHERE tracing_status = 'Traced'")
    except Exception:
        logger.exception("Normalize tracing_status failed")

    # Ensure Qdrant collection exists
    existing = [c.name for c in qdrant.get_collections().collections]
    if QDRANT_COLLECTION not in existing:
        qdrant.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=VectorParams(size=512, distance=Distance.COSINE)
        )
        logger.info("Qdrant collection '%s' created", QDRANT_COLLECTION)

init_db()

# ✅ Create app ONLY ONCE
app = FastAPI(title="LostBuddy Face Search API")

# --- Rate limiting (abuse / DoS protection) ---
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- Auth Utils ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def seed_admin():
    with get_cursor(commit=True) as cursor:
        cursor.execute("SELECT * FROM users WHERE role = 'admin'")
        if not cursor.fetchone():
            hashed_password = get_password_hash("admin123")
            cursor.execute(
                """
                INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                ("admin@pehchaan.com", hashed_password, "System", "Admin", "0000000000", "admin", True)
            )
            logger.info("Seeded Admin User: admin@pehchaan.com / admin123")

seed_admin()

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    with get_cursor() as cursor:
        cursor.execute("SELECT * FROM users WHERE email = %s", (token_data.email,))
        user = cursor.fetchone()
    if user is None:
        raise credentials_exception
    return user

async def get_current_user_optional(token: str | None = Depends(oauth2_scheme_optional)):
    if not token:
        return None
    try:
        return await get_current_user(token)
    except HTTPException:
        return None

# --- Auth Endpoints ---

@app.post("/auth/register", response_model=Token)
async def register(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    role: str = Form("citizen"),
    photo: UploadFile = File(None)
):
    if role == "admin":
        raise HTTPException(status_code=403, detail="Admin registration is restricted")

    with get_cursor() as cursor:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

    if existing_user:
        # existing_user: id(0), email(1), hash(2), first(3), last(4), phone(5), role(6)
        if existing_user[6] == 'citizen' and role == 'police':
            # Citizen requesting an upgrade to police — confirm ownership via password
            if verify_password(password, existing_user[2]):
                with get_cursor(commit=True) as cursor:
                    cursor.execute(
                        "UPDATE users SET role='police', is_verified=FALSE WHERE id=%s",
                        (existing_user[0],)
                    )
                # Frontend detects this code as "upgrade requested, pending verification"
                raise HTTPException(status_code=409, detail="UPGRADE_REQUESTED_POLICE")
            else:
                raise HTTPException(status_code=400, detail="Account exists. Password incorrect for upgrade request.")

        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(password)

    profile_image = None
    if photo:
        await validate_upload(photo)
        filename = f"user_{uuid.uuid4().hex[:12]}.jpg"
        image_path = os.path.join(USER_IMAGES_DIR, filename)
        with open(image_path, "wb") as f:
            f.write(await photo.read())
        profile_image = filename

    try:
        is_verified = role != 'police'
        with get_cursor(commit=True) as cursor:
            cursor.execute(
                """
                INSERT INTO users (email, password_hash, first_name, last_name, phone, role, profile_image, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, role, first_name
                """,
                (email, hashed_password, first_name, last_name, phone, role, profile_image, is_verified)
            )
            new_user = cursor.fetchone()

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": email, "role": new_user[1]}, expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": new_user[1],
            "name": new_user[2]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Registration failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login", response_model=Token)
@limiter.limit("10/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2PasswordRequestForm expects username and password fields; we treat email as username
    with get_cursor() as cursor:
        cursor.execute("SELECT * FROM users WHERE email = %s", (form_data.username,))
        user = cursor.fetchone()

    # user row: id(0), email(1), hash(2), first(3), last(4), phone(5), role(6), profile_image(7), created_at(8), is_verified(9)
    if not user or not verify_password(form_data.password, user[2]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user[6] == 'police' and not user[9]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your police account is pending verification by an administrator.",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user[1], "role": user[6]}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user[6],
        "name": user[3]
    }

# --- Admin APIs ---

def check_admin_role(user: dict = Depends(get_current_user)):
    # user tuple: id(0), email(1), pass(2), first(3), last(4), phone(5), role(6)...
    if user[6] != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

@app.get("/admin/users")
def get_users(role: Optional[str] = None, verified: Optional[bool] = None, current_user = Depends(check_admin_role)):
    query = "SELECT id, first_name, last_name, email, role, is_verified, created_at FROM users"
    conditions = []
    params = []

    if role:
        conditions.append("role = %s")
        params.append(role)

    if verified is not None:
        conditions.append("is_verified = %s")
        params.append(verified)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY created_at DESC"

    with get_cursor() as cursor:
        cursor.execute(query, tuple(params))
        users = cursor.fetchall()

    return [
        {
            "id": u[0],
            "first_name": u[1],
            "last_name": u[2],
            "email": u[3],
            "role": u[4],
            "is_verified": u[5],
            "created_at": u[6]
        }
        for u in users
    ]

@app.post("/admin/users/{user_id}/verify")
def verify_user(user_id: int, current_user = Depends(check_admin_role)):
    with get_cursor(commit=True) as cursor:
        cursor.execute("UPDATE users SET is_verified = TRUE WHERE id = %s", (user_id,))
    return {"success": True, "message": "User verified successfully"}

@app.put("/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str = Query(..., regex="^(citizen|police|admin)$"),
    current_user = Depends(check_admin_role)
):
    with get_cursor(commit=True) as cursor:
        cursor.execute(
            "UPDATE users SET role = %s, is_verified = TRUE WHERE id = %s",
            (role, user_id)
        )
    return {"success": True, "message": f"User promoted to {role} successfully"}

@app.post("/admin/create-admin")
def create_admin_user(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    current_user = Depends(check_admin_role)
):
    with get_cursor() as cursor:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

    if existing_user:
        with get_cursor(commit=True) as cursor:
            cursor.execute("UPDATE users SET role = 'admin', is_verified = TRUE WHERE id = %s", (existing_user[0],))
        return {"success": True, "message": "Existing user promoted to Admin successfully"}

    hashed_password = get_password_hash(password)

    try:
        with get_cursor(commit=True) as cursor:
            cursor.execute(
                """
                INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_verified)
                VALUES (%s, %s, %s, %s, '0000000000', 'admin', TRUE)
                """,
                (email, hashed_password, first_name, last_name)
            )
        return {"success": True, "message": "Admin user created successfully"}
    except Exception as e:
        logger.exception("Admin creation failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/activity")
def get_system_activity(limit: int = 50, current_user = Depends(check_admin_role)):
    with get_cursor() as cursor:
        cursor.execute(
            """
            SELECT
                t.title,
                t.description,
                t.status,
                to_char(t.event_date, 'DD Mon YYYY, HH:MI AM'),
                t.case_id,
                p.name
            FROM case_timeline t
            LEFT JOIN persons p ON t.case_id = p.final_person_id
            ORDER BY t.event_date DESC
            LIMIT %s
            """,
            (limit,)
        )
        rows = cursor.fetchall()

    return [
        {
            "title": r[0],
            "description": r[1],
            "status": r[2],
            "date": r[3],
            "case_id": r[4],
            "case_name": r[5] or "Unknown"
        }
        for r in rows
    ]

@app.get("/")
def root():
    return {"status": "LostBuddy API running 🚀"}

@app.get("/health")
def health():
    """Readiness probe: checks PostgreSQL and Qdrant connectivity."""
    services = {}
    ok = True
    try:
        db_ping()
        services["postgres"] = "ok"
    except Exception as e:
        services["postgres"] = f"error: {e}"
        ok = False
    try:
        qdrant.get_collections()
        services["qdrant"] = "ok"
    except Exception as e:
        services["qdrant"] = f"error: {e}"
        ok = False

    payload = {"status": "ok" if ok else "degraded", "services": services}
    return JSONResponse(status_code=200 if ok else 503, content=payload)

# -------------------------
# CORS
# -------------------------
CORS_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:5173,https://jhku5paqt5rcq.ok.kimi.link",
    ).split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Static files
# -------------------------
# Try to find images relative to this file first (local dev), fall back to Docker paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, "../final_images")
USER_IMAGES_DIR = os.path.join(BASE_DIR, "../user_uploads")

if not os.path.exists(IMAGES_DIR):
    IMAGES_DIR = "/app/final_images"
    USER_IMAGES_DIR = "/app/user_uploads"

os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(USER_IMAGES_DIR, exist_ok=True)

logger.info("Serving images from: %s", IMAGES_DIR)
logger.info("Serving user uploads from: %s", USER_IMAGES_DIR)

app.mount("/uploads", StaticFiles(directory=IMAGES_DIR), name="uploads")
app.mount("/user-uploads", StaticFiles(directory=USER_IMAGES_DIR), name="user_uploads")

# -------------------------
# Aliases
# -------------------------
@app.get("/persons")
def get_persons_alias():
    return get_cases()

# -------------------------
# Utils
# -------------------------
async def validate_upload(file: UploadFile):
    """Reject non-image and oversized uploads before doing any work."""
    content_type = (file.content_type or "").lower()
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")
    # Size check: prefer the header, fall back to reading then rewinding.
    size = getattr(file, "size", None)
    if size is not None and size > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 10 MB)")


def load_image(file: UploadFile) -> Image.Image:
    try:
        # Read fully into memory so the returned Image does not depend on the
        # (about to be closed) underlying stream.
        img = Image.open(file.file).convert("RGB")
        img.load()
        return img
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")
    finally:
        file.file.close()


def notify_police_admins(cursor, title: str, message: str, notif_type: str = "match"):
    """Insert one notification per police/admin user using a single fetch."""
    cursor.execute("SELECT id FROM users WHERE role IN ('admin', 'police')")
    for (p_id,) in cursor.fetchall():
        cursor.execute(
            """
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (%s, %s, %s, %s)
            """,
            (p_id, title, message, notif_type)
        )


# -------------------------
# POST /upload-photo  (validate face only)
# -------------------------
@app.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    await validate_upload(file)
    img = load_image(file)
    emb = get_embedding(img)

    if emb is None:
        return {"success": False, "message": "No face detected"}

    return {"success": True, "message": "Face detected"}


# -------------------------
# POST /register-face  (store new face + metadata)
# -------------------------
@app.post("/register-face")
@limiter.limit("20/minute")
async def register_face(
    request: Request,
    file: UploadFile = File(...),
    name: str = Query(...),
    sex: str = Query(...),
    birth_year: int = Query(...),
    state: str = Query(...),
    district: str = Query(...),
    police_station: str = Query(...),
    current_user = Depends(get_current_user)
):
    await validate_upload(file)
    final_person_id = str(uuid.uuid4())
    filename = f"{final_person_id}.jpg"
    image_path = os.path.join(IMAGES_DIR, filename)

    # Save file to disk first so it can be served later
    with open(image_path, "wb") as f:
        f.write(await file.read())

    with Image.open(image_path) as im:
        img = im.convert("RGB")

    emb = get_embedding(img)

    if emb is None:
        os.remove(image_path)
        return {"success": False, "message": "No face detected"}

    vector = emb.tolist() if hasattr(emb, "tolist") else list(emb)

    # Atomic write: insert Postgres row first, then upsert the vector as the
    # final action. If Qdrant fails the transaction rolls back (no orphan row)
    # and we delete the saved image (no orphan file).
    try:
        with get_cursor(commit=True) as cursor:
            cursor.execute(
                """
                INSERT INTO persons
                (final_person_id, name, sex, birth_year, state, district, police_station, tracing_status, image_file, reporter_id)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    final_person_id,
                    name,
                    sex,
                    birth_year,
                    state.upper(),
                    district.upper(),
                    police_station.upper(),
                    "submitted",
                    filename,
                    current_user[0]
                )
            )
            qdrant.upsert(
                collection_name=QDRANT_COLLECTION,
                points=[
                    {
                        "id": uuid.uuid4().int >> 64,
                        "vector": vector,
                        "payload": {"FinalPersonId": final_person_id}
                    }
                ]
            )
    except Exception as e:
        if os.path.exists(image_path):
            os.remove(image_path)
        logger.exception("register_face failed")
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "success": True,
        "FinalPersonId": final_person_id,
        "message": "Face registered successfully"
    }


# -------------------------
# POST /search
# -------------------------
@app.post("/search")
@limiter.limit("30/minute")
async def search_face(
    request: Request,
    file: UploadFile = File(...),
    top: int = Query(5),
    threshold: float = Query(0.60, ge=0.0, le=1.0),
    sex: str | None = Query(None),
    state: str | None = Query(None),
):
    await validate_upload(file)
    img = load_image(file)
    face = get_primary_face(img)

    if face is None:
        return {"success": True, "matches": [], "message": "No face detected"}
    if not face["quality_ok"]:
        return {
            "success": True,
            "matches": [],
            "message": "Image quality too low — use a clearer, larger, front-facing photo.",
        }

    results = qdrant.search(
        collection_name=QDRANT_COLLECTION,
        query_vector=face["embedding"].tolist(),
        limit=top
    )

    # Keep results above threshold, then fetch all metadata in ONE query
    kept = [(r.payload.get("FinalPersonId"), float(r.score)) for r in results if r.score >= threshold]
    if not kept:
        return {"success": True, "matches": []}

    pids = [pid for pid, _ in kept]
    with get_cursor(commit=True) as cursor:
        cursor.execute(
            """
            SELECT final_person_id, name, sex, birth_year, state, district,
                   police_station, tracing_status, image_file
            FROM persons WHERE final_person_id = ANY(%s)
            """,
            (pids,)
        )
        by_pid = {row[0]: row for row in cursor.fetchall()}

        matches = []
        for pid, score in kept:
            row = by_pid.get(pid)
            if not row:
                continue

            # Automation: high-confidence match → timeline + notify police (once per match)
            if score > 0.75 and row[7] not in ['matched', 'closed']:
                cursor.execute(
                    """
                    INSERT INTO case_timeline (case_id, title, description, status)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (pid, "Potential Match Detected",
                     "A high-confidence match was found during a public search.", "under-review")
                )
                notify_police_admins(
                    cursor,
                    "Search Match Alert",
                    f"High confidence match ({int(score*100)}%) found for case {row[1]} during public search.",
                )

            # Metadata-aware re-rank: cosine stays primary, but small boosts for
            # matching gender/state nudge the truer candidates up and reduce
            # superficial false positives. Original cosine `score` is preserved.
            rerank = score
            if sex and row[2] and sex.strip().lower() == row[2].strip().lower():
                rerank += 0.03
            if state and row[4] and state.strip().upper() == row[4].strip().upper():
                rerank += 0.03

            matches.append({
                "FinalPersonId": row[0],
                "score": score,
                "rerank_score": round(rerank, 4),
                "name": row[1],
                "sex": row[2],
                "birth_year": row[3],
                "state": row[4],
                "district": row[5],
                "police_station": row[6],
                "tracing_status": row[7],
                "image_file": row[8],
            })

    matches.sort(key=lambda m: m["rerank_score"], reverse=True)
    return {"success": True, "matches": matches}


# -------------------------
# POST /search-scene  (multi-face: detect ALL faces, search each)
# -------------------------
@app.post("/search-scene")
@limiter.limit("15/minute")
async def search_scene(
    request: Request,
    file: UploadFile = File(...),
    top: int = Query(3),
    threshold: float = Query(0.60, ge=0.0, le=1.0),
):
    await validate_upload(file)
    img = load_image(file)
    w, h = img.size
    detected_faces = get_all_face_embeddings(img)

    if not detected_faces:
        return {"success": True, "image_width": w, "image_height": h, "faces": [], "message": "No faces detected in image"}

    # Search every face, collect all PIDs, then fetch metadata in one query
    per_face = []
    all_pids = set()
    for face_data in detected_faces:
        results = qdrant.search(
            collection_name=QDRANT_COLLECTION,
            query_vector=face_data["embedding"].tolist(),
            limit=top
        )
        kept = [(r.payload.get("FinalPersonId"), float(r.score)) for r in results if r.score >= threshold]
        all_pids.update(pid for pid, _ in kept)
        per_face.append((face_data, kept))

    by_pid = {}
    if all_pids:
        with get_cursor() as cursor:
            cursor.execute(
                """
                SELECT final_person_id, name, sex, birth_year, state, district,
                       police_station, tracing_status, image_file
                FROM persons WHERE final_person_id = ANY(%s)
                """,
                (list(all_pids),)
            )
            by_pid = {row[0]: row for row in cursor.fetchall()}

    face_results = []
    for face_data, kept in per_face:
        matches = []
        for pid, score in kept:
            row = by_pid.get(pid)
            if not row:
                continue
            matches.append({
                "FinalPersonId": row[0],
                "score": score,
                "name": row[1],
                "sex": row[2],
                "birth_year": row[3],
                "state": row[4],
                "district": row[5],
                "police_station": row[6],
                "tracing_status": row[7],
                "image_file": row[8],
            })
        face_results.append({
            "face_index": face_data["face_index"],
            "bbox": face_data["bbox"],
            "matches": matches,
        })

    return {
        "success": True,
        "image_width": w,
        "image_height": h,
        "faces": face_results,
    }


# -------------------------
# GET /cases/{id}
# -------------------------
@app.get("/cases/{case_id}")
def get_case_by_id(case_id: str):
    with get_cursor() as cursor:
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

@app.post("/cases/{case_id}/flag-match")
@limiter.limit("20/minute")
async def flag_potential_match(
    request: Request,
    case_id: str,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    await validate_upload(file)
    filename = f"match_{uuid.uuid4().hex[:12]}.jpg"
    image_path = os.path.join(USER_IMAGES_DIR, filename)

    with open(image_path, "wb") as f:
        f.write(await file.read())

    try:
        with get_cursor(commit=True) as cursor:
            cursor.execute("SELECT name FROM persons WHERE final_person_id = %s", (case_id,))
            person = cursor.fetchone()
            if not person:
                raise HTTPException(status_code=404, detail="Case not found")
            person_name = person[0]

            cursor.execute(
                """
                INSERT INTO case_timeline (case_id, title, description, status)
                VALUES (%s, %s, %s, %s)
                """,
                (case_id, "Potential Match Flagged",
                 f"User #{current_user[0]} flagged a potential match with photo evidence.", "under-review")
            )
            cursor.execute(
                """
                INSERT INTO potential_matches (case_id, submitted_image, status)
                VALUES (%s, %s, 'pending')
                """,
                (case_id, filename)
            )
            notify_police_admins(
                cursor,
                "Match Review Required",
                f"New potential match flagged for Case {person_name}. Please review evidence.",
            )
    except HTTPException:
        if os.path.exists(image_path):
            os.remove(image_path)
        raise
    except Exception as e:
        if os.path.exists(image_path):
            os.remove(image_path)
        logger.exception("flag_potential_match failed")
        raise HTTPException(status_code=500, detail=str(e))

    return {"success": True, "message": "Match flagged and evidence submitted for review."}

# --- Match Review APIs ---

@app.get("/admin/potential-matches")
def get_potential_matches(current_user = Depends(check_admin_role)):
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT
                pm.id, pm.case_id, pm.submitted_image, pm.status, pm.created_at,
                p.name, p.image_file, p.district, p.state, p.reporter_id
            FROM potential_matches pm
            JOIN persons p ON pm.case_id = p.final_person_id
            WHERE pm.status = 'pending'
            ORDER BY pm.created_at DESC
        """)
        rows = cursor.fetchall()

    return [
        {
            "id": r[0],
            "case_id": r[1],
            "submitted_image": r[2],
            "status": r[3],
            "created_at": r[4],
            "case_name": r[5],
            "case_image": r[6],
            "location": f"{r[7]}, {r[8]}",
            "reporter_id": r[9]
        }
        for r in rows
    ]

@app.post("/admin/matches/{match_id}/confirm")
def confirm_match(match_id: int, current_user = Depends(check_admin_role)):
    with get_cursor(commit=True) as cursor:
        cursor.execute("SELECT case_id, submitted_image FROM potential_matches WHERE id = %s", (match_id,))
        match = cursor.fetchone()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")

        case_id = match[0]

        cursor.execute("UPDATE potential_matches SET status = 'confirmed' WHERE id = %s", (match_id,))
        cursor.execute("UPDATE persons SET tracing_status = 'matched' WHERE final_person_id = %s", (case_id,))
        cursor.execute(
            """
            INSERT INTO case_timeline (case_id, title, description, status)
            VALUES (%s, %s, %s, 'matched')
            """,
            (case_id, "Match Confirmed", "Administrative review confirmed the potential match.",)
        )

        cursor.execute("SELECT reporter_id, name FROM persons WHERE final_person_id = %s", (case_id,))
        person_row = cursor.fetchone()
        if person_row and person_row[0]:
            cursor.execute(
                """
                INSERT INTO notifications (user_id, title, message, type)
                VALUES (%s, %s, %s, 'match')
                """,
                (person_row[0], "Match FOUND!",
                 f"Great news! A match has been confirmed for {person_row[1]}. Please contact police.",)
            )

    return {"success": True, "message": "Match confirmed and reporter notified."}

@app.post("/admin/matches/{match_id}/reject")
def reject_match(match_id: int, current_user = Depends(check_admin_role)):
    with get_cursor(commit=True) as cursor:
        cursor.execute("UPDATE potential_matches SET status = 'rejected' WHERE id = %s", (match_id,))
    return {"success": True, "message": "Match rejected."}

@app.post("/report/missing")
@limiter.limit("20/minute")
async def report_missing(
    request: Request,
    name: str = Form(...),
    gender: str = Form(...),
    birth_year: int = Form(...),
    state: str = Form(...),
    district: str = Form(...),
    police_station: str = Form(...),
    photo: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    await validate_upload(photo)
    final_person_id = f"FP_{uuid.uuid4().hex[:12]}"
    filename = f"{final_person_id}.jpg"
    image_path = os.path.join(IMAGES_DIR, filename)

    with open(image_path, "wb") as f:
        f.write(await photo.read())

    with Image.open(image_path) as im:
        img = im.convert("RGB")

    embedding = get_embedding(img)
    if embedding is None:
        if os.path.exists(image_path):
            os.remove(image_path)
        raise HTTPException(status_code=400, detail="No face detected in uploaded image")

    vector = embedding.tolist() if hasattr(embedding, "tolist") else list(embedding)

    # Check for matches against EXISTING records before inserting self (no self-match)
    search_results = qdrant.search(
        collection_name=QDRANT_COLLECTION,
        query_vector=vector,
        limit=5
    )
    match_found = any(
        r.score > 0.65 and r.payload.get("FinalPersonId") != final_person_id
        for r in search_results
    )

    # Atomic write: Postgres rows first, Qdrant upsert as the final action.
    try:
        with get_cursor(commit=True) as cursor:
            cursor.execute(
                """
                INSERT INTO persons (
                    final_person_id, name, sex, birth_year, state, district,
                    police_station, tracing_status, image_file, reporter_id
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    final_person_id, name, gender.upper(), birth_year,
                    state.upper(), district.upper(), police_station.upper(),
                    "submitted", filename, current_user[0]
                ),
            )
            cursor.execute(
                """
                INSERT INTO case_timeline (case_id, title, description, status)
                VALUES (%s, %s, %s, %s)
                """,
                (final_person_id, "Case Submitted", "Report has been submitted and is pending verification.", "submitted")
            )
            if match_found:
                notify_police_admins(
                    cursor,
                    "Potential Match Found",
                    f"A new case ({name}) matches an existing record.",
                )
            qdrant.upsert(
                collection_name=QDRANT_COLLECTION,
                points=[
                    {
                        "id": uuid.uuid4().int >> 64,
                        "vector": vector,
                        "payload": {"FinalPersonId": final_person_id},
                    }
                ],
            )
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(image_path):
            os.remove(image_path)
        logger.exception("report_missing failed")
        raise HTTPException(status_code=500, detail=str(e))

    return {"success": True, "case_id": final_person_id}


@app.get("/dashboard/stats")
def get_dashboard_stats():
    with get_cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM persons")
        total_cases = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM persons WHERE tracing_status = 'matched'")
        traced = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM persons WHERE tracing_status IN ('submitted', 'Untraced', 'missing')")
        untraced = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM persons WHERE tracing_status = 'matched'")
        matched = cursor.fetchone()[0]

        cursor.execute("""
            SELECT tracing_status, COUNT(*)
            FROM persons
            GROUP BY tracing_status
        """)
        status_rows = cursor.fetchall()

        cursor.execute("""
            SELECT to_char(created_at, 'Mon'), COUNT(*)
            FROM persons
            WHERE created_at >= NOW() - INTERVAL '12 months'
            GROUP BY 1, EXTRACT(MONTH FROM created_at)
            ORDER BY EXTRACT(MONTH FROM created_at)
        """)
        activity_rows = cursor.fetchall()

    distribution = {
        "submitted": 0,
        "verified": 0,
        "under_review": 0,
        "matched": 0,
        "closed": 0
    }
    for status_val, count in status_rows:
        s = (status_val or "").lower()
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
            distribution['submitted'] += count

    yearly_activity = [{"month": month_name, "cases": count} for month_name, count in activity_rows]

    return {
        "success": True,
        "stats": {
            "total_cases": total_cases,
            "traced": traced,
            "untraced": untraced,
            "matched": matched,
            "case_status_distribution": distribution,
            "yearly_activity": yearly_activity
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
    mine: bool = False,
    current_user: Token = Depends(get_current_user_optional)
):
    user_id = None
    if mine:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required for 'mine' filter")
        user_id = current_user[0]
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
        min_birth_year = current_year - max_age
        max_birth_year = current_year - min_age
        conditions.append("birth_year >= %s AND birth_year <= %s")
        values.append(min_birth_year)
        values.append(max_birth_year)

    if mine and user_id:
        conditions.append("reporter_id = %s")
        values.append(user_id)

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    with get_cursor() as cursor:
        cursor.execute(f"SELECT COUNT(*) FROM persons {where_clause}", tuple(values))
        total = cursor.fetchone()[0]

        cursor.execute(
            f"""
            SELECT final_person_id, name, sex, birth_year, state,
                   district, police_station, tracing_status, image_file
            FROM persons
            {where_clause}
            ORDER BY created_at DESC
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

# --- Notifications & Case Status ---

@app.get("/notifications")
def get_notifications(current_user: Token = Depends(get_current_user)):
    user_id = current_user[0]
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT id, title, message, type, is_read, to_char(created_at, 'YYYY-MM-DD HH24:MI')
            FROM notifications
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
        rows = cursor.fetchall()

    return {
        "success": True,
        "notifications": [
            {
                "id": str(r[0]),
                "title": r[1],
                "message": r[2],
                "type": r[3],
                "read": r[4],
                "date": r[5]
            }
            for r in rows
        ]
    }

@app.put("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, current_user: Token = Depends(get_current_user)):
    user_id = current_user[0]
    with get_cursor(commit=True) as cursor:
        cursor.execute(
            "UPDATE notifications SET is_read = TRUE WHERE id = %s AND user_id = %s",
            (notification_id, user_id)
        )
    return {"success": True}

class CaseStatusUpdate(BaseModel):
    status: str

@app.put("/cases/{case_id}/status")
def update_case_status(
    case_id: str,
    status_update: CaseStatusUpdate,
    current_user: Token = Depends(get_current_user)
):
    role = current_user[6]
    if role not in ['police', 'admin']:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_status = status_update.status

    db_status = new_status
    if new_status == 'rejected':
        db_status = 'closed'
    elif new_status == 'match-confirmed':
        db_status = 'matched'

    with get_cursor(commit=True) as cursor:
        cursor.execute("SELECT reporter_id, name FROM persons WHERE final_person_id = %s", (case_id,))
        case_row = cursor.fetchone()
        if not case_row:
            raise HTTPException(status_code=404, detail="Case not found")

        reporter_id = case_row[0]
        person_name = case_row[1]

        cursor.execute(
            "UPDATE persons SET tracing_status = %s WHERE final_person_id = %s",
            (db_status, case_id)
        )

        if reporter_id:
            title = "Case Update"
            message = f"Status updated to '{new_status}' for missing person: {person_name}"
            notif_type = "update"

            if new_status == 'matched':
                title = "Match Confirmed"
                message = f"Great news! A match has been confirmed for {person_name}."
                notif_type = "match"
            elif new_status == 'rejected':
                title = "Case Closed"
                notif_type = "alert"

            cursor.execute(
                """
                INSERT INTO notifications (user_id, title, message, type)
                VALUES (%s, %s, %s, %s)
                """,
                (reporter_id, title, message, notif_type)
            )

        timeline_title = "Status Update"
        timeline_desc = f"Case status updated to {new_status}."
        if new_status == 'verified':
            timeline_title = "Information Verified"
            timeline_desc = "Case information has been verified by police."
        elif new_status == 'rejected':
            timeline_title = "Case Closed (Rejected)"
            timeline_desc = "Case has been rejected and closed."
        elif new_status == 'matched':
            timeline_title = "Match Confirmed"
            timeline_desc = "A match has been confirmed. Police are coordinating."
        elif new_status == 'closed':
            timeline_title = "Case Closed"
            timeline_desc = "Case has been resolved and closed."

        cursor.execute(
            """
            INSERT INTO case_timeline (case_id, title, description, status)
            VALUES (%s, %s, %s, %s)
            """,
            (case_id, timeline_title, timeline_desc, db_status)
        )

    return {"success": True}

@app.get("/cases/{case_id}/timeline")
def get_case_timeline(case_id: str):
    with get_cursor() as cursor:
        cursor.execute(
            """
            SELECT title, description, status, to_char(event_date, 'DD Mon YYYY, HH:MI AM')
            FROM case_timeline
            WHERE case_id = %s
            ORDER BY event_date DESC
            """,
            (case_id,)
        )
        rows = cursor.fetchall()

    return {
        "success": True,
        "timeline": [
            {
                "title": r[0],
                "description": r[1],
                "status": r[2],
                "date": r[3]
            }
            for r in rows
        ]
    }
