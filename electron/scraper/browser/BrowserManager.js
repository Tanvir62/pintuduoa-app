const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isMobile = true;
  }

  async launch(options = {}) {
    try {
      puppeteer.use(pluginStealth());

      const userDataDir = path.join(process.cwd(), 'config', 'browser-data');
      if (!fs.existsSync(userDataDir)) {
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

      this.browser = await puppeteer.launch(launchOptions);
      this.page = await this.browser.newPage();

      await this.setupMobileViewport();
      await this.setupNetworkInterceptor();
      await this.injectAntiDetection();

      log.info('Browser launched with stealth mode');
      return true;
    } catch (error) {
      log.error('Browser launch error:', error);
      throw error;
    }
  }

  async setupMobileViewport() {
    await this.page.setViewport({
      width: 375,
      height: 812,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3
    });
  }

  async setMobileUserAgent() {
    const ua = 'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.47.2560(0x67002F47) NetType/WIFI Language/zh_CN';
    await this.page.setUserAgent(ua);
  }

  async setupNetworkInterceptor() {
    await this.page.setRequestInterception(true);

    this.page.on('request', (request) => {
      request.continue();
    });

    this.page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();

      if (url.includes('api.yangkeduo.com') || url.includes('pinduoduo')) {
        try {
          const headers = response.headers();
          const body = await response.text();
          log.debug('Network response:', url, status);
        } catch (e) {
          log.debug('Failed to parse response:', e.message);
        }
      }
    });
  }

  async injectAntiDetection() {
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      });

      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });

      Object.defineProperty(navigator, 'languages', {
        get: () => ['zh-CN', 'zh', 'en']
      });

      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      window.chrome = { runtime: {} };
    });
  }

  async navigate(url) {
    await this.setMobileUserAgent();
    await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await this.waitForPageReady();
  }

  async waitForPageReady() {
    await this.page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
      });
    });
    await this.sleep(500);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async executeScript(script) {
    return await this.page.evaluate(script);
  }

  async click(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.click(selector);
      await this.sleep(300);
    } catch (error) {
      log.error('Click failed:', selector, error.message);
      throw error;
    }
  }

  async scroll(position = 'bottom') {
    await this.page.evaluate(async (pos) => {
      const delay = (ms) => new Promise(r => setTimeout(r, ms));

      if (pos === 'bottom') {
        window.scrollTo(0, document.body.scrollHeight);
        await delay(500);
        window.scrollBy(0, -500);
        await delay(200);
        window.scrollBy(0, 300);
      } else {
        window.scrollTo(0, 0);
      }
    }, position);
  }

  async getPageContent() {
    return await this.page.content();
  }

  async waitForSelector(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async screenshot() {
    return await this.page.screenshot({ encoding: 'base64' });
  }

  async getSession() {
    const cookies = await this.page.cookies();
    const localStorage = await this.page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        storage[key] = localStorage.getItem(key);
      }
      return storage;
    });

    return { cookies, localStorage };
  }

  async restoreSession(session) {
    if (session.cookies) {
      for (const cookie of session.cookies) {
        await this.page.setCookie(cookie);
      }
    }
    if (session.localStorage) {
      await this.page.evaluate((storage) => {
        for (const [key, value] of Object.entries(storage)) {
          localStorage.setItem(key, value);
        }
      }, session.localStorage);
    }
  }

  async close() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    log.info('Browser closed');
  }
}

module.exports = BrowserManager;