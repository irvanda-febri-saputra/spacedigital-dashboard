import api from './api'

export const authService = {
  async login(email, password, turnstileToken) {
    const response = await api.post('/auth/login', { 
      email, 
      password,
      turnstile_token: turnstileToken 
    })
    const { data } = response.data
    if (data?.token) {
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return { token: data?.token, user: data?.user }
  },

  async register(data) {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async logout() {
    try {
      await api.post('/dashboard/logout')
    } catch (e) {
      // ignore error
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  },

  async getProfile() {
    const response = await api.get('/dashboard/me')
    return response.data.data
  },

  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  getToken() {
    return localStorage.getItem('auth_token')
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token')
  },
}
