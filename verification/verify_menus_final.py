
from playwright.sync_api import sync_playwright
import os
import json

def run():
    file_path = os.path.abspath('newtab.html')
    url = f'file://{file_path}'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Test Case 1: Normal Mode, default position
        page = context.new_page()
        page.goto(url)

        # Hover customize
        page.hover('#customizeBtn')
        page.wait_for_timeout(200)

        menu_class = page.locator('#customizeMenu').get_attribute('class')
        if 'hidden' in menu_class:
            print('FAIL: Menu not opening in normal mode (default).')
        else:
            print('PASS: Menu opens in normal mode (default).')

        page.screenshot(path='verification/menu_default.png')
        page.close()

        # Test Case 2: Saved Position (moved to top-left)
        # This tests if the menu still opens relative to the button
        init_script = f"""
        localStorage.setItem('guiPositions', '{json.dumps({
            'controlsLeft': {'left': '50px', 'top': '50px', 'scale': 1.0}
        })}');
        """
        context.add_init_script(init_script)

        page2 = context.new_page()
        page2.goto(url)

        # Hover customize
        page2.hover('#customizeBtn')
        page2.wait_for_timeout(200)

        menu_class_2 = page2.locator('#customizeMenu').get_attribute('class')
        if 'hidden' in menu_class_2:
            print('FAIL: Menu not opening with custom position.')
        else:
            print('PASS: Menu opens with custom position.')

        # Check computed position logic via screenshot
        page2.screenshot(path='verification/menu_moved.png')

        browser.close()

if __name__ == '__main__':
    run()
