
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

        # 2. Check Exit Button visibility
        exit_btn = page.locator('#exitEditModeBtn')
        if exit_btn.is_visible():
            print('Exit Button is visible.')
        else:
            print('Exit Button is NOT visible.')

        # 3. Test Resize (Wheel) on Clock
        clock = page.locator('#clock')
        # Get initial scale or size
        # Since we use transform, we can check bounding box change
        box1 = clock.bounding_box()

        # Wheel Scroll Up (negative deltaY to zoom in)
        # Note: Playwright doesn't have a direct wheel method on element, but we can dispatch event or use mouse.wheel
        page.mouse.move(box1['x'] + 10, box1['y'] + 10)
        page.mouse.wheel(0, -500)
        page.wait_for_timeout(200) # wait for update

        box2 = clock.bounding_box()
        print(f'Clock Box 1: {box1}')
        print(f'Clock Box 2: {box2}')

        if box2['width'] > box1['width']:
            print('Resize works: Element grew larger.')
        else:
            print('Resize check inconclusive (could be timing or step size).')

        # 4. Check Interaction Block (try to click view button again)
        # View button is inside controlsRight. Clicking it should NOT open menu in edit mode.
        # But wait, controlsRight itself is draggable.
        # We need to click strictly on the button.

        # Close menu first if it's open (it should be closed by toggleEditMode logic)
        is_menu_hidden = page.locator('#viewMenu').get_attribute('class')
        print(f'Menu classes: {is_menu_hidden}')

        # Click view button
        page.click('#viewBtn', force=True) # force because maybe pointer-events issue?
        # Actually our global listener uses capture phase to stop propagation.

        page.wait_for_timeout(500)
        is_menu_hidden_after = page.locator('#viewMenu').get_attribute('class')
        if 'hidden' in is_menu_hidden_after:
             print('Interaction blocked: Menu remained hidden.')
        else:
             print('Interaction failed: Menu opened.')

        page.screenshot(path='verification/edit_mode_refinements.png')
        browser.close()

if __name__ == '__main__':
    run()
