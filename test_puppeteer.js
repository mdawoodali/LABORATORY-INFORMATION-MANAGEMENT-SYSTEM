const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:3000/pas-report?id=353778', { waitUntil: 'networkidle2' });
  const content = await page.content();
  if (content.includes('End of Report')) {
    console.log('SUCCESS: Page loaded successfully');
  } else {
    console.log('FAILED: Page content does not contain expected text');
  }
  await browser.close();
})();
