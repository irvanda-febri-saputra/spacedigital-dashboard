import axios from 'axios'

// API Base URL - ubah sesuai environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - tambah token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
// NOTE: Jangan auto-redirect ke /login di sini karena bisa menyebabkan race condition
// Biarkan ProtectedRoute yang handle redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Hanya clear token jika 401 Unauthorized (token invalid/expired)
    // TIDAK auto redirect - biarkan component handle
    if (error.response?.status === 401) {
      // Cek apakah ini bukan dari login endpoint
      const isLoginRequest = error.config?.url?.includes('/auth/login')
      if (!isLoginRequest) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        // Dispatch custom event agar ProtectedRoute bisa react
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
    }
    return Promise.reject(error)
  }
)

export default api
