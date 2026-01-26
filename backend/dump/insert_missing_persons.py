import os
import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "dbname": "lostbuddy",
    "user": "lostbuddy",
    "password": "lostbuddy",
    "port": 5433,
}

CROPS_DIR = "face_crops"

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

files = [f for f in os.listdir(CROPS_DIR) if f.endswith(".jpg")]

inserted = 0
skipped = 0

for fname in files:
    person_id = fname.split("_")[0]

    cur.execute(
        "SELECT 1 FROM persons WHERE person_id = %s",
        (person_id,)
    )
    if cur.fetchone():
        skipped += 1
        continue

    # Insert minimal placeholder
    cur.execute("""
        INSERT INTO persons (person_id)
        VALUES (%s)
        ON CONFLICT DO NOTHING
    """, (person_id,))
    inserted += 1

conn.commit()
cur.close()
conn.close()

print(f"✅ Persons inserted: {inserted}")
print(f"↩️ Persons already existed: {skipped}")
