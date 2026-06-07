import pandas as pd
import uuid

# ======================
# CONFIG
# ======================
INPUT_CSV = "zipnet_all_missing_persons_1.csv"
OUTPUT_CSV = "zipnet_final_clean_data.csv"

REQUIRED_COLUMNS = [
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

# ======================
# LOAD CSV
# ======================
df = pd.read_csv(INPUT_CSV)

print("📥 Original rows:", len(df))

# ======================
# CLEAN ImageUrls
# ======================
df["ImageUrls"] = df["ImageUrls"].astype(str).str.strip()

def extract_urls(val):
    """
    Convert:
    []  -> []
    ['a.jpg','b.jpg'] -> ['a.jpg','b.jpg']
    a.jpg;b.jpg -> ['a.jpg','b.jpg']
    """
    val = val.replace("[", "").replace("]", "").replace("'", "")
    if not val.strip():
        return []
    return [u.strip() for u in val.replace(";", ",").split(",") if u.strip()]

df["ImageList"] = df["ImageUrls"].apply(extract_urls)

# ======================
# REMOVE ROWS WITH NO IMAGES
# ======================
df = df[df["ImageList"].apply(len) > 0]

print("🧹 Rows after removing empty images:", len(df))

# ======================
# GLOBAL IMAGE-LEVEL DEDUP
# ======================
seen_images = set()
rows_to_keep = []

for _, row in df.iterrows():
    unique_images = []

    for img in row["ImageList"]:
        if img not in seen_images:
            seen_images.add(img)
            unique_images.append(img)

    if unique_images:
        row["ImageUrls"] = ";".join(unique_images)
        rows_to_keep.append(row)

df = pd.DataFrame(rows_to_keep)

print("🖼️ Unique images kept:", len(seen_images))
print("👤 Rows after image dedup:", len(df))

# ======================
# ASSIGN UNIQUE FinalPersonId
# ======================
df["FinalPersonId"] = [
    f"FP_{uuid.uuid4().hex[:12]}"
    for _ in range(len(df))
]

# ======================
# OPTIONAL CLEANUPS
# ======================
df["Sex"] = df["Sex"].astype(str).str.title()
df["BirthYear"] = pd.to_numeric(df["BirthYear"], errors="coerce")

# ======================
# KEEP ONLY REQUIRED COLUMNS
# ======================
df = df[[c for c in REQUIRED_COLUMNS if c in df.columns]]

# ======================
# SAVE FINAL CSV
# ======================
df.to_csv(OUTPUT_CSV, index=False)

print("\n🎉 DONE")
print("👤 Final unique persons:", len(df))
print("🆔 Unique FinalPersonId:", df["FinalPersonId"].nunique())
print("📁 Saved to:", OUTPUT_CSV)
