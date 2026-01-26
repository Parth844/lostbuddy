import csv
import requests
import numpy as np
from io import BytesIO
from PIL import Image
from insightface.app import FaceAnalysis
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict
import hashlib
import os
from tqdm import tqdm

# ======================
# CONFIG
# ======================
INPUT_CSV = "zipnet_final_clean_data.csv"
OUTPUT_CSV = "zipnet_filter_data.csv"

SIMILARITY_THRESHOLD = 0.92
IMAGE_TIMEOUT = 10
IMAGE_DIR = "downloaded_images"

os.makedirs(IMAGE_DIR, exist_ok=True)

# ======================
# INIT FACE MODEL
# ======================
app = FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=-1, det_size=(640, 640))

# ======================
# HELPERS (IMAGE CACHE)
# ======================
def image_filename_from_url(url):
    return hashlib.md5(url.encode()).hexdigest() + ".jpg"

def download_image_local(url):
    filename = image_filename_from_url(url)
    filepath = os.path.join(IMAGE_DIR, filename)

    if os.path.exists(filepath):
        return Image.open(filepath).convert("RGB")

    r = requests.get(url, timeout=IMAGE_TIMEOUT)
    r.raise_for_status()

    img = Image.open(BytesIO(r.content)).convert("RGB")
    img.save(filepath)
    return img

def get_embedding(img):
    faces = app.get(np.array(img))
    if not faces:
        return None
    return faces[0].embedding

def new_identity_id(seed):
    return hashlib.md5(seed.encode()).hexdigest()

# ======================
# LOAD CSV
# ======================
rows = []
with open(INPUT_CSV, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        r["ImageUrls"] = r["ImageUrls"].split(";")
        rows.append(r)

# ======================
# GROUP BY BEST AVAILABLE KEY
# ======================
groups = defaultdict(list)

for r in rows:
    if "FinalPersonId" in r and r["FinalPersonId"]:
        key = r["FinalPersonId"]
    else:
        key = r["MissingPersonId"]   # fallback (always exists)

    groups[key].append(r)

print(f"👥 Metadata groups found: {len(groups)}")

final_rows = []

# ======================
# FACE-LEVEL DEDUP
# ======================
for person_key in tqdm(groups, desc="🔍 Resolving identities", unit="group"):
    records = groups[person_key]
    identities = []

    for record in records:
        for img_url in record["ImageUrls"]:
            try:
                img = download_image_local(img_url)
                emb = get_embedding(img)

                if emb is None:
                    continue

                matched = False

                for identity in identities:
                    sim = cosine_similarity(
                        [emb], [identity["embedding"]]
                    )[0][0]

                    if sim >= SIMILARITY_THRESHOLD:
                        identity["records"].append(record)
                        identity["images"].add(img_url)
                        matched = True
                        break

                if not matched:
                    identities.append({
                        "embedding": emb,
                        "records": [record],
                        "images": {img_url}
                    })

            except Exception:
                continue

    # ======================
    # FLATTEN IDENTITIES
    # ======================
    for idx, identity in enumerate(identities):
        sample = identity["records"][0]

        final_rows.append({
            "FinalPersonId": new_identity_id(person_key + str(idx)),
            "Name": sample["Name"],
            "Sex": sample["Sex"],
            "BirthYear": sample["BirthYear"],
            "State": sample["State"],
            "District": sample["District"],
            "PoliceStation": sample["PoliceStation"],
            "TracingStatus": sample["TracingStatus"],
            "SourceMissingPersonIds": ";".join(
                sorted(set(
                    pid
                    for r in identity["records"]
                    for pid in r["SourceMissingPersonIds"].split(";")
                ))
            ),
            "ImageUrls": ";".join(sorted(identity["images"]))
        })

# ======================
# SAVE FINAL CSV
# ======================
with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=[
            "FinalPersonId",
            "Name",
            "Sex",
            "BirthYear",
            "State",
            "District",
            "PoliceStation",
            "TracingStatus",
            "SourceMissingPersonIds",
            "ImageUrls"
        ]
    )
    writer.writeheader()
    writer.writerows(final_rows)

print("\n🎉 DONE")
print("👤 Unique persons (face-verified):", len(final_rows))
print("📁 Saved to:", OUTPUT_CSV)
print("🖼️ Images cached in:", IMAGE_DIR)
