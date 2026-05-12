const puppeteer = require('puppeteer-extra');
const log = require('electron-log');

class DescriptionExtractor {
  constructor() {
    this.images = [];
  }

  async extract(page) {
    try {
      await this.scrollToLoadImages(page);

      const images = await page.evaluate(() => {
        const results = [];
        const seen = new Set();

        const sections = document.querySelectorAll(
          '.goods-desc, .description, [class*="description"], #description, [class*="detail"], [class*="content"]'
        );

        sections.forEach(section => {
          const imgs = section.querySelectorAll('img');
          imgs.forEach(img => {
            const src = img.dataset.src || img.src || img.dataset.lazySrc;
            if (src && !src.includes('data:') && !seen.has(src)) {
              seen.add(src);
              results.push({
                url: src,
                alt: img.alt || '',
                width: img.naturalWidth || img.width,
                height: img.naturalHeight || img.height
              });
            }
          });
        });

        const allImgs = document.querySelectorAll('img');
        allImgs.forEach(img => {
          const src = img.dataset.src || img.src || img.dataset.lazySrc;
          if (src &&
              !src.includes('data:') &&
              !seen.has(src) &&
              (src.includes('yangkeduo') || src.includes('pinduoduo') || src.includes('cdn'))) {
            seen.add(src);
            results.push({
              url: src,
              alt: img.alt || ''
            });
          }
        });

        return results;
      });

      this.images = images;
      return images;
    } catch (error) {
      log.error('Description extraction error:', error);
      return [];
    }
  }

  async scrollToLoadImages(page) {
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    for (let i = 0; i < scrollHeight; i += viewportHeight) {
      await page.evaluate((pos) => {
        window.scrollTo(0, pos);
      }, i);

      await new Promise(resolve => setTimeout(resolve, 300));

      await page.evaluate(() => {
        window.scrollBy(0, 100);
      });

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }

  async waitForLazyLoad(page, timeout = 5000) {
    await page.evaluate(async (ms) => {
      const delay = (fn) => new Promise(resolve => setTimeout(fn, ms));

      const imgs = document.querySelectorAll('img');
      for (const img of imgs) {
        if (img.dataset.src && !img.src.includes(img.dataset.src)) {
          img.src = img.dataset.src;
        }
      }

      await delay(1000);
    }, timeout);
  }

  getImages() {
    return this.images;
  }

  async extractWithNetwork(page) {
    const captured = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('description') || url.includes('detail') || url.includes('goods_desc')) {
        try {
          const text = await response.text();
          if (text.includes('.jpg') || text.includes('.png') || text.includes('img')) {
            const matches = text.match(/https?:\/\/[^\s"']+\.(jpg|png|jpeg|webp)/gi);
            if (matches) {
              captured.push(...matches);
            }
          }
        } catch (e) {}
      }
    });

    await this.scrollToLoadImages(page);
    await this.waitForLazyLoad(page);

    return [...new Set([...this.images.map(i => i.url), ...captured])];
  }
}

module.exports = DescriptionExtractor;