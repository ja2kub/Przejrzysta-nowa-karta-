
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(f"file://{os.getcwd()}/newtab.html")

    print("Clicking Add Shortcut")
    page.click("#addShortcutBtn")

    # Wait for selector explicitly
    try:
        page.wait_for_selector("#customModal", state="visible", timeout=3000)
        print("Modal visible!")
    except:
        print("Modal still not visible. Checking why.")
        display = page.eval_on_selector("#customModal", "el => el.style.display")
        print(f"Inline Display: {display}")
        classes = page.eval_on_selector("#customModal", "el => el.className")
        print(f"Classes: {classes}")

    page.screenshot(path="verification/custom_prompt_fixed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
