const log = require('electron-log');

class AntiBotProtection {
  constructor() {
    this.enabled = true;
  }

  async apply(page) {
    if (!this.enabled) return;

    await this.injectStealthScripts(page);
    await this.setupEvasion(page);
    await this.randomizeFingerprint(page);

    log.info('Anti-bot protection applied');
  }

  async injectStealthScripts(page) {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      });

      window.navigator.chrome = {
        runtime: {
          connect: () => {},
          sendMessage: () => {}
        }
      };

      const originalNavigator = Object.getOwnPropertyDescriptor(
        window.navigator,
        'permissions'
      );

      if (originalNavigator) {
        Object.defineProperty(window.navigator, 'permissions', {
          ...originalNavigator,
          value: async (query) => {
            if (query.name === 'notifications') {
              return { state: Notification.permission };
            }
            return originalNavigator.value(query);
          }
        });
      }
    });
  }

  async setupEvasion(page) {
    await page.evaluateOnNewDocument(() => {
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      HTMLCanvasElement.prototype.getContext = (function(original) {
        return function(type, attributes) {
          const context = original.call(this, type, attributes);
          if (type === '2d') {
            const originalGetImageData = context.getImageData;
            context.getImageData = function(sx, sy, sw, sh) {
              return originalGetImageData.call(this, sx, sy, sw, sh);
            };
          }
          return context;
        };
      })(HTMLCanvasElement.prototype.getContext);

      Element.prototype.attachShadow = (function(original) {
        return function(mode) {
          return original.call(this, mode || 'open');
        };
      })(Element.prototype.attachShadow);
    });
  }

  async randomizeFingerprint(page) {
    const plugins = [
      'Chrome PDF Plugin',
      'Chrome PDF Viewer',
      'Native Client',
      'Unity Player',
      'Widevine Content Decryption Module'
    ];

    const languages = ['zh-CN', 'zh', 'en-US', 'en'];

    await page.evaluateOnNewDocument((data) => {
      Object.defineProperty(navigator, 'plugins', {
        get: () => data.plugins
      });

      Object.defineProperty(navigator, 'languages', {
        get: () => data.languages
      });

      Object.defineProperty(screen, 'colorDepth', {
        get: () => 24
      });

      Object.defineProperty(screen, 'deviceXDPI', {
        get: () => 96
      });

      Object.defineProperty(screen, 'deviceYDPI', {
        get: () => 96
      });
    }, { plugins, languages });

    await page.emulateTimezone({ timezoneId: 'Asia/Shanghai' });
  }

  async humanLikeScroll(page) {
    const scrollSteps = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < scrollSteps; i++) {
      const scrollAmount = Math.floor(Math.random() * 400) + 200;
      await page.evaluate((amount) => {
        window.scrollBy(0, amount);
      }, scrollAmount);

      await this.randomDelay(200, 500);
    }
  }

  async humanLikeClick(page, selector) {
    const rect = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    }, selector);

    if (!rect) return;

    const clickX = rect.x + Math.random() * rect.w;
    const clickY = rect.y + Math.random() * rect.h;

    await page.mouse.click(clickX, clickY);
    await this.randomDelay(50, 150);
  }

  async randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  disable() {
    this.enabled = false;
    log.info('Anti-bot protection disabled');
  }

  enable() {
    this.enabled = true;
    log.info('Anti-bot protection enabled');
  }
}

module.exports = AntiBotProtection;