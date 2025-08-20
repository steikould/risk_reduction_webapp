import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Get the absolute path to the HTML file
        html_file_path = os.path.abspath('power_consumption.html')

        await page.goto(f'file://{html_file_path}')

        # Wait for the page to load and render
        await page.wait_for_selector('#app')

        # Take a screenshot of the initial Analysis tab
        await page.screenshot(path='jules-scratch/verification/01_analysis_tab.png')

        # Click on the Data Sources tab and take a screenshot
        await page.get_by_role("button", name="Data Sources").click()
        await page.wait_for_selector('#data-tab:not(.hidden)')
        await page.screenshot(path='jules-scratch/verification/02_data_sources_tab.png')

        # Click on the Golden Tables tab and take a screenshot
        await page.get_by_role("button", name="Golden Tables").click()
        await page.wait_for_selector('#golden-tab:not(.hidden)')
        await page.screenshot(path='jules-scratch/verification/03_golden_tables_tab.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
