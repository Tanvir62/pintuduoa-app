const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    puppeteer.use(pluginStealth());

    const userDataDir = path.join(process.cwd(), 'config', 'browser-data');
    if (!fs.existsSync(userDataDir)) {
      console.log('Creating userDataDir at', userDataDir);
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    const launchOptions = {
      headless: false,
      userDataDir,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-size=375,812',
        '--disable-web-security'
      ]
    };

    console.log('Launching Puppeteer with options:', JSON.stringify(launchOptions));
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.goto('about:blank');
    console.log('Puppeteer launched successfully');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Puppeteer launch failed:', err);
    process.exit(1);
  }
})();
