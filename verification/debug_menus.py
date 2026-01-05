
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

        # Check initial body class
        body_class = page.get_attribute('body', 'class')
        print(f'Body Class: {body_class}')

        # Check interaction with customizeBtn
        btn = page.locator('#customizeBtn')
        menu = page.locator('#customizeMenu')

        print(f'Menu Class Before: {menu.get_attribute("class")}')

        # Hover
        btn.hover()
        page.wait_for_timeout(500)

        print(f'Menu Class After Hover: {menu.get_attribute("class")}')

        # Click
        page.mouse.move(0,0) # move away
        page.click('body') # close if open
        page.wait_for_timeout(200)

        btn.click()
        page.wait_for_timeout(500)
        print(f'Menu Class After Click: {menu.get_attribute("class")}')

        browser.close()

if __name__ == '__main__':
    run()
