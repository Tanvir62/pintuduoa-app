const axios = require('axios');
const log = require('electron-log');

class LaravelSyncService {
  constructor(baseUrl = 'http://localhost:8000/api') {
    this.baseUrl = baseUrl;
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  setBaseUrl(url) {
    this.baseUrl = url;
    this.api.defaults.baseURL = url;
  }

  async syncProduct(product) {
    try {
      const payload = this.formatProductPayload(product);

      const response = await this.api.post('/products/import', payload);

      log.info('Product synced successfully:', product.productId);

      return {
        success: true,
        serverId: response.data.id,
        message: response.data.message
      };
    } catch (error) {
      log.error('Sync product failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async syncImages(productId, images) {
    try {
      const formData = new FormData();

      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image.localPath);
        formData.append(`urls[${index}]`, image.imageUrl);
      });

      formData.append('product_id', productId);

      const response = await this.api.post('/products/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      log.info('Images synced for product:', productId);

      return { success: true, count: images.length };
    } catch (error) {
      log.error('Sync images failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async syncVariants(productId, variants) {
    try {
      const response = await this.api.post('/products/variants', {
        product_id: productId,
        variants
      });

      log.info('Variants synced for product:', productId);

      return { success: true, count: variants.length };
    } catch (error) {
      log.error('Sync variants failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async bulkSync(products) {
    const results = [];
    for (const product of products) {
      const result = await this.syncProduct(product);
      results.push({
        productId: product.productId,
        ...result
      });
    }
    return results;
  }

  async updateStock(productId, stockData) {
    try {
      const response = await this.api.put(`/products/${productId}/stock`, stockData);
      return { success: true };
    } catch (error) {
      log.error('Update stock failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getProductStatus(productId) {
    try {
      const response = await this.api.get(`/products/${productId}/status`);
      return response.data;
    } catch (error) {
      log.error('Get product status failed:', error.message);
      return null;
    }
  }

  formatProductPayload(product) {
    return {
      product_id: product.productId,
      title: product.title,
      price: product.price,
      original_price: product.originalPrice,
      stock: product.stock,
      sold_count: product.soldCount,
      shop_name: product.shopName,
      shop_url: product.shopUrl,
      description: product.description,
      slider_images: product.sliderImages || [],
      color_images: product.colorImages || [],
      description_images: product.descriptionImages || [],
      variants: product.variants || [],
      attributes: product.attributes || []
    };
  }

  async testConnection() {
    try {
      await this.api.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = LaravelSyncService;