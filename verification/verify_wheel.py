
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

        # Target the clock
        clock = page.locator('#clock')

        # Check initial transform
        initial_style = clock.get_attribute('style') or ''
        print(f'Initial Style: {initial_style}')

        # Mouse wheel
        box = clock.bounding_box()
        page.mouse.move(box['x'] + 20, box['y'] + 20)

        # Simulate wheel
        # Note: In some browsers/playwright versions, synthetic wheel might not trigger standard scroll events if overflow is hidden,
        # but here we have a document listener.
        page.mouse.wheel(0, -100)
        page.wait_for_timeout(500)

        final_style = clock.get_attribute('style') or ''
        print(f'Final Style: {final_style}')

        if 'scale' in final_style:
             print('PASS: Scale applied.')
        else:
             print('FAIL: Scale not applied.')

        browser.close()

if __name__ == '__main__':
    run()
