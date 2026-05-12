const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const log = require('electron-log');

class DownloadManager {
  constructor() {
    this.jobs = new Map();
    this.queue = [];
    this.maxConcurrent = 3;
    this.activeDownloads = 0;
  }

  async downloadImages(images, options = {}) {
    const jobId = uuidv4();
    const baseDir = options.baseDir || path.join(process.cwd(), 'storage', 'images');

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const job = {
      id: jobId,
      status: 'pending',
      images,
      completed: 0,
      failed: 0,
      total: images.length,
      baseDir,
      startTime: Date.now()
    };

    this.jobs.set(jobId, job);
    this.processQueue();

    return { jobId };
  }

  async processQueue() {
    while (this.queue.length > 0 && this.activeDownloads < this.maxConcurrent) {
      const item = this.queue.shift();
      this.activeDownloads++;
      this.downloadImage(item).finally(() => {
        this.activeDownloads--;
        this.processQueue();
      });
    }
  }

  async downloadImage(item) {
    const { jobId, image, index } = item;
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      const { url, type, productId } = image;
      const filename = `${uuidv4()}.jpg`;
      const productDir = path.join(job.baseDir, productId || 'general', type || 'misc');

      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }

      const filepath = path.join(productDir, filename);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36'
        }
      });

      fs.writeFileSync(filepath, response.data);

      job.completed++;

      log.info(`Downloaded: ${filename} (${job.completed}/${job.total})`);

      if (typeof job.onProgress === 'function') {
        job.onProgress({
          jobId,
          completed: job.completed,
          failed: job.failed,
          total: job.total,
          current: filename
        });
      }

    } catch (error) {
      job.failed++;
      log.error(`Download failed: ${image.url}`, error.message);
    }
  }

  getJobStatus(jobId) {
    return this.jobs.get(jobId);
  }

  getQueue() {
    return Array.from(this.jobs.values());
  }

  async cancelJob(jobId) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'cancelled';
      this.jobs.delete(jobId);
    }
  }

  onProgress(jobId, callback) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.onProgress = callback;
    }
  }
}

module.exports = DownloadManager;