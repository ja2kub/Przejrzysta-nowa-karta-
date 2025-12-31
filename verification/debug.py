
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"PageError: {err}"))
    page.goto(f"file://{os.getcwd()}/newtab.html")

    # Check if elements exist
    exists = page.evaluate("() => !!document.getElementById(customModal)")
    print("Modal exists in JS:", exists)

    page.click("#addShortcutBtn")
    page.wait_for_selector("#customModal:not(.hidden)", timeout=3000)
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
