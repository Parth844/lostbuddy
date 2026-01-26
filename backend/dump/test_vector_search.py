import os
import numpy as np
from deepface import DeepFace
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest

# =========================
# CONFIG
# =========================
IMAGE_PATH = "face_crops/644381_1.jpg"
COLLECTION = "face_embeddings"
TOP_K = 5
SIMILARITY_THRESHOLD = 0.7  # adjust later if needed

# =========================
# VALIDATE IMAGE
# =========================
if not os.path.exists(IMAGE_PATH):
    raise FileNotFoundError(f"Image not found: {IMAGE_PATH}")

# =========================
# GENERATE EMBEDDING
# =========================
rep = DeepFace.represent(
    img_path=IMAGE_PATH,
    model_name="Facenet512",
    enforce_detection=False,
    detector_backend="skip"
)

if not rep:
    raise RuntimeError("Failed to generate embedding")

embedding = np.array(rep[0]["embedding"])
embedding = embedding / np.linalg.norm(embedding)

# =========================
# QDRANT SEARCH (LOW-LEVEL)
# =========================
client = QdrantClient(host="localhost", port=6333)

search_result = client.http.points_api.search_points(
    collection_name=COLLECTION,
    search_request=rest.SearchRequest(
        vector=embedding.tolist(),
        limit=TOP_K,
        with_payload=True
    )
)

# =========================
# PRINT RESULTS
# =========================
print("\n🔍 Search results:")

if not search_result.result:
    print("❌ No matches found")
    exit(0)

for i, r in enumerate(search_result.result, start=1):
    score = r.score
    person_id = r.payload.get("person_id")

    status = "✅ MATCH" if score >= SIMILARITY_THRESHOLD else "⚠️ LOW CONFIDENCE"

    print(
        f"{i}. Person ID: {person_id} | "
        f"Score: {score:.4f} | {status}"
    )

# =========================
# TOP MATCH SUMMARY
# =========================
top = search_result.result[0]
print("\n🏆 Top Match:")
print(f"Person ID: {top.payload.get('person_id')}")
print(f"Similarity Score: {top.score:.4f}")
