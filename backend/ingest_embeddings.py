import os
import csv
import uuid
import numpy as np
from PIL import Image
from insightface.app import FaceAnalysis
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct
import psycopg2
from tqdm import tqdm

# ======================
# CONFIG
# ======================
IMAGE_DIR = "final_images"
CSV_PATH = "faces_found.csv"

QDRANT_URL = "http://localhost:6333"
QDRANT_COLLECTION = "missing_person_faces"

POSTGRES_CONFIG = {
    "dbname": "faces_db",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": 5432,
}

MODEL_NAME = "buffalo_s"   # stable + fast
VECTOR_SIZE = 512

# ======================
# INIT INSIGHTFACE
# ======================
app = FaceAnalysis(name=MODEL_NAME)
app.prepare(ctx_id=-1, det_size=(640, 640))

# ======================
# INIT QDRANT
# ======================
qdrant = QdrantClient(url=QDRANT_URL)

# ======================
# INIT POSTGRES
# ======================
conn = psycopg2.connect(**POSTGRES_CONFIG)
cursor = conn.cursor()

# ======================
# ENSURE TABLE EXISTS
# ======================
cursor.execute("""
CREATE TABLE IF NOT EXISTS persons (
    final_person_id VARCHAR PRIMARY KEY,
    name TEXT,
    sex TEXT,
    birth_year INT,
    state TEXT,
    district TEXT,
    police_station TEXT,
    tracing_status TEXT,
    image_file TEXT
)
""")
conn.commit()

# ======================
# LOAD ALREADY INGESTED IDs
# ======================
cursor.execute("SELECT final_person_id FROM persons")
existing_ids = {row[0] for row in cursor.fetchall()}

# ======================
# INGEST
# ======================
with open(CSV_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f"📥 Rows in CSV: {len(rows)}")
print(f"⏩ Skipping existing: {len(existing_ids)}")

for row in tqdm(rows, desc="🚀 Ingesting embeddings"):
    final_person_id = row["FinalPersonId"]

    if final_person_id in existing_ids:
        continue

    image_path = os.path.join(IMAGE_DIR, row["ImageFile"])
    if not os.path.exists(image_path):
        continue

    # ----------------------
    # LOAD IMAGE
    # ----------------------
    img = Image.open(image_path).convert("RGB")
    faces = app.get(np.array(img))

    if not faces:
        continue

    embedding = faces[0].embedding
    if embedding.shape[0] != VECTOR_SIZE:
        continue

    # ----------------------
    # INSERT INTO QDRANT
    # ----------------------
    point = PointStruct(
        id=str(uuid.uuid4()),
        vector=embedding.tolist(),
        payload={
            "FinalPersonId": final_person_id
        }
    )

    qdrant.upsert(
        collection_name=QDRANT_COLLECTION,
        points=[point]
    )

    # ----------------------
    # INSERT METADATA
    # ----------------------
    cursor.execute("""
        INSERT INTO persons (
            final_person_id, name, sex, birth_year,
            state, district, police_station,
            tracing_status, image_file
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        final_person_id,
        row.get("Name"),
        row.get("Sex"),
        int(float(row["BirthYear"])) if row.get("BirthYear") else None,
        row.get("State"),
        row.get("District"),
        row.get("PoliceStation"),
        row.get("TracingStatus"),
        row.get("ImageFile")
    ))

    conn.commit()

print("\n🎉 INGESTION COMPLETE")
