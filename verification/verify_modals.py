
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(f"file://{os.getcwd()}/newtab.html")

    # 1. Trigger Prompt (Add Shortcut)
    # Ensure button exists
    print("Clicking Add Shortcut")
    page.click("#addShortcutBtn")

    # Force verify
    time.sleep(1)
    page.screenshot(path="verification/custom_prompt.png")

    browser.close()

import time
with sync_playwright() as playwright:
    run(playwright)
