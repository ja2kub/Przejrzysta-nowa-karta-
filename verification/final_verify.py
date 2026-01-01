
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

        # Drag
        search_box = page.locator('#searchBox')
        box = search_box.bounding_box()
        start_x = box['x'] + box['width'] / 2
        start_y = box['y'] + box['height'] / 2

        page.mouse.move(start_x, start_y)
        page.mouse.down()
        page.mouse.move(start_x + 200, start_y + 200, steps=10)
        page.mouse.up()

        page.screenshot(path='verification/final_verify.png')
        browser.close()

if __name__ == '__main__':
    run()

