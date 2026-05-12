const { ipcMain } = require('electron');
const log = require('electron-log');

let downloadManager = null;

function getDownloadManager() {
  if (!downloadManager) {
    const DownloadManager = require('../../electron/scraper/downloads/DownloadManager');
    downloadManager = new DownloadManager();
  }
  return downloadManager;
}

ipcMain.handle('download:start', async (event, images) => {
  try {
    const manager = getDownloadManager();
    const result = await manager.downloadImages(images);
    log.info('Download started for', images.length, 'images');
    return { success: true, jobId: result.jobId };
  } catch (error) {
    log.error('Start download failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download:cancel', async (event, jobId) => {
  try {
    const manager = getDownloadManager();
    await manager.cancelJob(jobId);
    log.info('Download cancelled:', jobId);
    return { success: true };
  } catch (error) {
    log.error('Cancel download failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download:getStatus', async (event, jobId) => {
  try {
    const manager = getDownloadManager();
    const status = manager.getJobStatus(jobId);
    return { success: true, status };
  } catch (error) {
    log.error('Get download status failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download:getQueue', async () => {
  try {
    const manager = getDownloadManager();
    const queue = manager.getQueue();
    return { success: true, queue };
  } catch (error) {
    log.error('Get download queue failed:', error);
    return { success: false, error: error.message };
  }
});