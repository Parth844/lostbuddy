import os
import uuid
import psycopg2
import cv2
import numpy as np
from tqdm import tqdm
from deepface import DeepFace
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Distance, VectorParams

# =========================
# CONFIG
# =========================
CROPS_DIR = "face_crops"

QDRANT_COLLECTION = "face_embeddings"
VECTOR_SIZE = 512

POSTGRES = {
    "host": "localhost",
    "port": 5433,
    "dbname": "lostbuddy",
    "user": "lostbuddy",
    "password": "lostbuddy"
}

# =========================
# CONNECT QDRANT (RESET)
# =========================
qdrant = QdrantClient(host="localhost", port=6333)

if QDRANT_COLLECTION in [c.name for c in qdrant.get_collections().collections]:
    qdrant.delete_collection(QDRANT_COLLECTION)

qdrant.create_collection(
    collection_name=QDRANT_COLLECTION,
    vectors_config=VectorParams(
        size=VECTOR_SIZE,
        distance=Distance.COSINE
    )
)

# =========================
# CONNECT POSTGRES
# =========================
print("🔌 Connecting to PostgreSQL...")
pg = psycopg2.connect(**POSTGRES)
pg.autocommit = True
cur = pg.cursor()

# =========================
# LOAD IMAGES
# =========================
images = sorted([
    f for f in os.listdir(CROPS_DIR)
    if f.lower().endswith((".jpg", ".jpeg", ".png"))
])

print(f"📸 Cropped images found: {len(images)}")

points = []
pg_rows = []

# =========================
# GENERATE EMBEDDINGS
# =========================
for img_name in tqdm(images, desc="🧠 Generating embeddings", unit="img"):
    img_path = os.path.join(CROPS_DIR, img_name)

    try:
        embedding = DeepFace.represent(
            img_path=img_path,
            model_name="Facenet512",
            enforce_detection=False,
            detector_backend="skip"
        )[0]["embedding"]
    except Exception:
        continue

    embedding = np.array(embedding)
    embedding = embedding / np.linalg.norm(embedding)

    embedding_id = uuid.uuid4().hex
    person_id = os.path.splitext(img_name)[0].split("_")[0]

    points.append(
        PointStruct(
            id=embedding_id,
            vector=embedding.tolist(),
            payload={
                "person_id": person_id,
                "image_path": img_path
            }
        )
    )

    pg_rows.append((embedding_id, person_id, img_path))

print(f"DEBUG points length: {len(points)}")

# =========================
# INSERT INTO QDRANT
# =========================
BATCH_SIZE = 256
total_batches = (len(points) + BATCH_SIZE - 1) // BATCH_SIZE

for i in tqdm(
    range(0, len(points), BATCH_SIZE),
    desc="⬆️ Uploading to Qdrant",
    total=total_batches,
    unit="batch"
):
    qdrant.upsert(
        collection_name=QDRANT_COLLECTION,
        points=points[i:i + BATCH_SIZE]
    )

print(f"✅ Vectors inserted into Qdrant: {len(points)}")

# =========================
# INSERT INTO POSTGRES (FK SAFE)
# =========================
for embedding_id, person_id, image_path in tqdm(
    pg_rows,
    desc="🗄️ Inserting into PostgreSQL",
    unit="row"
):
    # 🔥 Ensure person exists
    cur.execute(
        """
        INSERT INTO persons (person_id)
        VALUES (%s)
        ON CONFLICT (person_id) DO NOTHING
        """,
        (person_id,)
    )

    # Insert face embedding
    cur.execute(
        """
        INSERT INTO face_embeddings (embedding_id, person_id, image_path)
        VALUES (%s, %s, %s)
        ON CONFLICT (embedding_id) DO NOTHING
        """,
        (embedding_id, person_id, image_path)
    )

print("✅ Embedding mappings stored in PostgreSQL")

cur.close()
pg.close()

print("\n🎉 EMBEDDINGS PIPELINE COMPLETE (STABLE & FK-SAFE)")
