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
print(f"📸 Found {len(files)} face crops")

for fname in files:
    image_path = os.path.join(CROPS_DIR, fname)

    # person_id comes from filename: 644385_2.jpg → 644385
    person_id = fname.split("_")[0]

    cur.execute("""
        INSERT INTO person_images (person_id, image_path, image_type, has_face)
        VALUES (%s, %s, 'crop', TRUE)
        ON CONFLICT DO NOTHING
    """, (person_id, image_path))

conn.commit()
cur.close()
conn.close()

print("✅ Face crops inserted into PostgreSQL")

