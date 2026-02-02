import api from './api'

const stockService = {
  // Get all stocks with filters
  async getStocks(params = {}) {
    // Add per_page: 'all' to fetch all stocks without limit
    const queryParams = { per_page: 'all', ...params }
    const response = await api.get('/dashboard/stocks', { params: queryParams })
    return response.data
  },

  // Get stock stats
  async getStats() {
    const response = await api.get('/dashboard/stocks/stats')
    return response.data
  },

  // Add stock (single or multi-line)
  async addStock(data) {
    const response = await api.post('/dashboard/stocks', data)
    return response.data
  },

  // Update stock item
  async updateStock(id, data) {
    const response = await api.put(`/dashboard/stocks/${id}`, data)
    return response.data
  },

  // Delete stock item
  async deleteStock(id) {
    const response = await api.delete(`/dashboard/stocks/${id}`)
    return response.data
  },

  // Bulk import
  async bulkImport(data) {
    const response = await api.post('/dashboard/stocks/bulk-import', data)
    return response.data
  },

  // Get products for dropdown
  async getProducts() {
    const response = await api.get('/dashboard/products')
    return response.data
  },

  // Get variants for a product
  async getProductVariants(productId) {
    const response = await api.get(`/dashboard/products/${productId}/variants`)
    return response.data
  },

  // Add variant to product
  async addVariant(productId, data) {
    const response = await api.post(`/dashboard/products/${productId}/variants`, data)
    return response.data
  },

  // Update variant
  async updateVariant(variantId, data) {
    const response = await api.put(`/dashboard/variants/${variantId}`, data)
    return response.data
  },

  // Delete variant
  async deleteVariant(variantId) {
    const response = await api.delete(`/dashboard/variants/${variantId}`)
    return response.data
  },

  // Generate Hastebin link via backend proxy
  async generateHastebin(text) {
    const response = await api.post('/dashboard/stocks/hastebin', { text })
    return response.data
  }
}

export default stockService
