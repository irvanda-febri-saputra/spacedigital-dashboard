import api from './api';

/**
 * Bot Product Service - Fetches from Laravel API (centralized)
 * Products are synced from bot -> Laravel, Dashboard fetches from Laravel
 * 
 * Flow: Bot (SQLite) -> sync -> Laravel (MySQL) -> fetch -> Dashboard
 */
const botProductService = {
  // ==================== PRODUCTS ====================
  
  // Get all products (from Laravel, synced from bot)
  getProducts: async (params = {}) => {
    const response = await api.get('/dashboard/products', { params });
    return response.data;
  },

  // Get single product with variants
  getProduct: async (id) => {
    const response = await api.get(`/dashboard/products/${id}`);
    return response.data;
  },

  // Create product (creates in Laravel, bot should pick up via reverse sync)
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

  // Get product categories
  getCategories: async () => {
    const response = await api.get('/dashboard/products/categories');
    return response.data;
  },

  // Bulk update products
  bulkUpdate: async (data) => {
    const response = await api.post('/dashboard/products/bulk-update', data);
    return response.data;
  },

  // ==================== STOCK (Read-only from sync) ====================
  // Note: Stock is synced from bot. For now, stock management is read-only.
  // To add stock, use Telegram bot commands.
  
  addStock: async (productId, data) => {
    // Stock is managed on bot side, this is just for display
    console.warn('Stock management should be done via Telegram bot commands');
    return { success: false, error: 'Stock management via Telegram bot only' };
  },

  // ==================== VARIANTS (Read-only from sync) ====================
  // Note: Variants are synced as JSON from bot. Variant management is read-only.
  
  addVariant: async (productId, data) => {
    console.warn('Variant management should be done via Telegram bot commands');
    return { success: false, error: 'Variant management via Telegram bot only' };
  },

  updateVariant: async (variantId, data) => {
    console.warn('Variant management should be done via Telegram bot commands');
    return { success: false, error: 'Variant management via Telegram bot only' };
  },

  deleteVariant: async (variantId) => {
    console.warn('Variant management should be done via Telegram bot commands');
    return { success: false, error: 'Variant management via Telegram bot only' };
  },

  // ==================== BROADCAST ====================
  // Note: Broadcast requires direct bot access, which is not available
  // in production when bot runs on separate Cybrancee server.
  
  sendBroadcast: async ({ message, parse_mode = 'HTML', target = 'all', image = null }) => {
    console.warn('Broadcast requires direct bot access - not available in centralized mode');
    throw new Error('Broadcast not available - bot not directly accessible. Use Telegram bot admin commands.');
  },

  // ==================== STATS ====================
  // Note: Stats require direct bot access
  
  getStats: async () => {
    console.warn('Stats require direct bot access');
    throw new Error('Stats not available - use Dashboard transaction stats instead');
  },

  getUsers: async (limit = 100) => {
    console.warn('Bot users require direct bot access');
    throw new Error('Bot users not available - bot not directly accessible');
  },
};

export default botProductService;
