
from playwright.sync_api import sync_playwright
import os
import math

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
        handle = page.locator('.draggable-item .resize-handle').first
        if handle.is_visible():
             print('PASS: Resize handle is visible.')
        else:
             print('FAIL: Resize handle is hidden.')

        # 3. Test Handle Drag (Diagonal)
        clock = page.locator('#clock')
        handle_clock = clock.locator('.resize-handle')

        box = handle_clock.bounding_box()

        # Center of handle (start point)
        start_x = box['x'] + box['width'] / 2
        start_y = box['y'] + box['height'] / 2

        # Move to start
        page.mouse.move(start_x, start_y)
        page.mouse.down()

        # Move diagonally DOWN-RIGHT (should increase scale)
        # Assuming element center is above-left of handle
        page.mouse.move(start_x + 50, start_y + 50)
        page.mouse.up()

        final_style_inc = clock.get_attribute('style') or ''
        print(f'Style after increase drag: {final_style_inc}')

        # Reset (click handle without moving much, might not reset but let's just test decrease)
        # Move back to start and drag UP-LEFT (towards center)
        page.mouse.move(start_x + 50, start_y + 50)
        page.mouse.down()
        page.mouse.move(start_x - 50, start_y - 50) # Move past original point
        page.mouse.up()

        final_style_dec = clock.get_attribute('style') or ''
        print(f'Style after decrease drag: {final_style_dec}')

        if 'scale' in final_style_inc and 'scale' in final_style_dec:
             print('PASS: Scale updated on drag.')
        else:
             print('FAIL: Scale did not update.')

        page.screenshot(path='verification/handles_diagonal.png')
        browser.close()

if __name__ == '__main__':
    run()
