import os
import csv
from facenet_pytorch import MTCNN
from PIL import Image
import numpy as np
from tqdm import tqdm

# ======================
# CONFIG
# ======================
IMAGE_DIR = "downloaded_images"
CROP_DIR = "face_crops"

CROPPED_CSV = "faces_cropped.csv"
NO_FACE_CSV = "faces_not_detected.csv"

os.makedirs(CROP_DIR, exist_ok=True)

# ======================
# INIT FACE DETECTOR
# ======================
mtcnn = MTCNN(
    keep_all=True,
    device="cpu"   # change to "cuda" if GPU available
)

# ======================
# HELPERS
# ======================
def crop_largest_face(img_path):
    try:
        img = Image.open(img_path).convert("RGB")
    except Exception:
        return None, "image_open_failed"

    boxes, _ = mtcnn.detect(img)
    if boxes is None:
        return None, "no_face_detected"

    # select largest face
    areas = [(b[2] - b[0]) * (b[3] - b[1]) for b in boxes]
    idx = int(np.argmax(areas))
    b = boxes[idx].astype(int)

    cropped = img.crop((b[0], b[1], b[2], b[3]))
    return cropped, None

# ======================
# LOAD IMAGES
# ======================
images = [
    f for f in os.listdir(IMAGE_DIR)
    if f.lower().endswith((".jpg", ".jpeg", ".png"))
]

print(f"📸 Images found: {len(images)}")

cropped_rows = []
no_face_rows = []

# ======================
# PROCESS IMAGES
# ======================
for filename in tqdm(images, desc="🧠 Detecting faces", unit="image"):
    img_path = os.path.join(IMAGE_DIR, filename)

    # Extract SourceMissingPersonId from filename
    # Example: 648952_1.jpg → 648952
    source_id = filename.split("_")[0]

    cropped, error = crop_largest_face(img_path)

    if cropped is not None:
        out_path = os.path.join(CROP_DIR, filename)
        try:
            cropped.save(out_path)

            cropped_rows.append({
                "SourceMissingPersonId": source_id,
                "original_image": img_path,
                "crop_image": out_path,
                "status": "cropped"
            })

        except Exception:
            no_face_rows.append({
                "SourceMissingPersonId": source_id,
                "original_image": img_path,
                "status": "save_failed"
            })

    else:
        no_face_rows.append({
            "SourceMissingPersonId": source_id,
            "original_image": img_path,
            "status": error
        })

# ======================
# WRITE CSVs
# ======================
with open(CROPPED_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=[
            "SourceMissingPersonId",
            "original_image",
            "crop_image",
            "status"
        ]
    )
    writer.writeheader()
    writer.writerows(cropped_rows)

with open(NO_FACE_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=[
            "SourceMissingPersonId",
            "original_image",
            "status"
        ]
    )
    writer.writeheader()
    writer.writerows(no_face_rows)

# ======================
# SUMMARY
# ======================
print("\n🎉 FACE PROCESSING COMPLETE")
print("✅ Faces cropped:", len(cropped_rows))
print("⚠️ No face / failed:", len(no_face_rows))
print("📄 CSV saved:", CROPPED_CSV)
print("📄 CSV saved:", NO_FACE_CSV)
print("📁 Crops folder:", CROP_DIR)
