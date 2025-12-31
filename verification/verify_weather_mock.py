
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Mock the API response
    page.route("**/current.json*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body="""{
            "current": {
                "temp_c": 21.5,
                "condition": {
                    "text": "Partly cloudy",
                    "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png"
                }
            }
        }"""
    ))

    page.goto(f"file://{os.getcwd()}/newtab.html")

    # Open menu
    page.click("#customizeBtn")
    page.wait_for_selector("#weatherToggle")

    # Handle the prompt for API Key
    def handle_dialog(dialog):
        # Only accept the prompt asking for key
        if "API" in dialog.message:
            dialog.accept("MOCK_KEY")
        else:
            dialog.dismiss()

    page.on("dialog", handle_dialog)

    # Click toggle
    page.click("#weatherToggle")

    # Wait for widget - use a slightly longer timeout and better selector if needed
    try:
        page.wait_for_selector("#weatherWidget:not(.hidden)", timeout=5000)
    except:
        print("Widget wait failed.")

    # Take screenshot
    page.screenshot(path="verification/weather_widget_mocked.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
