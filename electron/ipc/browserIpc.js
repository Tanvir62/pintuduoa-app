const { ipcMain } = require('electron');
const log = require('electron-log');

let browserManager = null;

async function initBrowserManager() {
  if (!browserManager) {
    const BrowserManager = require('../../electron/scraper/browser/BrowserManager');
    browserManager = new BrowserManager();
  }
  return browserManager;
}

ipcMain.handle('browser:launch', async (event, options) => {
  try {
    const manager = await initBrowserManager();
    await manager.launch(options);
    log.info('Browser launched successfully');
    return { success: true };
  } catch (error) {
    log.error('Browser launch failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('browser:navigate', async (event, url) => {
  try {
    const manager = await initBrowserManager();
    await manager.navigate(url);
    log.info('Navigated to:', url);
    return { success: true };
  } catch (error) {
    log.error('Navigation failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('browser:executeScript', async (event, script) => {
  try {
    const manager = await initBrowserManager();
    const result = await manager.executeScript(script);
    return { success: true, result };
  } catch (error) {
    log.error('Script execution failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('browser:click', async (event, selector) => {
  try {
    const manager = await initBrowserManager();
    await manager.click(selector);
    return { success: true };
  } catch (error) {
    log.error('Click failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('browser:scroll', async (event, position) => {
  try {
    const manager = await initBrowserManager();
    await manager.scroll(position);
    return { success: true };
  } catch (error) {
    log.error('Scroll failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('browser:getPageContent', async () => {
  try {
    const manager = await initBrowserManager();
    const content = await manager.getPageContent();
    return { success: true, content };
  } catch (error) {
    log.error('Get page content failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('browser:waitForSelector', async (event, selector, timeout) => {
  try {
    const manager = await initBrowserManager();
    await manager.waitForSelector(selector, timeout);
    return { success: true };
  } catch (error) {
    log.error('Wait for selector failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('browser:screenshot', async () => {
  try {
    const manager = await initBrowserManager();
    const screenshot = await manager.screenshot();
    return { success: true, screenshot };
  } catch (error) {
    log.error('Screenshot failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('browser:getSession', async () => {
  try {
    const manager = await initBrowserManager();
    const session = await manager.getSession();
    return { success: true, session };
  } catch (error) {
    log.error('Get session failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('browser:close', async () => {
  try {
    if (browserManager) {
      await browserManager.close();
      browserManager = null;
    }
    return { success: true };
  } catch (error) {
    log.error('Browser close failed:', error);
    return { success: false, error: error.message };
  }
});