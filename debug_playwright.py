
from playwright.sync_api import sync_playwright
import os

def run():
    file_path = os.path.abspath('newtab.html')
    url = f'file://{file_path}'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        page.click('#viewBtn')
        page.wait_for_selector('#viewMenu:not(.hidden)')
        page.click('#editLayoutBtn')

        # Inject debug script
        with open('debug_script.js', 'r') as f:
            script = f.read()
            page.evaluate(script)

        browser.close()

if __name__ == '__main__':
    run()
