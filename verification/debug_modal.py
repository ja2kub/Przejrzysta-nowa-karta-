
from playwright.sync_api import sync_playwright
import os
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.goto(f"file://{os.getcwd()}/newtab.html")

    # 1. Trigger Prompt
    page.click("#addShortcutBtn")
    time.sleep(1)

    # Check classes of modal
    classes = page.eval_on_selector("#customModal", "el => el.className")
    print(f"Modal classes: {classes}")

    # Check aria-hidden
    aria = page.eval_on_selector("#customModal", "el => el.getAttribute(aria-hidden)")
    print(f"Aria hidden: {aria}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
