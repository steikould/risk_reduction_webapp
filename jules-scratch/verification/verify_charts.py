import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        html_file_path = os.path.abspath('power_consumption.html')
        await page.goto(f'file://{html_file_path}')

        await page.wait_for_selector('#app')

        # Navigate to AI Insights chart
        await page.get_by_role("button", name="Run Query").click()
        await page.get_by_role("button", name="Next").click()

        # Wait a long time for the mock loading to complete
        await page.wait_for_timeout(5000)
        await page.screenshot(path='jules-scratch/verification/01_ai_insights_charts.png')

        # Navigate to Forecast chart
        await page.get_by_role("button", name="Next").click()
        await page.wait_for_timeout(1000)
        await page.screenshot(path='jules-scratch/verification/02_forecast_chart.png')

        # Navigate to Golden Tables chart
        await page.get_by_role("button", name="Golden Tables").click()
        await page.wait_for_timeout(1000)
        await page.screenshot(path='jules-scratch/verification/03_golden_tables_chart.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
