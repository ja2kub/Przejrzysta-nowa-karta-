
from playwright.sync_api import sync_playwright
import os

def run():
    file_path = os.path.abspath('newtab.html')
    url = f'file://{file_path}'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on('console', lambda msg: print(f'Console: {msg.text}'))
        page.goto(url)

        page.click('#viewBtn')
        page.wait_for_selector('#viewMenu:not(.hidden)')
        page.click('#editLayoutBtn')

        page.wait_for_timeout(100)

        count = page.evaluate('document.querySelectorAll(".resize-handle").length')
        print(f'Handle Count: {count}')

        # Check draggable item class on clock
        clock_classes = page.evaluate('document.getElementById("clock").className')
        print(f'Clock Classes: {clock_classes}')

        browser.close()

if __name__ == '__main__':
    run()
