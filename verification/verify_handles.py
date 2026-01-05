
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

        # 2. Check Handle Visibility
        # Select one handle
        handle = page.locator('.draggable-item .resize-handle').first
        if handle.is_visible():
             print('PASS: Resize handle is visible.')
        else:
             print('FAIL: Resize handle is hidden.')

        # 3. Test Handle Drag
        clock = page.locator('#clock')
        handle_clock = clock.locator('.resize-handle')

        # Get scale before (via style or computed style matrix)
        # style transform should be none or scale(1)

        box = handle_clock.bounding_box()
        start_x = box['x'] + box['width'] / 2
        start_y = box['y'] + box['height'] / 2

        page.mouse.move(start_x, start_y)
        page.mouse.down()
        # Drag down to increase scale
        page.mouse.move(start_x, start_y + 100)
        page.mouse.up()

        final_style = clock.get_attribute('style') or ''
        print(f'Final Style: {final_style}')

        if 'scale' in final_style and '1.' in final_style:
             print('PASS: Handle resize updated transform.')
        else:
             print('FAIL: Handle resize did not update transform correctly.')

        page.screenshot(path='verification/handles_verify.png')
        browser.close()

if __name__ == '__main__':
    run()
