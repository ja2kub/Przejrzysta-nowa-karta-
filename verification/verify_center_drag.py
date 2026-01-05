
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

        # 2. Target Clock Handle
        # Clock is centered initially.
        clock = page.locator('#clock')
        handle = clock.locator('.resize-handle')

        # Ensure handle is visible
        if not handle.is_visible():
             print('Handle not visibly rendered.')
             # This might be because of CSS opacity/z-index/position
             # But let's try to drag it anyway based on coordinates
        else:
             print('Handle is visible.')

        handle_box = handle.bounding_box()
        print(f'Handle Box: {handle_box}')

        start_x = handle_box['x'] + handle_box['width'] / 2
        start_y = handle_box['y'] + handle_box['height'] / 2

        # Calculate center of clock
        clock_box = clock.bounding_box()
        center_x = clock_box['x'] + clock_box['width'] / 2
        center_y = clock_box['y'] + clock_box['height'] / 2

        print(f'Clock Center: {center_x}, {center_y}')
        print(f'Drag Start: {start_x}, {start_y}')

        # Move to handle center
        page.mouse.move(start_x, start_y)
        page.mouse.down()

        # Drag AWAY from center (increase scale)
        # Vector from center to handle is (start_x - center_x, start_y - center_y)
        dx = start_x - center_x
        dy = start_y - center_y

        # Move further out
        page.mouse.move(start_x + dx, start_y + dy)
        page.mouse.up()

        final_style = clock.get_attribute('style') or ''
        print(f'Final Style: {final_style}')

        if 'scale' in final_style:
             # Check if scale > 1
             # Format is typically scale(1.xxx)
             print('PASS: Scale modified.')
        else:
             print('FAIL: Scale not modified.')

        page.screenshot(path='verification/center_drag.png')
        browser.close()

if __name__ == '__main__':
    run()
