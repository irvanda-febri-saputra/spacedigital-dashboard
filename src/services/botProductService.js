import api from './api';

/**
 * Product Service - Using Laravel API (centralized)
 * Products are stored in Laravel database, accessible by all bots
 */
const productService = {
  // ==================== PRODUCTS ====================
  
  // Get all products with stock count
  getProducts: async (params = {}) => {
    const response = await api.get('/dashboard/products', { params });
    return response.data;
  },

  // Get single product with variants and stock
  getProduct: async (id) => {
    const response = await api.get(`/dashboard/products/${id}`);
    return response.data;
  },

  // Create product
  createProduct: async (data) => {
    const response = await api.post('/dashboard/products', data);
    return response.data;
  },

  // Update product
  updateProduct: async (id, data) => {
    const response = await api.put(`/dashboard/products/${id}`, data);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/dashboard/products/${id}`);
    return response.data;
  },

  // Bulk update products
  bulkUpdate: async (data) => {
    const response = await api.post('/dashboard/products/bulk-update', data);
    return response.data;
  },

  // Get product categories
  getCategories: async () => {
    const response = await api.get('/dashboard/products/categories');
    return response.data;
  },

  // ==================== BROADCAST ====================
  // NOTE: Broadcast requires direct bot access
  // This will not work until bot is exposed externally
  
  sendBroadcast: async ({ message, parse_mode = 'HTML', target = 'all', image = null }) => {
    console.warn('Broadcast feature requires direct bot access. Not available in centralized mode.');
    throw new Error('Broadcast feature not available - bot not accessible');
  },

  // ==================== STATS ====================
  // NOTE: Stats requires direct bot access
  
  getStats: async () => {
    console.warn('Stats feature requires direct bot access. Not available in centralized mode.');
    throw new Error('Stats feature not available - bot not accessible');
  },

  getUsers: async (limit = 100) => {
    console.warn('Users feature requires direct bot access. Not available in centralized mode.');
    throw new Error('Users feature not available - bot not accessible');
  },
};

export default productService;
