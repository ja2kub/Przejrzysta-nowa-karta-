
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.goto(f"file://{os.getcwd()}/newtab.html")

    # 1. Trigger Prompt (Add Shortcut)
    # Ensure button exists
    print("Clicking Add Shortcut")
    page.click("#addShortcutBtn")

    page.wait_for_selector("#customModal:not(.hidden)", timeout=5000)
    print("Modal is visible")

    page.screenshot(path="verification/custom_prompt_fixed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
