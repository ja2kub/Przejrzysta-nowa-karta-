
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Mock weather response
    page.route("**/current.json*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body="""{
            "current": {
                "temp_c": 19.5,
                "humidity": 65,
                "wind_kph": 15.2,
                "condition": {
                    "text": "Partly cloudy",
                    "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png"
                }
            }
        }"""
    ))

    page.goto(f"file://{os.getcwd()}/newtab.html")

    # 1. Enable Weather
    page.click("#customizeBtn")

    def handle_weather_dialog(dialog):
        if "API" in dialog.message:
            dialog.accept("MOCK_KEY")
        else:
            dialog.dismiss()

    page.on("dialog", handle_weather_dialog)

    page.click("#weatherToggle")

    # 2. Enable Date
    page.click("#dateToggle")

    # Wait for widgets
    try:
        page.wait_for_selector("#weatherWidget:not(.hidden)", timeout=3000)
    except:
        print("Weather widget wait timeout")

    try:
        page.wait_for_selector("#dateWidget:not(.hidden)", timeout=3000)
    except:
        print("Date widget wait timeout")

    page.wait_for_timeout(1000)

    page.screenshot(path="verification/full_features.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
