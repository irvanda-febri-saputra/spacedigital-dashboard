import { create } from 'zustand'
import { authService } from '../services/authService'

// Check initial auth state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('user')
  let user = null
  
  try {
    user = userStr ? JSON.parse(userStr) : null
  } catch (e) {
    user = null
  }
  
  return {
    user,
    token,
    isAuthenticated: !!token,
  }
}

const initialState = getInitialState()

export const useAuthStore = create((set, get) => ({
  user: initialState.user,
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated,
  isLoading: false,
  error: null,

  login: async (email, password, turnstileToken) => {
    set({ isLoading: true, error: null })
    try {
      const { user, token } = await authService.login(email, password, turnstileToken)
      set({ user, token, isAuthenticated: !!token, isLoading: false })
      return { success: !!token }
    } catch (error) {
      const message = error.response?.data?.message || 'Login gagal'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  logout: async () => {
    set({ isLoading: true })
    await authService.logout()
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },

  setUser: (user) => set({ user }),

  clearError: () => set({ error: null }),
  
  // Re-check auth from localStorage
  checkAuth: () => {
    const state = getInitialState()
    set(state)
    return state.isAuthenticated
  },
}))
