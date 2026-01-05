
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content("""
        <html>
        <style>
          #parent { width: 100px; height: 100px; background: red; padding: 20px; position: absolute; top:0; left:0; }
          #child { width: 50px; height: 50px; background: blue; pointer-events: none; }
        </style>
        <body>
          <div id="parent">
            <div id="child">BUTTON</div>
          </div>
          <script>
            window.log = [];
            document.addEventListener("mousedown", (e) => window.log.push(e.target.id));
          </script>
        </body>
        </html>
        """)

        # Click on the child (which has pointer-events: none)
        # Parent is at 0,0 100x100. Padding 20. Child is inside.
        # Click at 30,30 should hit child visually, but pass to parent.
        page.mouse.click(30, 30)

        log = page.evaluate("window.log")
        print(f"Log: {log}")
        browser.close()

if __name__ == "__main__":
    run()
