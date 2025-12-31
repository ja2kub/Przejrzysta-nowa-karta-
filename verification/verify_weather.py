
from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    # Correct path
    page.goto(f"file://{os.getcwd()}/newtab.html")

    # Wait for page load
    page.wait_for_selector("#customizeBtn")

    # 1. Click Personalization (Customize)
    page.click("#customizeBtn")

    # 2. Wait for menu
    page.wait_for_selector("#customizeMenu:not(.hidden)")

    # 3. Take screenshot of menu with weather option
    page.screenshot(path="verification/menu_check.png")

    # 4. Click Weather button (Toggle)
    # This should prompt for API key. We need to handle the dialog.

    def handle_dialog(dialog):
        print(f"Dialog message: {dialog.message}")
        dialog.accept("DUMMY_API_KEY")

    page.on("dialog", handle_dialog)

    page.click("#weatherToggle")

    # 5. Wait for weather widget to appear
    # The fetch will likely fail (401/403) and remove the key/hide the widget OR show "..."
    # My code says: if fetch fails 401/403, it alerts and hides widget.
    # So we expect it to flash or show "..." if the failure handling is slow or if it renders before fetch completes.
    # Actually, my code calls updateWeatherVisibility -> fetchWeather.
    # fetch is async. The widget is shown immediately (classList.remove("hidden")), then fetch happens.

    try:
        page.wait_for_selector("#weatherWidget:not(.hidden)", timeout=2000)
    except:
        print("Widget did not appear or was hidden quickly due to error")

    # 6. Take screenshot of widget
    page.screenshot(path="verification/weather_widget_check.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
