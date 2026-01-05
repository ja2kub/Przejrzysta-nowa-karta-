
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

        # 2. Check Interaction Block
        # Clicking search input should NOT focus it.
        page.click('#searchInput', force=True)
        # Check if focused
        is_focused = page.evaluate('document.activeElement.id === searchInput')
        if is_focused:
             print('FAIL: Search input got focus.')
        else:
             print('PASS: Search input did not get focus.')

        # 3. Check Hover Menu Block
        # Hover over View button.
        page.hover('#viewBtn')
        page.wait_for_timeout(500)
        is_menu_hidden = page.locator('#viewMenu').get_attribute('class')
        if 'hidden' in is_menu_hidden:
             print('PASS: Menu remained hidden on hover.')
        else:
             print('FAIL: Menu opened on hover.')

        # 4. Check Drag Search Box Width
        search_box = page.locator('#searchBox')
        initial_width = search_box.evaluate('el => el.offsetWidth')
        print(f'Initial Width: {initial_width}')

        box = search_box.bounding_box()
        start_x = box['x'] + box['width'] / 2
        start_y = box['y'] + box['height'] / 2

        page.mouse.move(start_x, start_y)
        page.mouse.down()
        page.mouse.move(start_x + 50, start_y + 50)
        page.mouse.up()

        final_width = search_box.evaluate('el => el.offsetWidth')
        print(f'Final Width: {final_width}')

        if abs(final_width - initial_width) < 5:
             print('PASS: Width maintained.')
        else:
             print('FAIL: Width changed significantly.')

        page.screenshot(path='verification/edit_mode_final.png')
        browser.close()

if __name__ == '__main__':
    run()
