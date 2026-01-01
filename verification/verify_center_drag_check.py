
from playwright.sync_api import sync_playwright
import os

def run():
    file_path = os.path.abspath('newtab.html')
    url = f'file://{file_path}'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)

        # 1. Enter Edit Mode
        page.click('#viewBtn')
        page.wait_for_selector('#viewMenu:not(.hidden)')
        page.click('#editLayoutBtn')

        # 2. Test Handle Drag
        clock = page.locator('#clock')
        handle_clock = clock.locator('.resize-handle')

        box = handle_clock.bounding_box()
        if not box:
            print('FAIL: Handle box not found')
            return

        start_x = box['x'] + box['width'] / 2
        start_y = box['y'] + box['height'] / 2

        # Calculate center of clock
        clock_box = clock.bounding_box()
        center_x = clock_box['x'] + clock_box['width'] / 2
        center_y = clock_box['y'] + clock_box['height'] / 2

        # Move to handle
        page.mouse.move(start_x, start_y)
        page.mouse.down()

        # Drag away from center
        page.mouse.move(start_x + 50, start_y + 50)
        page.mouse.up()

        final_style = clock.get_attribute('style') or ''
        print(f'Final Style: {final_style}')

        if 'scale' in final_style:
             print('PASS: Scale modified.')
        else:
             print('FAIL: Scale not modified.')

        page.screenshot(path='verification/center_drag_check.png')
        browser.close()

if __name__ == '__main__':
    run()
