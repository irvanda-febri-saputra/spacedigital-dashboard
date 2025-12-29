import api from './api'

export const botService = {
  async getAll() {
    const response = await api.get('/dashboard/bots')
    return response.data || []
  },

  async getById(id) {
    const response = await api.get(`/dashboard/bots/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/dashboard/bots', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/dashboard/bots/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/dashboard/bots/${id}`)
    return response.data
  },
}
