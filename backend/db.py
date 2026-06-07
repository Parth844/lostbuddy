from qdrant_client import QdrantClient
import psycopg2
import os

# Qdrant — defaults to localhost for local dev, override via QDRANT_URL in Docker
qdrant = QdrantClient(url=os.environ.get("QDRANT_URL", "http://localhost:6333"))
QDRANT_COLLECTION = "missing_person_faces"

# PostgreSQL — defaults to localhost:5433 for local dev, override via env vars in Docker
conn = psycopg2.connect(
    dbname=os.environ.get("POSTGRES_DB", "faces_db"),
    user=os.environ.get("POSTGRES_USER", "postgres"),
    password=os.environ.get("POSTGRES_PASSWORD", "postgres"),
    host=os.environ.get("POSTGRES_HOST", "localhost"),
    port=int(os.environ.get("POSTGRES_PORT", "5433"))
)
cursor = conn.cursor()
