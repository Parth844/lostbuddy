import numpy as np
from qdrant_client import QdrantClient

QDRANT_URL = "http://localhost:6333"
COLLECTION = "missing_person_faces"

client = QdrantClient(url=QDRANT_URL)

embeddings = []
ids = []

print("📤 Exporting embeddings from Qdrant...")

offset = None
while True:
    points, offset = client.scroll(
        collection_name=COLLECTION,
        limit=500,
        offset=offset,
        with_vectors=True,
        with_payload=True
    )

    if not points:
        break

    for p in points:
        embeddings.append(p.vector)
        ids.append(p.payload.get("FinalPersonId", "UNKNOWN"))

    if offset is None:
        break

embeddings = np.array(embeddings, dtype=np.float32)
ids = np.array(ids, dtype=object)

print("✅ Exported:", embeddings.shape)

np.save("embeddings.npy", embeddings)
np.save("ids.npy", ids)

print("💾 Saved embeddings.npy & ids.npy")