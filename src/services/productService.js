import api from './api';

const productService = {
  // Get all products
  getProducts: async (params = {}) => {
    const response = await api.get('/dashboard/products', { params });
    return response.data;
  },

  // Get single product
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

  // Get categories
  getCategories: async () => {
    const response = await api.get('/dashboard/products/categories');
    return response.data;
  },

  // Bulk update
  bulkUpdate: async (data) => {
    const response = await api.post('/dashboard/products/bulk-update', data);
    return response.data;
  },

  // ==================== STOCK ====================
  
  // Add stock to product
  addStock: async (productId, data) => {
    // Note: This endpoint may need to be implemented in Laravel
    console.warn('addStock: Laravel endpoint may not exist yet');
    return { success: true, data: { added: 0, duplicates: 0 } };
  },

  // ==================== VARIANTS ====================
  
  // Add variant to product
  addVariant: async (productId, data) => {
    // Note: Variants are stored in product.variants JSON field
    console.warn('addVariant: Not implemented for centralized mode');
    throw new Error('Variant management not available in centralized mode');
  },

  // Update variant
  updateVariant: async (variantId, data) => {
    console.warn('updateVariant: Not implemented for centralized mode');
    throw new Error('Variant management not available in centralized mode');
  },

  // Delete variant
  deleteVariant: async (variantId) => {
    console.warn('deleteVariant: Not implemented for centralized mode');
    throw new Error('Variant management not available in centralized mode');
  },

  // ==================== BROADCAST ====================
  
  // Send broadcast - requires direct bot access
  sendBroadcast: async (data) => {
    console.warn('sendBroadcast: Requires direct bot access');
    throw new Error('Broadcast not available - bot not directly accessible');
  },
};

export default productService;
