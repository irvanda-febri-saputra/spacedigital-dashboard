import api from './api';

const productService = {
  // Get all products
  getProducts: async (params = {}) => {
    // Add per_page: 'all' to get all products without pagination limit
    const queryParams = { per_page: 'all', ...params };
    const response = await api.get('/dashboard/products', { params: queryParams });
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
};

export default productService;
