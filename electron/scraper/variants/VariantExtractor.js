const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const log = require('electron-log');

class VariantExtractor {
  constructor() {
    this.variants = [];
  }

  async extract(page) {
    try {
      const variantData = await page.evaluate(() => {
        const results = {
          colors: [],
          sizes: [],
          styles: [],
          allVariants: []
        };

        const colorSelectors = [
          '[class*="color"]',
          '[class*="sku"]',
          '.color-item',
          '.sku-item',
          '[class*="spec"]'
        ];

        colorSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length < 50) {
              if (!results.allVariants.includes(text)) {
                results.allVariants.push(text);
              }
            }
          });
        });

        const imageGallery = document.querySelectorAll('.goods-item, .thumb-item, [class*="gallery"] img');
        results.images = Array.from(imageGallery).map(img => ({
          src: img.src || img.dataset.src,
          alt: img.alt
        }));

        return results;
      });

      this.variants = variantData.allVariants;
      return variantData;
    } catch (error) {
      log.error('Variant extraction error:', error);
      return { colors: [], sizes: [], styles: [], allVariants: [] };
    }
  }

  async clickVariant(page, variantName) {
    try {
      const clicked = await page.evaluate((name) => {
        const elements = document.querySelectorAll('[class*="color"], [class*="sku"], [class*="spec"], [class*="size"]');

        for (const el of elements) {
          if (el.textContent.trim().includes(name)) {
            el.click();
            return true;
          }
        }
        return false;
      }, variantName);

      if (clicked) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return clicked;
    } catch (error) {
      log.error('Click variant error:', error);
      return false;
    }
  }

  async getCurrentImage(page) {
    try {
      const image = await page.evaluate(() => {
        const mainImg = document.querySelector('.main-image img, .goods-image img, [class*="gallery"] img');
        return mainImg ? (mainImg.src || mainImg.dataset.src) : null;
      });
      return image;
    } catch (error) {
      log.error('Get current image error:', error);
      return null;
    }
  }

  async extractAllVariantImages(page) {
    const results = [];

    for (const variant of this.variants) {
      await this.clickVariant(page, variant);
      const image = await this.getCurrentImage(page);

      results.push({
        variant,
        image
      });
    }

    return results;
  }

  getVariants() {
    return this.variants;
  }
}

module.exports = VariantExtractor;