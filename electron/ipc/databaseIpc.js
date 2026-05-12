const { ipcMain } = require('electron');
const log = require('electron-log');

let db = null;

function getDatabase() {
  if (!db) {
    const Database = require('../../database/Database');
    db = new Database();
    db.init().catch(err => log.error('Database init failed:', err));
  }
  return db;
}

ipcMain.handle('db:saveProduct', async (event, product) => {
  try {
    const database = getDatabase();
    const result = database.saveProduct(product);
    log.info('Product saved:', product.productId);
    return { success: true, id: result.id };
  } catch (error) {
    log.error('Save product failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:getProducts', async (event) => {
  try {
    const database = getDatabase();
    const products = database.getProducts();
    return { success: true, products };
  } catch (error) {
    log.error('Get products failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:getProduct', async (event, id) => {
  try {
    const database = getDatabase();
    const product = database.getProduct(id);
    return { success: true, product };
  } catch (error) {
    log.error('Get product failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:deleteProduct', async (event, id) => {
  try {
    const database = getDatabase();
    database.deleteProduct(id);
    log.info('Product deleted:', id);
    return { success: true };
  } catch (error) {
    log.error('Delete product failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:updateProduct', async (event, id, data) => {
  try {
    const database = getDatabase();
    database.updateProduct(id, data);
    log.info('Product updated:', id);
    return { success: true };
  } catch (error) {
    log.error('Update product failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:searchProducts', async (event, query) => {
  try {
    const database = getDatabase();
    const products = database.searchProducts(query);
    return { success: true, products };
  } catch (error) {
    log.error('Search products failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:saveImage', async (event, imageData) => {
  try {
    const database = getDatabase();
    const result = database.saveImage(imageData);
    return { success: true, id: result.id };
  } catch (error) {
    log.error('Save image failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:getImages', async (event, productId) => {
  try {
    const database = getDatabase();
    const images = database.getImages(productId);
    return { success: true, images };
  } catch (error) {
    log.error('Get images failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:updateImageStatus', async (event, id, status) => {
  try {
    const database = getDatabase();
    database.updateImageStatus(id, status);
    return { success: true };
  } catch (error) {
    log.error('Update image status failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:saveSession', async (event, sessionData) => {
  try {
    const database = getDatabase();
    database.saveSession(sessionData);
    log.info('Session saved');
    return { success: true };
  } catch (error) {
    log.error('Save session failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:getSession', async (event) => {
  try {
    const database = getDatabase();
    const session = database.getSession();
    return { success: true, session };
  } catch (error) {
    log.error('Get session failed:', error);
    return { success: false, error: error.message };
  }
});