import api from './api'

export const transactionService = {
  async getAll(params = {}) {
    const response = await api.get('/dashboard/transactions', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/dashboard/transactions/${id}`)
    return response.data
  },

  async getStats() {
    const response = await api.get('/dashboard/transactions/stats')
    return response.data
  },

  async create(data) {
    const response = await api.post('/dashboard/transactions', data)
    return response.data
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/dashboard/transactions/${id}/status`, { status })
    return response.data
  },
}
