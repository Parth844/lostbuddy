import csv
import requests
import numpy as np
from io import BytesIO
from PIL import Image
from insightface.app import FaceAnalysis
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import defaultdict
import hashlib
import os
from tqdm import tqdm

# ======================
# CONFIG
# ======================
INPUT_CSV = "datasets_csv/zipnet_final_clean_data.csv"

FACE_FOUND_CSV = "faces_found.csv"
FACE_NOT_FOUND_CSV = "faces_not_found.csv"
PROGRESS_CSV = "progress_checkpoint.csv"

IMAGE_DIR = "final_images"
BASE_IMAGE_URL = "https://zipnet.delhipolice.gov.in"

MODEL_NAME = "buffalo_s"
   # fastest for face detection
MAX_WORKERS = 8
IMAGE_TIMEOUT = 10

MIN_FACE_SIZE = 80          # reject tiny faces
MAX_IMAGES = 10_000         # hard limit

# 👇 CONTROL WHERE TO START / STOP (PERSON INDEX)
START_PERSON_INDEX = 0      # inclusive
STOP_PERSON_INDEX = 12_000  # exclusive

os.makedirs(IMAGE_DIR, exist_ok=True)

# ======================
# INIT INSIGHTFACE
# ======================
app = FaceAnalysis(name=MODEL_NAME)
app.prepare(ctx_id=-1, det_size=(640, 640))

# ======================
# HELPERS
# ======================
def normalize_url(url):
    return BASE_IMAGE_URL + url if url.startswith("/") else url

def new_identity_id(seed):
    return "FP_" + hashlib.md5(seed.encode()).hexdigest()[:12]

def download_image(url):
    r = requests.get(url, timeout=IMAGE_TIMEOUT)
    r.raise_for_status()
    return Image.open(BytesIO(r.content)).convert("RGB")

def face_is_valid(img):
    faces = app.get(np.array(img))
    if not faces:
        return False
    f = faces[0]
    w = f.bbox[2] - f.bbox[0]
    h = f.bbox[3] - f.bbox[1]
    return w >= MIN_FACE_SIZE and h >= MIN_FACE_SIZE

def load_checkpoint():
    done = set()
    count = 0
    if os.path.exists(PROGRESS_CSV):
        with open(PROGRESS_CSV, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for r in reader:
                done.add((r["FinalPersonId"], r["ImageUrl"]))
                if r["Status"] == "FACE_FOUND":
                    count += 1
    return done, count

def write_checkpoint(row):
    exists = os.path.exists(PROGRESS_CSV)
    with open(PROGRESS_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["FinalPersonId", "ImageUrl", "Status"]
        )
        if not exists:
            writer.writeheader()
        writer.writerow(row)
        f.flush()
        os.fsync(f.fileno())

# ======================
# LOAD INPUT CSV
# ======================
rows = []
with open(INPUT_CSV, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        r["ImageUrls"] = [
            u.strip() for u in r["ImageUrls"].split(";") if u.strip()
        ]
        rows.append(r)

print(f"📥 Rows loaded: {len(rows)}")

# ======================
# GROUP BY PERSON
# ======================
groups = defaultdict(list)
for r in rows:
    key = r.get("FinalPersonId") or r["MissingPersonId"]
    groups[key].append(r)

person_keys = list(groups.keys())

print(f"👥 Total persons: {len(person_keys)}")
print(
    f"▶ Processing persons index "
    f"{START_PERSON_INDEX} → {min(STOP_PERSON_INDEX, len(person_keys))}"
)

# ======================
# LOAD CHECKPOINT
# ======================
processed, face_count = load_checkpoint()
print(f"🔁 Resuming from {face_count} images")

faces_found = []
faces_not_found = []

# ======================
# MAIN LOOP
# ======================
for idx in tqdm(
    range(START_PERSON_INDEX, min(STOP_PERSON_INDEX, len(person_keys))),
    desc="🔍 Processing persons"
):
    if face_count >= MAX_IMAGES:
        print("🛑 Reached MAX_IMAGES limit")
        break

    person_key = person_keys[idx]
    records = groups[person_key]
    final_person_id = new_identity_id(person_key)

    image_saved = False
    download_tasks = {}

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        for record in records:
            for raw_url in record["ImageUrls"]:
                pair = (final_person_id, raw_url)
                if pair in processed:
                    continue

                url = normalize_url(raw_url)
                download_tasks[
                    executor.submit(download_image, url)
                ] = (record, raw_url)

        for future in as_completed(download_tasks):
            if face_count >= MAX_IMAGES:
                break

            record, raw_url = download_tasks[future]

            try:
                img = future.result()

                if face_is_valid(img):
                    img.save(
                        os.path.join(IMAGE_DIR, f"{final_person_id}.jpg")
                    )

                    faces_found.append({
                        "FinalPersonId": final_person_id,
                        "Name": record.get("Name", ""),
                        "Sex": record.get("Sex", ""),
                        "BirthYear": record.get("BirthYear", ""),
                        "State": record.get("State", ""),
                        "District": record.get("District", ""),
                        "PoliceStation": record.get("PoliceStation", ""),
                        "TracingStatus": record.get("TracingStatus", ""),
                        "ImageFile": f"{final_person_id}.jpg"
                    })

                    write_checkpoint({
                        "FinalPersonId": final_person_id,
                        "ImageUrl": raw_url,
                        "Status": "FACE_FOUND"
                    })

                    face_count += 1
                    image_saved = True
                    break

                else:
                    write_checkpoint({
                        "FinalPersonId": final_person_id,
                        "ImageUrl": raw_url,
                        "Status": "NO_FACE"
                    })

            except Exception:
                write_checkpoint({
                    "FinalPersonId": final_person_id,
                    "ImageUrl": raw_url,
                    "Status": "ERROR"
                })

    if not image_saved:
        sample = records[0]
        faces_not_found.append({
            "FinalPersonId": final_person_id,
            "Name": sample.get("Name", ""),
            "Sex": sample.get("Sex", ""),
            "BirthYear": sample.get("BirthYear", ""),
            "State": sample.get("State", ""),
            "District": sample.get("District", ""),
            "PoliceStation": sample.get("PoliceStation", ""),
            "TracingStatus": sample.get("TracingStatus", ""),
            "Reason": "No valid face detected"
        })

# ======================
# SAVE OUTPUT CSVs
# ======================
FOUND_FIELDS = [
    "FinalPersonId", "Name", "Sex", "BirthYear",
    "State", "District", "PoliceStation",
    "TracingStatus", "ImageFile"
]

NOT_FOUND_FIELDS = FOUND_FIELDS[:-1] + ["Reason"]

with open(FACE_FOUND_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=FOUND_FIELDS)
    writer.writeheader()
    writer.writerows(faces_found)

with open(FACE_NOT_FOUND_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=NOT_FOUND_FIELDS)
    writer.writeheader()
    writer.writerows(faces_not_found)

# ======================
# DONE
# ======================
print("\n🎉 DONE")
print("🧮 Images downloaded:", face_count)
print("🖼️ Images folder:", IMAGE_DIR)
print("📄 CSVs:", FACE_FOUND_CSV, "&", FACE_NOT_FOUND_CSV)
print("🔁 Resume file:", PROGRESS_CSV)
