const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  browser: {
    launch: (options) => ipcRenderer.invoke('browser:launch', options),
    navigate: (url) => ipcRenderer.invoke('browser:navigate', url),
    executeScript: (script) => ipcRenderer.invoke('browser:executeScript', script),
    click: (selector) => ipcRenderer.invoke('browser:click', selector),
    scroll: (position) => ipcRenderer.invoke('browser:scroll', position),
    getPageContent: () => ipcRenderer.invoke('browser:getPageContent'),
    waitForSelector: (selector, timeout) => ipcRenderer.invoke('browser:waitForSelector', selector, timeout),
    screenshot: () => ipcRenderer.invoke('browser:screenshot'),
    onNetworkRequest: (callback) => {
      ipcRenderer.on('network:request', (event, data) => callback(data));
    },
    onNetworkResponse: (callback) => {
      ipcRenderer.on('network:response', (event, data) => callback(data));
    },
    onProductDetected: (callback) => {
      ipcRenderer.on('product:detected', (event, data) => callback(data));
    }
  },
  scraper: {
    extractProduct: () => ipcRenderer.invoke('scraper:extractProduct'),
    extractVariants: () => ipcRenderer.invoke('scraper:extractVariants'),
    extractDescriptionImages: () => ipcRenderer.invoke('scraper:extractDescriptionImages'),
    startAutoScroll: () => ipcRenderer.invoke('scraper:startAutoScroll'),
    stopAutoScroll: () => ipcRenderer.invoke('scraper:stopAutoScroll'),
    onProgress: (callback) => {
      ipcRenderer.on('scraper:progress', (event, data) => callback(data));
    }
  },
  download: {
    startDownload: (images) => ipcRenderer.invoke('download:start', images),
    cancelDownload: (id) => ipcRenderer.invoke('download:cancel', id),
    onDownloadProgress: (callback) => {
      ipcRenderer.on('download:progress', (event, data) => callback(data));
    }
  },
  database: {
    saveProduct: (product) => ipcRenderer.invoke('db:saveProduct', product),
    getProducts: () => ipcRenderer.invoke('db:getProducts'),
    getProduct: (id) => ipcRenderer.invoke('db:getProduct', id),
    deleteProduct: (id) => ipcRenderer.invoke('db:deleteProduct', id),
    updateProduct: (id, data) => ipcRenderer.invoke('db:updateProduct', id, data),
    searchProducts: (query) => ipcRenderer.invoke('db:searchProducts', query)
  },
  api: {
    syncToLaravel: (product) => ipcRenderer.invoke('api:syncProduct', product),
    bulkSync: (products) => ipcRenderer.invoke('api:bulkSync', products),
    getSyncStatus: () => ipcRenderer.invoke('api:getSyncStatus'),
    onSyncProgress: (callback) => {
      ipcRenderer.on('api:syncProgress', (event, data) => callback(data));
    }
  },
  app: {
    getPath: (name) => ipcRenderer.invoke('app:getPath', name),
    showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpen', options),
    showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSave', options),
    onLog: (callback) => {
      ipcRenderer.on('app:log', (event, data) => callback(data));
    }
  }
});