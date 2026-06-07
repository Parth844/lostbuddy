from playwright.sync_api import sync_playwright
import json
import csv
import time
import os
from tqdm import tqdm

URL = "https://zipnet.delhipolice.gov.in/Victims/MissingPersons"
HEADLESS = False

JSON_FILE = "zipnet_all_missing_persons_1.json"
CSV_FILE = "zipnet_all_missing_persons_1.csv"

# -----------------------------
# LOAD PREVIOUS DATA (RESUME)
# -----------------------------
all_data = []
seen_ids = set()

if os.path.exists(JSON_FILE):
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        all_data = json.load(f)
        for r in all_data:
            pid = r.get("MissingPersonId")
            if pid:
                seen_ids.add(pid)
    print(f"📂 Resuming with {len(all_data)} existing records")
else:
    print("📂 Fresh start")

state = {
    "initialized": False,
    "new_records": 0
}

# -----------------------------
# SAFE SAVE FUNCTIONS
# -----------------------------
def save_json():
    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

def save_csv():
    if not all_data:
        return

    keys = set()
    for r in all_data:
        keys.update(r.keys())

    with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=sorted(keys))
        writer.writeheader()
        writer.writerows(all_data)

# -----------------------------
# SCRAPER
# -----------------------------
with sync_playwright() as p:
    browser = p.chromium.launch(headless=HEADLESS)
    page = browser.new_page()

    def handle_response(response):
        if "GetMissingPersonsData" in response.url:
            try:
                data = response.json()
                state["initialized"] = True

                for r in data.get("data", []):
                    pid = r.get("MissingPersonId")
                    if pid and pid not in seen_ids:
                        seen_ids.add(pid)
                        all_data.append(r)
                        state["new_records"] += 1
            except Exception:
                pass

    page.on("response", handle_response)

    print("🚀 Opening Zipnet…")
    page.goto(URL, wait_until="load", timeout=60000)

    # 🔥 SET 50 RECORDS PER PAGE
    page.select_option(
        "select[name='missingPersonGrid_length']",
        value="50"
    )
    time.sleep(2)

    while not state["initialized"]:
        time.sleep(0.3)

    print("📄 Scanning pages until data ends…")

    pbar = tqdm(desc="Zipnet pages", unit="page")
    empty_pages = 0
    MAX_EMPTY_PAGES = 3

    try:
        while True:
            prev_len = len(all_data)

            if not page.is_enabled("#missingPersonGrid_next"):
                print("🛑 Next button disabled. End reached.")
                break

            page.click("#missingPersonGrid_next")

            for _ in range(12):
                if len(all_data) > prev_len:
                    break
                time.sleep(0.3)

            pbar.update(1)
            pbar.set_postfix(total=len(all_data), new=state["new_records"])

            # auto-save every page (CRASH SAFE)
            save_json()
            save_csv()

            if len(all_data) == prev_len:
                empty_pages += 1
                print(f"⚠️ Empty page {empty_pages}/{MAX_EMPTY_PAGES}")
            else:
                empty_pages = 0

            if empty_pages >= MAX_EMPTY_PAGES:
                print("🛑 No new data after multiple pages. Stopping.")
                break

    except KeyboardInterrupt:
        print("\n⛔ Script interrupted by user")

    finally:
        pbar.close()
        browser.close()
        save_json()
        save_csv()

# -----------------------------
# FINAL STATUS
# -----------------------------
print("\n🎉 DONE")
print("🆕 New records added:", state["new_records"])
print("📁 Total records stored:", len(all_data))
print("📄 CSV file:", CSV_FILE)
