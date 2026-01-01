
from playwright.sync_api import sync_playwright
import os
import json

def run():
    file_path = os.path.abspath('newtab.html')
    url = f'file://{file_path}'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Pre-seed localStorage with some positions
        # Simulating controlsLeft being moved
        positions = {
            'controlsLeft': {'left': '100px', 'top': '100px', 'scale': 1.0}
        }

        # We need to set localStorage before loading page logic?
        # Playwright allows init scripts.

        init_script = f"""
        localStorage.setItem('guiPositions', '{json.dumps(positions)}');
        """
        context.add_init_script(init_script)

        page = context.new_page()
        page.on('console', lambda msg: print(f'Console: {msg.text}'))
        page.goto(url)

        # Check interaction
        btn = page.locator('#customizeBtn')
        menu = page.locator('#customizeMenu')

        print(f'Menu Class Before: {menu.get_attribute("class")}')

        # Hover
        btn.hover()
        page.wait_for_timeout(500)

        print(f'Menu Class After Hover: {menu.get_attribute("class")}')

        # Click
        btn.click()
        page.wait_for_timeout(500)
        print(f'Menu Class After Click: {menu.get_attribute("class")}')

        # Check computed style of menu to see if it is visible on screen
        visible = menu.evaluate('el => window.getComputedStyle(el).display !== "none" && window.getComputedStyle(el).visibility !== "hidden"')
        print(f'Menu Visible Computed: {visible}')

        browser.close()

if __name__ == '__main__':
    run()
