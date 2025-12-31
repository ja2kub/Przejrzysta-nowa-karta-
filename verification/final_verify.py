
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.goto(f"file://{os.getcwd()}/newtab.html")

    print("Clicking Add Shortcut")
    page.click("#addShortcutBtn")

    # Wait for selector explicitly
    try:
        page.wait_for_selector("#customModal", state="visible", timeout=3000)
        print("Modal visible!")
    except:
        print("Modal check failed")

    page.screenshot(path="verification/custom_prompt_fixed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
