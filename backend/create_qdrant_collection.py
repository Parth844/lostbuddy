from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

QDRANT_COLLECTION = "missing_person_faces"

qdrant = QdrantClient(url="http://qdrant:6333")

# ✅ Ensure collection exists
if QDRANT_COLLECTION not in [c.name for c in qdrant.get_collections().collections]:
    qdrant.create_collection(
        collection_name=QDRANT_COLLECTION,
        vectors_config=VectorParams(
            size=512,              # 🔥 MUST MATCH EMBEDDING SIZE
            distance=Distance.COSINE
        )
    )
    print(f"✅ Qdrant collection '{QDRANT_COLLECTION}' created")
else:
    print(f"ℹ️ Qdrant collection '{QDRANT_COLLECTION}' already exists")
