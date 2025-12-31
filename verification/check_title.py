
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(f"file://{os.getcwd()}/newtab.html")

    print("Clicking Add Shortcut")
    page.click("#addShortcutBtn")

    # Wait for visible
    page.wait_for_selector("#customModal", state="visible")

    # Verify title is empty/hidden
    title_visible = page.is_visible("#cModalTitle")
    title_text = page.text_content("#cModalTitle")
    print(f"Title Visible: {title_visible}, Text: {title_text}")

    # If using classList hidden, it should be effectively invisible
    # The helper wait_for_selector waits for visibility.
    # If title is hidden, checking #cModalTitle visibility should be false.
    # Note: wait_for_selector checks the modal itself.

    try:
        visible = page.is_visible("#cModalTitle")
        print(f"Title Element Visibility: {visible}")
        if visible:
             # Check if it has .hidden class?
             classes = page.eval_on_selector("#cModalTitle", "el => el.className")
             print(f"Title classes: {classes}")
    except:
        print("Title element not found or check failed")

    page.screenshot(path="verification/final_modal_check.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
