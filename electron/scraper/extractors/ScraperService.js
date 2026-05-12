const log = require('electron-log');

class ScraperService {
  constructor() {
    this.autoScrollEnabled = false;
    this.autoScrollInterval = null;
  }

  getBrowserManager() {
    if (!this._browserManager) {
      const BrowserManager = require('../browser/BrowserManager');
      this._browserManager = new BrowserManager();
    }
    return this._browserManager;
  }

  async extractProduct() {
    const browser = this.getBrowserManager();
    try {
      const productData = await browser.executeScript(() => {
        const data = {};

        const titleEl = document.querySelector('.goods-title, .product-title, [class*="title"], h1');
        data.title = titleEl ? titleEl.textContent.trim() : '';

        const priceEl = document.querySelector('.price, .goods-price, [class*="price"]');
        data.price = priceEl ? priceEl.textContent.trim() : '';

        const originalPriceEl = document.querySelector('.original-price, [class*="original"]');
        data.originalPrice = originalPriceEl ? originalPriceEl.textContent.trim() : '';

        const stockEl = document.querySelector('.stock, [class*="stock"]');
        data.stock = stockEl ? stockEl.textContent.trim() : '';

        const soldEl = document.querySelector('.sold-count, [class*="sold"]');
        data.soldCount = soldEl ? soldEl.textContent.trim() : '';

        const shopEl = document.querySelector('.shop-name, [class*="shop-name"], .seller');
        data.shopName = shopEl ? shopEl.textContent.trim() : '';

        return data;
      });

      return productData;
    } catch (error) {
      log.error('Extract product error:', error);
      throw error;
    }
  }

  async extractFromAPI() {
    const browser = this.getBrowserManager();
    try {
      const apiData = await browser.executeScript(async () => {
        const results = {};

        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
          const content = script.textContent;
          if (content.includes('window.__INIT_PROPS__') || content.includes('window.goods_info')) {
            try {
              const match = content.match(/window\.__INIT_PROPS__\s*=\s*(\{.*?\});/s);
              if (match) {
                results.props = JSON.parse(match[1]);
              }
            } catch (e) {}
          }
        }

        const dataElements = document.querySelectorAll('[id*="data"], [data-type="goods"]');
        dataElements.forEach(el => {
          try {
            const data = el.dataset.goodsInfo || el.dataset.goodsData;
            if (data) {
              results.elementData = JSON.parse(data);
            }
          } catch (e) {}
        });

        return results;
      });

      return apiData;
    } catch (error) {
      log.error('Extract from API error:', error);
      return {};
    }
  }

  async extractVariants() {
    const browser = this.getBrowserManager();
    try {
      const variants = await browser.executeScript(async () => {
        const results = [];

        const variantButtons = document.querySelectorAll('[class*="sku"], [class*="color"], [class*="variant"], .size-btn, .spec-item');

        for (const btn of variantButtons) {
          const variantName = btn.textContent.trim();
          results.push({
            name: variantName,
            isSelected: btn.classList.contains('selected') || btn.classList.contains('active')
          });
        }

        const images = document.querySelectorAll('.goods-item, .sku-image, [class*="gallery"] img');
        const imageList = Array.from(images).map(img => ({
          src: img.src || img.dataset.src,
          alt: img.alt
        }));

        results.images = imageList;

        return results;
      });

      return variants;
    } catch (error) {
      log.error('Extract variants error:', error);
      throw error;
    }
  }

  async clickVariant(variantName) {
    const browser = this.getBrowserManager();
    try {
      await browser.executeScript(async (name) => {
        const buttons = document.querySelectorAll('[class*="sku"], [class*="color"], [class*="variant"]');
        for (const btn of buttons) {
          if (btn.textContent.trim().includes(name)) {
            btn.click();
            break;
          }
        }
      }, variantName);

      await browser.sleep(1000);
    } catch (error) {
      log.error('Click variant error:', error);
      throw error;
    }
  }

  async extractDescriptionImages() {
    const browser = this.getBrowserManager();
    try {
      const images = await browser.executeScript(async () => {
        const results = [];

        const descSection = document.querySelector('.goods-desc, .description, [class*="description"], #description');
        if (descSection) {
          const imgs = descSection.querySelectorAll('img');
          imgs.forEach(img => {
            const src = img.dataset.src || img.src;
            if (src && !src.includes('data:')) {
              results.push(src);
            }
          });
        }

        const allImgs = document.querySelectorAll('img');
        allImgs.forEach(img => {
          const src = img.dataset-src || img.src;
          if (src && !src.includes('data:') && src.includes('yangkeduo') || src.includes('pinduoduo')) {
            results.push(src);
          }
        });

        return [...new Set(results)];
      });

      return images;
    } catch (error) {
      log.error('Extract description images error:', error);
      throw error;
    }
  }

  async detectProductPage() {
    const browser = this.getBrowserManager();
    try {
      const isProduct = await browser.executeScript(() => {
        const url = window.location.href;
        return url.includes('goods.html') || url.includes('goodsDetail') || url.includes('product');
      });

      return isProduct;
    } catch (error) {
      log.error('Detect product page error:', error);
      return false;
    }
  }

  async startAutoScroll() {
    if (this.autoScrollEnabled) return;

    this.autoScrollEnabled = true;
    const browser = this.getBrowserManager();

    this.autoScrollInterval = setInterval(async () => {
      if (!this.autoScrollEnabled) return;

      try {
        await browser.scroll('bottom');
      } catch (e) {
        log.error('Auto scroll error:', e.message);
      }
    }, 3000);

    log.info('Auto scroll started');
  }

  async stopAutoScroll() {
    this.autoScrollEnabled = false;
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
    log.info('Auto scroll stopped');
  }

  async extractAll() {
    const product = await this.extractProduct();
    const variants = await this.extractVariants();
    const descriptionImages = await this.extractDescriptionImages();

    return {
      ...product,
      variants,
      descriptionImages,
      extractedAt: new Date().toISOString()
    };
  }
}

module.exports = ScraperService;