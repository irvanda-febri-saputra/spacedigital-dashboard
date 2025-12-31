import api from './api';
import axios from 'axios';

// Bot API URL - for features that need direct bot access (broadcast, stats)
const BOT_API_URL = import.meta.env.VITE_BOT_API_URL || null;

const botApi = BOT_API_URL ? axios.create({
  baseURL: BOT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}) : null;

const botProductService = {
  // ==================== PRODUCTS (via Laravel API) ====================
  
  // Get all products (synced from bot)
  getProducts: async () => {
    const response = await api.get('/dashboard/products');
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

  // ==================== VARIANTS (via Laravel API) ====================
  
  // Add variant to product
  addVariant: async (productId, data) => {
    try {
      console.log('[addVariant] Starting - productId:', productId, 'data:', data);
      
      // Store variant in Laravel - for now just update product variants field
      const product = await botProductService.getProduct(productId);
      console.log('[addVariant] Product fetched:', product);
      
      const productData = product.data || product; // Handle both response structures
      console.log('[addVariant] Product data:', productData);
      
      // Parse variants - Laravel returns JSON string "[]" instead of array
      let variants = [];
      if (productData.variants) {
        if (typeof productData.variants === 'string') {
          try {
            variants = JSON.parse(productData.variants);
          } catch (e) {
            console.warn('[addVariant] Failed to parse variants JSON:', e);
            variants = [];
          }
        } else if (Array.isArray(productData.variants)) {
          variants = productData.variants;
        }
      }
      console.log('[addVariant] Parsed variants:', variants);
      
      variants.push(data);
      console.log('[addVariant] Variants after push:', variants);
      
      // Send full product data to preserve all fields
      const payload = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        is_active: productData.is_active,
        variants: variants
      };
      console.log('[addVariant] Sending payload:', payload);
      
      const response = await api.put(`/dashboard/products/${productId}`, payload);
      console.log('[addVariant] Response:', response);
      
      return response.data;
    } catch (error) {
      console.error('[addVariant] ERROR:', error);
      console.error('[addVariant] Error details:', error.response?.data);
      throw error;
    }
  },

  // Update variant
  updateVariant: async (productId, variantId, data) => {
    const product = await botProductService.getProduct(productId);
    const productData = product.data || product; // Handle both response structures
    
    // Parse variants - Laravel returns JSON string instead of array
    let variants = [];
    if (productData.variants) {
      if (typeof productData.variants === 'string') {
        try {
          variants = JSON.parse(productData.variants);
        } catch (e) {
          console.warn('[updateVariant] Failed to parse variants JSON:', e);
          variants = [];
        }
      } else if (Array.isArray(productData.variants)) {
        variants = productData.variants;
      }
    }
    
    const index = variants.findIndex(v => v.id === variantId);
    if (index >= 0) {
      variants[index] = { ...variants[index], ...data };
    }
    
    // Send full product data to preserve all fields
    const response = await api.put(`/dashboard/products/${productId}`, {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      is_active: productData.is_active,
      variants: variants
    });
    return response.data;
  },

  // Delete variant
  deleteVariant: async (productId, variantId) => {
    const product = await botProductService.getProduct(productId);
    const productData = product.data || product; // Handle both response structures
    
    // Parse variants - Laravel returns JSON string instead of array
    let variants = [];
    if (productData.variants) {
      if (typeof productData.variants === 'string') {
        try {
          variants = JSON.parse(productData.variants);
        } catch (e) {
          console.warn('[deleteVariant] Failed to parse variants JSON:', e);
          variants = [];
        }
      } else if (Array.isArray(productData.variants)) {
        variants = productData.variants;
      }
    }
    
    variants = variants.filter(v => v.id !== variantId);
    
    // Send full product data to preserve all fields
    const response = await api.put(`/dashboard/products/${productId}`, {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      is_active: productData.is_active,
      variants: variants
    });
    return response.data;
  },

  // Delete product
  deleteProduct: async (productId) => {
    const response = await api.delete(`/dashboard/products/${productId}`);
    return response.data;
  },

  // ==================== STOCK (Read-only - synced from bot) ====================
  
  // Get stock count for product
  getStock: async (productId) => {
    const product = await botProductService.getProduct(productId);
    return { 
      success: true, 
      stock_count: product.data?.stock_count || 0,
      message: 'Stock is synced from bot. Use bot commands to add stock.'
    };
  },

  // Add stock via Laravel API (will notify bot via webhook)
  addStock: async (productId, variantId, stockData) => {
    const response = await api.post(`/dashboard/products/${productId}/stock`, {
      variant_id: variantId,
      stock_data: stockData
    });
    return response.data;
  },

  // ==================== BROADCAST (requires direct bot access) ====================
  
  // Send broadcast message
  sendBroadcast: async ({ message, parse_mode = 'HTML', target = 'all', image = null }) => {
    if (!botApi) {
      console.warn('Broadcast requires direct bot access. BOT_API_URL not configured.');
      throw new Error('Broadcast tidak tersedia. Bot API URL tidak dikonfigurasi.');
    }

    if (image) {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('message', message || '');
      formData.append('parse_mode', parse_mode);
      formData.append('target', target);

      const response = await axios.post(`${BOT_API_URL}/api/broadcast`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    const response = await botApi.post('/api/broadcast', { message, parse_mode, target });
    return response.data;
  },

  // ==================== STATS (requires direct bot access) ====================
  
  getStats: async () => {
    if (!botApi) {
      console.warn('Stats requires direct bot access.');
      return { success: false, message: 'Bot stats tidak tersedia via dashboard.' };
    }
    const response = await botApi.get('/api/stats');
    return response.data;
  },

  getUsers: async (limit = 100) => {
    if (!botApi) {
      console.warn('Users requires direct bot access.');
      return { success: false, users: [] };
    }
    const response = await botApi.get('/api/users', { params: { limit } });
    return response.data;
  },
};

export default botProductService;
