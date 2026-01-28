import time
import psycopg2

while True:
    try:
        conn = psycopg2.connect(
            host="postgres",
            database="faces_db",
            user="postgres",
            password="postgres",
            port=5432,
        )
        conn.close()
        print("Postgres is ready ✅")
        break
    except psycopg2.OperationalError:
        print("Waiting for Postgres...")
        time.sleep(2)