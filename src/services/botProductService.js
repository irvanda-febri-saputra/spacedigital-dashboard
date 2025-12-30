import axios from 'axios';

// Bot API URL - connect directly to bot server
const BOT_API_URL = import.meta.env.VITE_BOT_API_URL || 'http://localhost:3000';

const botApi = axios.create({
  baseURL: BOT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const productService = {
  // ==================== PRODUCTS ====================
  
  // Get all products with stock count
  getProducts: async () => {
    const response = await botApi.get('/api/products');
    return response.data;
  },

  // Get single product with variants and stock
  getProduct: async (id) => {
    const response = await botApi.get(`/api/products/${id}`);
    return response.data;
  },

  // Create product
  createProduct: async (data) => {
    const response = await botApi.post('/api/products', data);
    return response.data;
  },

  // Update product
  updateProduct: async (id, data) => {
    const response = await botApi.put(`/api/products/${id}`, data);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await botApi.delete(`/api/products/${id}`);
    return response.data;
  },

  // ==================== VARIANTS ====================
  
  // Add variant to product
  addVariant: async (productId, data) => {
    const response = await botApi.post(`/api/products/${productId}/variants`, data);
    return response.data;
  },

  // Update variant
  updateVariant: async (variantId, data) => {
    const response = await botApi.put(`/api/variants/${variantId}`, data);
    return response.data;
  },

  // Delete variant
  deleteVariant: async (variantId) => {
    const response = await botApi.delete(`/api/variants/${variantId}`);
    return response.data;
  },

  // ==================== STOCK ====================
  
  // Add stock (single or bulk)
  addStock: async (productId, data) => {
    // data: { variant_id?: number, stock_data: string | string[] }
    const response = await botApi.post(`/api/products/${productId}/stock`, data);
    return response.data;
  },

  // Get stock items
  getStock: async (productId, params = {}) => {
    const response = await botApi.get(`/api/products/${productId}/stock`, { params });
    return response.data;
  },

  // Delete single stock item
  deleteStockItem: async (stockId) => {
    const response = await botApi.delete(`/api/stock/${stockId}`);
    return response.data;
  },

  // Clear all stock for product/variant
  clearStock: async (productId, variantId = null) => {
    const response = await botApi.delete(`/api/products/${productId}/stock/clear`, {
      params: variantId ? { variant_id: variantId } : {}
    });
    return response.data;
  },

  // ==================== BROADCAST ====================
  
  // Send broadcast message (with optional image)
  sendBroadcast: async ({ message, parse_mode = 'HTML', target = 'all', image = null }) => {
    // If there's an image, use FormData
    if (image) {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('message', message || '');
      formData.append('parse_mode', parse_mode);
      formData.append('target', target);

      const response = await axios.post(`${BOT_API_URL}/api/broadcast`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Text only broadcast
    const response = await botApi.post('/api/broadcast', {
      message,
      parse_mode,
      target
    });
    return response.data;
  },

  // ==================== STATS ====================
  
  // Get bot statistics
  getStats: async () => {
    const response = await botApi.get('/api/stats');
    return response.data;
  },

  // Get bot users
  getUsers: async (limit = 100) => {
    const response = await botApi.get('/api/users', { params: { limit } });
    return response.data;
  },
};

export default productService;
