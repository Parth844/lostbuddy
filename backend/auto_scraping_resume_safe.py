from playwright.sync_api import sync_playwright
import json
import csv
import time
import os
from tqdm import tqdm

# ======================
# CONFIG
# ======================
URL = "https://zipnet.delhipolice.gov.in/Victims/MissingPersons"
HEADLESS = False
PAGE_SIZE = 50
FORCE_START_PAGE = 1  # enter where to resume from
#last  completed page: 4000 ( total records: 197039 )
JSON_FILE = "zipnet_all_missing_persons_1.json"
CSV_FILE = "zipnet_all_missing_persons_1.csv"

MAX_EMPTY_PAGES = 3
PAGE_WAIT = 2.5   # seconds

# ======================
# LOAD DATA
# ======================
all_data = []
seen_ids = set()

if os.path.exists(JSON_FILE):
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        all_data = json.load(f)
        for r in all_data:
            pid = r.get("MissingPersonId")
            if pid:
                seen_ids.add(pid)

print(f"📂 Loaded {len(all_data)} existing records")

state = {"initialized": False, "new_records": 0}

# ======================
# SAVE FUNCTIONS
# ======================
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

# ======================
# SCRAPER
# ======================
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

    # set page size
    page.select_option(
        "select[name='missingPersonGrid_length']",
        value=str(PAGE_SIZE)
    )
    time.sleep(2)

    while not state["initialized"]:
        time.sleep(0.3)

    print(f"⏩ Jumping to page {FORCE_START_PAGE}")

    page.evaluate(f"""
        $('#missingPersonGrid').DataTable().page({FORCE_START_PAGE}).draw(false);
    """)
    time.sleep(PAGE_WAIT)

    pbar = tqdm(desc="Zipnet pages", unit="page", initial=FORCE_START_PAGE)

    empty_pages = 0
    current_page = FORCE_START_PAGE

    try:
        while True:
            prev_len = len(all_data)

            # 🔥 Advance page via DataTables API (NO CLICK)
            current_page += 1
            page.evaluate(f"""
                $('#missingPersonGrid').DataTable().page({current_page}).draw(false);
            """)
            time.sleep(PAGE_WAIT)

            pbar.update(1)
            pbar.set_postfix(
                page=current_page,
                total=len(all_data),
                new=state["new_records"]
            )

            save_json()
            save_csv()

            if len(all_data) == prev_len:
                empty_pages += 1
                print(f"⚠️ Empty page {empty_pages}/{MAX_EMPTY_PAGES}")
            else:
                empty_pages = 0

            if empty_pages >= MAX_EMPTY_PAGES:
                print("🛑 No more new data. Stopping.")
                break

    except KeyboardInterrupt:
        print("\n⛔ Interrupted by user")

    finally:
        pbar.close()
        browser.close()
        save_json()
        save_csv()

# ======================
# FINAL STATUS
# ======================
print("\n🎉 DONE")
print("🆕 New records added:", state["new_records"])
print("📁 Total records stored:", len(all_data))
