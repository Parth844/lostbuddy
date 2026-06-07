from qdrant_client import QdrantClient
import psycopg2

# Qdrant (Docker service name)
qdrant = QdrantClient(url="http://localhost:6333")
QDRANT_COLLECTION = "missing_person_faces"

# PostgreSQL
conn = psycopg2.connect(
    dbname="faces_db",
    user="postgres",
    password="postgres",
    host="localhost",
    port=5433
)
cursor = conn.cursor()