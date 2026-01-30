
import psycopg2
import random
from datetime import datetime, timedelta

def migrate():
    try:
        # Try connecting with local settings first (if user running locally)
        # Assuming localhost if 'postgres' hostname fails
        try:
            conn = psycopg2.connect(
                dbname="faces_db",
                user="postgres",
                password="postgres",
                host="localhost", # Try localhost first for scripts run from shell
                port=5432
            )
        except:
            # Fallback to the settings in db.py (docker network)
            conn = psycopg2.connect(
                dbname="faces_db",
                user="postgres",
                password="postgres",
                host="postgres",
                port=5432
            )
            
        cursor = conn.cursor()
        print("Connected to database")

        # Check if column exists
        try:
            cursor.execute("SELECT created_at FROM persons LIMIT 1")
            print("Column 'created_at' already exists.")
        except Exception as e:
            print("Column 'created_at' does not exist. Adding it...")
            conn.rollback() # Reset transaction from error
            
            # Add column
            cursor.execute("ALTER TABLE persons ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
            conn.commit()
            print("Column added.")
            
            # Backfill with random dates in last 7 days
            cursor.execute("SELECT final_person_id FROM persons")
            ids = cursor.fetchall()
            
            print(f"Backfilling {len(ids)} records with random dates...")
            for (pid,) in ids:
                days_ago = random.randint(0, 6)
                # Random time
                random_date = datetime.now() - timedelta(days=days_ago)
                
                cursor.execute(
                    "UPDATE persons SET created_at = %s WHERE final_person_id = %s",
                    (random_date, pid)
                )
            conn.commit()
            print("Backfill complete.")

    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    migrate()
