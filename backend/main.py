from fastapi import FastAPI, UploadFile, File, Query, Form, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from PIL import Image
import numpy as np
import uuid
import os
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt

from db import qdrant, cursor, conn, QDRANT_COLLECTION
from face import get_embedding

# --- Auth Configuration ---
SECRET_KEY = "your-secret-key-keep-it-secret"  # In production, use env var
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

# --- Auth Models ---
# UserCreate is now handled via Form parameters manually in the endpoint due to file upload
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
    conn.commit()
    
    # Migration: Add profile_image if not exists (for existing tables)
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255)")
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255)")
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE")
        cursor.execute("ALTER TABLE persons ADD COLUMN IF NOT EXISTS reporter_id INTEGER")
        cursor.execute("ALTER TABLE persons ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
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
        # Auto-verify existing citizens/admins if any
        # Auto-verify existing citizens/admins if any
        cursor.execute("UPDATE users SET is_verified = TRUE WHERE role != 'police'")
        conn.commit()
    except Exception:
        conn.rollback()

init_db()

# ✅ Create app ONLY ONCE
app = FastAPI(title="LostBuddy Face Search API")

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
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def seed_admin():
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
        conn.commit()
        print("✅ Seeded Admin User: admin@pehchaan.com / admin123")

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
    except:
        return None

# --- Auth Endpoints ---

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

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()
    if existing_user:
        # existing_user: id(0), email(1), hash(2), first(3), last(4), phone(5), role(6)
        if existing_user[6] == 'citizen' and role == 'police':
            # Handle Upgrade Request
            # Check password to confirm ownership
            if verify_password(password, existing_user[2]):
                cursor.execute("UPDATE users SET role='police', is_verified=FALSE WHERE id=%s", (existing_user[0],))
                conn.commit()
                # We return a specific structure that frontend can detect
                # We return a dummy token structure but with a special flag/message OR just valid response?
                # Frontend expects Token. But if we return Token, the user will be logged in as "police" (unverified).
                # Unverified police cannot access dashboard. ProtectedRoute will redirect them?
                # Actually login endpoint blocks unverified police.
                # So if we return token, front end stores it.
                # User tries to navigate to /dashboard/police.
                # ProtectedRoute checks role 'police'. It allows.
                # But PoliceDashboard might fail or backend APIs might fail if they check verification?
                # Let's see: check_admin_role checks "admin". get_current_user doesn't check verification.
                # So they WOULD get access unless we block unverified in get_current_user.
                # WE MUST BLOCK unverified police in get_current_user or specific APIs.
                # But for now, let's just return a 202 or similar to indicate "request pending" and NOT return a token.
                # But frontend expects Token response model.
                # Let's raise an HTTPException with a specific detail string that frontend detects?
                # No, that's ugly.
                # Let's return a Token but with a role that indicates pending? No.
                
                # Best approach: Return a JSONResponse with 200 and a 'message' key, bypassing response_model validation?
                # FASTAPI validates response_model.
                # Let's use a specific exception that frontend treats as "Upgrade Success".
                raise HTTPException(status_code=409, detail="UPGRADE_REQUESTED_POLICE")
            else:
                raise HTTPException(status_code=400, detail="Account exists. Password incorrect for upgrade request.")
        
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(password)
    
    profile_image = None
    if photo:
        filename = f"user_{uuid.uuid4().hex[:12]}.jpg"
        image_path = os.path.join(USER_IMAGES_DIR, filename)
        with open(image_path, "wb") as f:
            f.write(await photo.read())
        profile_image = filename
    
    try:
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, first_name, last_name, phone, role, profile_image)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, role, first_name
            """,
            (email, hashed_password, first_name, last_name, phone, role, profile_image)
        )
        new_user = cursor.fetchone()
        conn.commit()
        
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
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2PasswordRequestForm expects username and password fields
    # We'll treat email as username
    cursor.execute("SELECT * FROM users WHERE email = %s", (form_data.username,))
    user = cursor.fetchone()
    
    # user row: id(0), email(1), hash(2), first(3), last(4), phone(5), role(6)
    if not user or not verify_password(form_data.password, user[2]): # password_hash is at index 2
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
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
    # user tuple from DB. We need to check role field.
    # Cursor.fetchone returns tuple. We need to map it carefully or fetch by dict.
    # Current get_current_user returns the full row tuple.
    # Based on init_db: id(0), email(1), pass(2), first(3), last(4), phone(5), role(6)...
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
    
    # Handle boolean filter
    if verified is not None:
        conditions.append("is_verified = %s")
        params.append(verified)
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    query += " ORDER BY created_at DESC"
    
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
    cursor.execute("UPDATE users SET is_verified = TRUE WHERE id = %s", (user_id,))
    conn.commit()
    return {"success": True, "message": "User verified successfully"}

@app.put("/admin/users/{user_id}/role")
def update_user_role(
    user_id: int, 
    role: str = Query(..., regex="^(citizen|police|admin)$"), 
    current_user = Depends(check_admin_role)
):
    # Promote to target role and auto-verify
    cursor.execute(
        "UPDATE users SET role = %s, is_verified = TRUE WHERE id = %s", 
        (role, user_id)
    )
    conn.commit()
    return {"success": True, "message": f"User promoted to {role} successfully"}

@app.post("/admin/create-admin")
def create_admin_user(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    current_user = Depends(check_admin_role)
):
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()
    if existing_user:
        # If user exists, just promote them to admin
        cursor.execute("UPDATE users SET role = 'admin', is_verified = TRUE WHERE id = %s", (existing_user[0],))
        conn.commit()
        return {"success": True, "message": "Existing user promoted to Admin successfully"}
    
    hashed_password = get_password_hash(password)
    
    try:
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_verified)
            VALUES (%s, %s, %s, %s, '0000000000', 'admin', TRUE)
            """,
            (email, hashed_password, first_name, last_name)
        )
        conn.commit()
        return {"success": True, "message": "Admin user created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/activity")
