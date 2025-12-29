import api from './api'

export const gatewayService = {
  async getAll() {
    const response = await api.get('/dashboard/gateways')
    return response.data || []
  },

  async getUserGateways() {
    const response = await api.get('/dashboard/gateways/user')
    return response.data || []
  },

  async configureGateway(gatewayId, credentials, label = '') {
    const response = await api.post(`/dashboard/gateways/${gatewayId}/configure`, { credentials, label })
    return response.data
  },

  async setDefaultGateway(gatewayId) {
    const response = await api.post(`/dashboard/gateways/${gatewayId}/set-default`)
    return response.data
  },

  async toggleActive(gatewayId) {
    const response = await api.post(`/dashboard/gateways/${gatewayId}/toggle-active`)
    return response.data
  },

  async assignToBot(botId, userGatewayId) {
    const response = await api.post('/dashboard/gateways/assign-to-bot', { 
      bot_id: botId, 
      user_gateway_id: userGatewayId 
    })
    return response.data
  },

  async deleteUserGateway(userGatewayId) {
    const response = await api.delete(`/dashboard/gateways/${userGatewayId}`)
    return response.data
  },
}
