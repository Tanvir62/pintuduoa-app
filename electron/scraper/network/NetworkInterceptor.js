const log = require('electron-log');

class NetworkInterceptor {
  constructor() {
    this.interceptedRequests = [];
    this.interceptedResponses = [];
    this.listeners = new Map();
  }

  setup(page) {
    page.on('request', (request) => {
      const reqData = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: Date.now()
      };

      this.interceptedRequests.push(reqData);
      this.notifyListeners('request', reqData);

      if (this.shouldIntercept(request.url())) {
        this.handleInterceptedRequest(request);
      }
    });

    page.on('response', async (response) => {
      try {
        const resData = {
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          timestamp: Date.now()
        };

        const body = await this.getResponseBody(response);
        if (body) {
          resData.body = body;
          resData.parsed = this.parseBody(body, response.url());
        }

        this.interceptedResponses.push(resData);
        this.notifyListeners('response', resData);

        if (this.isProductAPI(response.url())) {
          this.notifyListeners('productAPI', resData);
        }
      } catch (error) {
        log.debug('Response intercept error:', error.message);
      }
    });

    page.on('requestfailed', (request) => {
      log.debug('Request failed:', request.url());
    });
  }

  shouldIntercept(url) {
    const patterns = [
      'api.yangkeduo.com',
      'pinduoduo.com',
      'yangkeduo.com'
    ];
    return patterns.some(p => url.includes(p));
  }

  isProductAPI(url) {
    const patterns = [
      'goodsDetail',
      'goods_info',
      'api/goods',
      'detail',
      'sku'
    ];
    return patterns.some(p => url.includes(p));
  }

  async handleInterceptedRequest(request) {
    log.debug('Intercepted:', request.method(), request.url());
  }

  async getResponseBody(response) {
    try {
      const buffer = await response.buffer();
      return buffer.toString('utf8');
    } catch {
      return null;
    }
  }

  parseBody(body, url) {
    try {
      if (url.includes('.json') || url.includes('api')) {
        const parsed = JSON.parse(body);
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  getRequests() {
    return this.interceptedRequests;
  }

  getResponses() {
    return this.interceptedResponses;
  }

  clear() {
    this.interceptedRequests = [];
    this.interceptedResponses = [];
  }

  getProductData() {
    const responses = this.getResponses();
    const productAPIs = responses.filter(r => this.isProductAPI(r.url));

    for (const api of productAPIs) {
      if (api.parsed && (api.parsed.goods || api.parsed.data || api.parsed.goods_info)) {
        return api.parsed;
      }
    }
    return null;
  }
}

module.exports = NetworkInterceptor;