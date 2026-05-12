const { ipcMain } = require('electron');
const log = require('electron-log');

let scraperService = null;

function getScraperService() {
  if (!scraperService) {
    const ScraperService = require('../../electron/scraper/extractors/ScraperService');
    scraperService = new ScraperService();
  }
  return scraperService;
}

ipcMain.handle('scraper:extractProduct', async (event) => {
  try {
    const scraper = getScraperService();
    const product = await scraper.extractProduct();
    log.info('Product extracted:', product.productId);
    return { success: true, product };
  } catch (error) {
    log.error('Extract product failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scraper:extractVariants', async (event) => {
  try {
    const scraper = getScraperService();
    const variants = await scraper.extractVariants();
    log.info('Variants extracted:', variants.length);
    return { success: true, variants };
  } catch (error) {
    log.error('Extract variants failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scraper:extractDescriptionImages', async (event) => {
  try {
    const scraper = getScraperService();
    const images = await scraper.extractDescriptionImages();
    log.info('Description images extracted:', images.length);
    return { success: true, images };
  } catch (error) {
    log.error('Extract description images failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scraper:startAutoScroll', async (event) => {
  try {
    const scraper = getScraperService();
    await scraper.startAutoScroll();
    log.info('Auto scroll started');
    return { success: true };
  } catch (error) {
    log.error('Start auto scroll failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scraper:stopAutoScroll', async (event) => {
  try {
    const scraper = getScraperService();
    await scraper.stopAutoScroll();
    log.info('Auto scroll stopped');
    return { success: true };
  } catch (error) {
    log.error('Stop auto scroll failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scraper:detectProductPage', async (event) => {
  try {
    const scraper = getScraperService();
    const isProductPage = await scraper.detectProductPage();
    return { success: true, isProductPage };
  } catch (error) {
    log.error('Detect product page failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scraper:extractAll', async (event) => {
  try {
    const scraper = getScraperService();
    const data = await scraper.extractAll();
    log.info('Full extraction completed');
    return { success: true, data };
  } catch (error) {
    log.error('Extract all failed:', error);
    return { success: false, error: error.message };
  }
});