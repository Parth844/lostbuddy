from qdrant_client import QdrantClient
import psycopg2
from psycopg2 import pool as pg_pool
import os
import logging
from contextlib import contextmanager

logger = logging.getLogger("pehchaan.db")

# Qdrant — defaults to localhost for local dev, override via QDRANT_URL in Docker
qdrant = QdrantClient(url=os.environ.get("QDRANT_URL", "http://localhost:6333"))
QDRANT_COLLECTION = "missing_person_faces"

# PostgreSQL connection pool — defaults to localhost:5433 for local dev,
# override via env vars in Docker. A pool (instead of a single global
# connection/cursor) is required for safe concurrent request handling: each
# request checks out its own connection and returns it when done.
DB_CONFIG = dict(
    dbname=os.environ.get("POSTGRES_DB", "faces_db"),
    user=os.environ.get("POSTGRES_USER", "postgres"),
    password=os.environ.get("POSTGRES_PASSWORD", "postgres"),
    host=os.environ.get("POSTGRES_HOST", "localhost"),
    port=int(os.environ.get("POSTGRES_PORT", "5433")),
    connect_timeout=int(os.environ.get("POSTGRES_CONNECT_TIMEOUT", "10")),
)

POOL_MIN = int(os.environ.get("POSTGRES_POOL_MIN", "1"))
POOL_MAX = int(os.environ.get("POSTGRES_POOL_MAX", "10"))

pool = pg_pool.ThreadedConnectionPool(POOL_MIN, POOL_MAX, **DB_CONFIG)


@contextmanager
def get_cursor(commit: bool = False):
    """Check out a pooled connection and yield a cursor.

    - commit=True  → commit on clean exit (use for any write).
    - On any exception the transaction is rolled back and re-raised.
    - The connection is always returned to the pool.

    Usage:
        with get_cursor() as cur:              # read-only
            cur.execute("SELECT ...")
        with get_cursor(commit=True) as cur:   # writes
            cur.execute("INSERT ...")
    """
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        try:
            yield cur
            if commit:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cur.close()
    finally:
        pool.putconn(conn)


def ping() -> bool:
    """Lightweight health probe for the /health endpoint."""
    with get_cursor() as cur:
        cur.execute("SELECT 1")
        cur.fetchone()
    return True
