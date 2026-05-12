import { create } from 'zustand';

export const useStore = create((set, get) => ({
  browserUrl: 'https://mobile.yangkeduo.com',
  browserLaunched: false,
  currentProduct: null,
  products: [],
  downloadQueue: [],
  logs: [],

  addLog: (level, message) => set(state => ({
    logs: [...state.logs, {
      level,
      message,
      timestamp: new Date().toLocaleTimeString()
    }].slice(-100)
  })),

  setBrowserUrl: (url) => set({ browserUrl: url }),

  setBrowserLaunched: (launched) => set({ browserLaunched: launched }),

  launchBrowser: async () => {
    try {
      get().addLog('info', 'Launching browser...');
      if (!window.electronAPI?.browser) {
        get().addLog('error', 'electronAPI not available');
        return;
      }
      const result = await window.electronAPI.browser.launch();
      if (result.success) {
        set({ browserLaunched: true });
        get().addLog('success', 'Browser launched successfully');
        await get().navigateBrowser('https://mobile.yangkeduo.com');
      } else {
        get().addLog('error', 'Failed to launch browser: ' + result.error);
      }
    } catch (error) {
      get().addLog('error', 'Browser launch error: ' + error.message);
    }
  },

  navigateBrowser: async (url) => {
    try {
      get().addLog('info', 'Navigating to: ' + url);
      const result = await window.electronAPI.browser.navigate(url);
      if (result.success) {
        get().addLog('success', 'Navigation complete');
      } else {
        get().addLog('error', 'Navigation failed: ' + result.error);
      }
    } catch (error) {
      get().addLog('error', 'Navigation error: ' + error.message);
    }
  },

  extractProduct: async () => {
    try {
      get().addLog('info', 'Extracting product...');
      const result = await window.electronAPI.scraper.extractProduct();
      if (result.success) {
        set({ currentProduct: result.product });
        get().addLog('success', 'Product extracted: ' + result.product.title);
        return result.product;
      } else {
        get().addLog('error', 'Extraction failed: ' + result.error);
      }
    } catch (error) {
      get().addLog('error', 'Extraction error: ' + error.message);
    }
  },

  extractVariants: async () => {
    try {
      get().addLog('info', 'Extracting variants...');
      const result = await window.electronAPI.scraper.extractVariants();
      if (result.success) {
        get().addLog('success', 'Found ' + result.variants.length + ' variants');
        return result.variants;
      }
    } catch (error) {
      get().addLog('error', 'Variant extraction error: ' + error.message);
    }
  },

  extractDescriptionImages: async () => {
    try {
      get().addLog('info', 'Extracting description images...');
      const result = await window.electronAPI.scraper.extractDescriptionImages();
      if (result.success) {
        get().addLog('success', 'Found ' + result.images.length + ' description images');
        return result.images;
      }
    } catch (error) {
      get().addLog('error', 'Description extraction error: ' + error.message);
    }
  },

  downloadImages: async (images, productId) => {
    try {
      get().addLog('info', 'Starting download for ' + images.length + ' images');
      const result = await window.electronAPI.download.startDownload(images, productId);
      if (result.success) {
        get().addLog('success', 'Download started: ' + result.jobId);
        return result.jobId;
      }
    } catch (error) {
      get().addLog('error', 'Download error: ' + error.message);
    }
  },

  saveProduct: async (product) => {
    try {
      const result = await window.electronAPI.database.saveProduct(product);
      if (result.success) {
        get().addLog('success', 'Product saved to database');
        await get().loadProducts();
        return result.id;
      }
    } catch (error) {
      get().addLog('error', 'Save product error: ' + error.message);
    }
  },

  loadProducts: async () => {
    try {
      if (!window.electronAPI?.database) {
        get().addLog('error', 'electronAPI.database not available');
        return;
      }
      const result = await window.electronAPI.database.getProducts();
      if (result.success) {
        set({ products: result.products });
      }
    } catch (error) {
      get().addLog('error', 'Load products error: ' + error.message);
    }
  },

  syncToLaravel: async (product) => {
    try {
      get().addLog('info', 'Syncing to Laravel API...');
      const result = await window.electronAPI.api.syncToLaravel(product);
      if (result.success) {
        get().addLog('success', 'Synced to Laravel successfully');
      } else {
        get().addLog('error', 'Sync failed: ' + result.error);
      }
    } catch (error) {
      get().addLog('error', 'Sync error: ' + error.message);
    }
  },

  startAutoScroll: async () => {
    try {
      get().addLog('info', 'Starting auto scroll');
      await window.electronAPI.scraper.startAutoScroll();
    } catch (error) {
      get().addLog('error', 'Auto scroll error: ' + error.message);
    }
  },

  stopAutoScroll: async () => {
    try {
      get().addLog('info', 'Stopping auto scroll');
      await window.electronAPI.scraper.stopAutoScroll();
    } catch (error) {
      get().addLog('error', 'Stop auto scroll error: ' + error.message);
    }
  }
}));