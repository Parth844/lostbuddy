from playwright.sync_api import sync_playwright
import json
import time
import math
from tqdm import tqdm

URL = "https://zipnet.delhipolice.gov.in/Victims/MissingPersons"

HEADLESS = False         # set False if site blocks headless
MAX_PAGES = 500            # test with small number first
FINAL_FILE = "zipnet_all_missing_persons.json"

all_data = []
seen_ids = set()

state = {
    "initialized": False,
    "total_records": None
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=HEADLESS)
    page = browser.new_page()

    def handle_response(response):
        if "GetMissingPersonsData" in response.url:
            try:
                data = response.json()

                if not state["initialized"]:
                    state["initialized"] = True
                    state["total_records"] = int(data.get("recordsTotal", 0))
                    print("📊 Total records on server:", state["total_records"])

                for r in data.get("data", []):
                    pid = r.get("MissingPersonId")
                    if pid and pid not in seen_ids:
                        seen_ids.add(pid)
                        all_data.append(r)

            except Exception:
                pass

    page.on("response", handle_response)

    print("🚀 Opening Zipnet…")
    page.goto(URL, wait_until="load", timeout=60000)

    # wait until first backend response
    while not state["initialized"]:
        time.sleep(0.3)

    total_pages = min(
        MAX_PAGES,
        math.ceil(state["total_records"] / 10)
    )

    print("📄 Pages to fetch:", total_pages)

    with tqdm(total=total_pages, desc="Zipnet pages", unit="page") as pbar:
        for _ in range(1, total_pages):
            prev_len = len(all_data)

            # ✅ CLICK REAL DATATABLE NEXT BUTTON
            page.click("#missingPersonGrid_next", timeout=60000)

            # wait for new backend data
            for _ in range(12):  # up to ~12s
                if len(all_data) > prev_len:
                    break
                time.sleep(0.3)

            pbar.update(1)

    browser.close()

with open(FINAL_FILE, "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print("\n🎉 DONE")
print("📁 Total records collected:", len(all_data))
