
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.goto(f"file://{os.getcwd()}/newtab.html")

    # Debug DOM
    page.evaluate("""
        console.log("cModal element:", document.getElementById("customModal"));
        console.log("cModal classList:", document.getElementById("customModal").classList.toString());
        console.log("cModal style:", document.getElementById("customModal").style.cssText);
    """)

    print("Clicking Add Shortcut")
    page.click("#addShortcutBtn")

    # Wait for class removal
    page.wait_for_function("!document.getElementById(customModal).classList.contains(hidden)")

    print("Modal hidden class removed")
    page.screenshot(path="verification/custom_prompt_fixed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
