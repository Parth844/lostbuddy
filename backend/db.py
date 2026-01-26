from qdrant_client import QdrantClient
import psycopg2

# Qdrant (Docker service name)
qdrant = QdrantClient(url="http://qdrant:6333")
QDRANT_COLLECTION = "missing_person_faces"

# PostgreSQL (Docker service name)
conn = psycopg2.connect(
    dbname="faces_db",
    user="postgres",
    password="postgres",
    host="postgres",
    port=5432
)
cursor = conn.cursor()