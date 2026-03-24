const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:5000');
  await page.waitForTimeout(2000);
  
  console.log("Clicking New Game...");
  // Click "NEW GAME!"
  await page.mouse.click(500, 800); // Approximate location
  await page.waitForTimeout(2000);
  
  console.log("Clicking Suitcase...");
  // Click Suitcase in bottom nav
  // Usually around x=398, y=872 for narrow view, let's just resize to narrow
  await page.setViewportSize({ width: 500, height: 900 });
  await page.waitForTimeout(1000);
  
  // Click the 4th button in the bottom nav
  await page.mouse.click(398, 872);
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
