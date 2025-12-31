
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

    # Check if we can find it by style
    try:
        page.wait_for_selector("#customModal", state="visible", timeout=3000)
        print("Modal visible via normal check")
    except:
        print("Modal check failed")

        # Check computed style
        display = page.eval_on_selector("#customModal", "el => window.getComputedStyle(el).display")
        print(f"Computed Display: {display}")
        opacity = page.eval_on_selector("#customModal", "el => window.getComputedStyle(el).opacity")
        print(f"Computed Opacity: {opacity}")
        visibility = page.eval_on_selector("#customModal", "el => window.getComputedStyle(el).visibility")
        print(f"Computed Visibility: {visibility}")

    page.screenshot(path="verification/custom_prompt_fixed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