def get_system_activity(limit: int = 50, current_user = Depends(check_admin_role)):
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
# Try to find images relative to this file first (Local dev)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, "../final_images")
USER_IMAGES_DIR = os.path.join(BASE_DIR, "../user_uploads")

if not os.path.exists(IMAGES_DIR):
    # Fallback for Docker
    IMAGES_DIR = "/app/final_images"
    USER_IMAGES_DIR = "/app/user_uploads"

os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(USER_IMAGES_DIR, exist_ok=True)

print("📂 Serving images from:", IMAGES_DIR)
print("📂 Serving user uploads from:", USER_IMAGES_DIR)

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
    current_user = Depends(get_current_user)
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
        (final_person_id, name, sex, birth_year, state, district, police_station, tracing_status, image_file, reporter_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
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
            police_station,
            "missing",
            file.filename,
            current_user[0]
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
            
        # --- AUTOMATION: New Match Detected via Search ---
        # If high confidence match found (e.g. > 0.75), log to timeline & notify police
        # Use a slightly higher threshold for automated alerts to avoid spam
        if r.score > 0.75:
             # Check if we already logged this match recently to avoid spam? 
             # For MVP, we just log it. Alternatively check if status is already 'matched'.
             current_status = row[7] # tracing_status
             if current_status not in ['matched', 'closed']:
                 # 1. Update Timeline
                 cursor.execute(
                    """
                    INSERT INTO case_timeline (case_id, title, description, status)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (pid, "Potential Match Detected", "A high-confidence match was found during a public search.", "under-review")
                 )
                 
                 # 2. Notify Police
                 # We only notify if we haven't already (optimization omitted for MVP longevity)
                 cursor.execute("SELECT id FROM users WHERE role IN ('admin', 'police')")
                 police_users = cursor.fetchall()
                 for (p_id,) in police_users:
                     cursor.execute(
                        """
                        INSERT INTO notifications (user_id, title, message, type)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (p_id, "Search Match Alert", f"High confidence match ({int(r.score*100)}%) found for case {row[1]} during public search.", "match")
                     )
                 conn.commit()

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

@app.post("/cases/{case_id}/flag-match")
async def flag_potential_match(
    case_id: str,
    file: UploadFile = File(...)
):
    # Save the submitted image
    filename = f"match_{uuid.uuid4().hex[:12]}.jpg"
    image_path = os.path.join(USER_IMAGES_DIR, filename)
    
    with open(image_path, "wb") as f:
        f.write(await file.read())

    # 1. Log to Timeline
    cursor.execute(
        """
        INSERT INTO case_timeline (case_id, title, description, status)
        VALUES (%s, %s, %s, %s)
        """,
        (case_id, "Potential Match Flagged", "A user flagged a potential match with photo evidence.", "under-review")
    )
    
    # 2. Add to Potential Matches Table
    cursor.execute(
        """
        INSERT INTO potential_matches (case_id, submitted_image, status)
        VALUES (%s, %s, 'pending')
        """,
        (case_id, filename)
    )

    # 3. Notify Police/Admins
    cursor.execute("SELECT name FROM persons WHERE final_person_id = %s", (case_id,))
    person = cursor.fetchone()
    person_name = person[0] if person else "Unknown"

    cursor.execute("SELECT id FROM users WHERE role IN ('admin', 'police')")
    police_users = cursor.fetchall()
    
    for (p_id,) in police_users:
        cursor.execute(
            """
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (%s, %s, %s, %s)
            """,
            (p_id, "Match Review Required", f"New potential match flagged for Case {person_name}. Please review evidence.", "match")
        )
    conn.commit()

    return {"success": True, "message": "Match flagged and evidence submitted for review."}

# --- Match Review APIs ---

@app.get("/admin/potential-matches")
def get_potential_matches(current_user = Depends(check_admin_role)):
    query = """
        SELECT 
            pm.id, pm.case_id, pm.submitted_image, pm.status, pm.created_at,
            p.name, p.image_file, p.district, p.state, p.reporter_id
        FROM potential_matches pm
        JOIN persons p ON pm.case_id = p.final_person_id
        WHERE pm.status = 'pending'
        ORDER BY pm.created_at DESC
    """
    cursor.execute(query)
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
    # Get match details
    cursor.execute("SELECT case_id, submitted_image FROM potential_matches WHERE id = %s", (match_id,))
    match = cursor.fetchone()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    case_id = match[0]
    
    # 1. Update Match Status
    cursor.execute("UPDATE potential_matches SET status = 'confirmed' WHERE id = %s", (match_id,))
    
    # 2. Update Case Status
    cursor.execute("UPDATE persons SET tracing_status = 'matched' WHERE final_person_id = %s", (case_id,))
    
    # 3. Update Timeline
    cursor.execute(
        """
        INSERT INTO case_timeline (case_id, title, description, status)
        VALUES (%s, %s, %s, 'matched')
        """,
        (case_id, "Match Confirmed", "Administrative review confirmed the potential match.",)
    )
    
    # 4. Notify Reporter
    cursor.execute("SELECT reporter_id, name FROM persons WHERE final_person_id = %s", (case_id,))
    person_row = cursor.fetchone()
    if person_row and person_row[0]:
        reporter_id = person_row[0]
        case_name = person_row[1]
        cursor.execute(
            """
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (%s, %s, %s, 'match')
            """,
            (reporter_id, "Match FOUND!", f"Great news! A match has been confirmed for {case_name}. Please contact police.",)
        )
        
    conn.commit()
    return {"success": True, "message": "Match confirmed and reporter notified."}

@app.post("/admin/matches/{match_id}/reject")
def reject_match(match_id: int, current_user = Depends(check_admin_role)):
    cursor.execute("UPDATE potential_matches SET status = 'rejected' WHERE id = %s", (match_id,))
    
    # Optional: Notify user who submitted? (If we tracked who submitted, which is 'Anonymous' currently in frontend logic)
    # For now just update status.
    
    conn.commit()
    return {"success": True, "message": "Match rejected."}

@app.post("/report/missing")
async def report_missing(
    name: str = Form(...),
    gender: str = Form(...),
    birth_year: int = Form(...),
    state: str = Form(...),
    district: str = Form(...),
    police_station: str = Form(...),
    photo: UploadFile = File(...),
    current_user = Depends(get_current_user)
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
                tracing_status,
                image_file,
                reporter_id
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
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
                "Untraced",
                filename,
                current_user[0]
            ),
        )

        # 1. Timeline: Case Submitted
        cursor.execute(
            """
            INSERT INTO case_timeline (case_id, title, description, status)
            VALUES (%s, %s, %s, %s)
            """,
            (final_person_id, "Case Submitted", "Report has been submitted and is pending verification.", "submitted")
        )

        # 2. Automated Match Check (to notify Police)
        # Search Qdrant for existing faces that might match this new one
        # logic: search qdrant with the NEW vector
        search_results = qdrant.search(
            collection_name=QDRANT_COLLECTION,
            query_vector=vector,
            limit=5
        )
        
        match_found = False
        for r in search_results:
             if r.id != uuid.UUID(int=0) and r.score > 0.65: # Exclude self if somehow searched, but IDs differ. 
                 # Actually Qdrant might return the just-inserted point.
                 # We should check if payload FinalPersonId != final_person_id
                 if r.payload.get("FinalPersonId") != final_person_id:
                     match_found = True
                     break
        
        if match_found:
            # Notify ALL Police/Admins
            cursor.execute("SELECT id FROM users WHERE role IN ('admin', 'police')")
            police_users = cursor.fetchall()
            for (p_id,) in police_users:
                cursor.execute(
                    """
                    INSERT INTO notifications (user_id, title, message, type)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (p_id, "Potential Match Found", f"A new case ({name}) matches an existing record.", "match")
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

    # 2. Yearly Activity (Last 12 Months)
    # Return count per month
    cursor.execute("""
        SELECT to_char(created_at, 'Mon'), COUNT(*)
        FROM persons
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY 1, EXTRACT(MONTH FROM created_at)
        ORDER BY EXTRACT(MONTH FROM created_at)
    """)
    activity_rows = cursor.fetchall()

    # Format: [{'month': 'Jan', 'cases': 5}, ...]
    yearly_activity = []
    # Simplified map for now, assuming rows returned in roughly correct order.
    # Ideally should fill in missing months with 0.
    for month_name, count in activity_rows:
        yearly_activity.append({"month": month_name, "cases": count})

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
    current_user: Token = Depends(get_current_user_optional) # We need a new dep for optional auth or just handle error if mine=True
):
    # ... logic for current_user ..
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
        # Age 10 => born in 2015 (if 2025). max_birth_year
        # Age 20 => born in 2005. min_birth_year
        # Range age [10, 20] => birth_year [2005, 2015]
        # birth_year >= (current - max_age) AND birth_year <= (current - min_age)
        
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
                # "created_at": r[9] # if we want to return it
            }
            for r in rows
        ],
    }

# --- Notifications & Case Status ---

@app.get("/notifications")
def get_notifications(current_user: Token = Depends(get_current_user)):
    # User ID is current_user[0] because it's a tuple from fetchone
    user_id = current_user[0]
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
    cursor.execute(
        "UPDATE notifications SET is_read = TRUE WHERE id = %s AND user_id = %s",
        (notification_id, user_id)
    )
    conn.commit()
    return {"success": True}

class CaseStatusUpdate(BaseModel):
    status: str

@app.put("/cases/{case_id}/status")
def update_case_status(
    case_id: str, 
    status_update: CaseStatusUpdate,
    current_user: Token = Depends(get_current_user)
):
    # Verify police/admin role? For now assumed police dashboard uses it.
    # Check role
    role = current_user[6] 
    if role not in ['police', 'admin']:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_status = status_update.status
    
    # map frontend status to backend tracing_status if needed or store directly
    # frontend: verified, rejected, match-confirmed
    # backend: verified, closed, matched
    
    db_status = new_status
    if new_status == 'rejected':
         db_status = 'closed'
    elif new_status == 'match-confirmed':
         db_status = 'matched'

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
    
    # Create Notification for Reporter
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

    # Timeline Event
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
    
    conn.commit()
    return {"success": True}

@app.get("/cases/{case_id}/timeline")
def get_case_timeline(case_id: str):
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
