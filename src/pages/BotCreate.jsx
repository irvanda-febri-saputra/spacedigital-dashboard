import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconBot, IconArrowLeft, IconSave } from '../components/Icons'
import { botService } from '../services/botService'
import { gatewayService } from '../services/gatewayService'
import NeoToast from '../components/NeoToast'

export default function BotCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [userGateways, setUserGateways] = useState([])
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({
    name: '',
    bot_token: '',
    user_gateway_id: '',
  })

  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const data = await gatewayService.getUserGateways()
        setUserGateways(data || [])
        // Set default if available
        const defaultGateway = data?.find(g => g.is_default)
        if (defaultGateway) {
          setForm(prev => ({ ...prev, user_gateway_id: defaultGateway.id.toString() }))
        }
      } catch (error) {
        console.error('Error fetching gateways:', error)
      }
    }
    fetchGateways()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) {
      newErrors.name = 'Bot name is required'
    }
    if (!form.bot_token.trim()) {
      newErrors.bot_token = 'Bot token is required'
    } else if (!form.bot_token.includes(':')) {
      newErrors.bot_token = 'Invalid bot token format (should contain ":")'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await botService.create({
        name: form.name,
        bot_token: form.bot_token,
        user_gateway_id: form.user_gateway_id || null,
      })
      // Show toast then navigate
      setToast({ message: 'Bot berhasil dibuat!', type: 'success' })
      setTimeout(() => {
        navigate('/bots', { state: { message: 'Bot created successfully!' } })
      }, 1200)
    } catch (error) {
      console.error('Error creating bot:', error)
      const message = error.response?.data?.message || 'Failed to create bot'
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: message })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Toast Notification */}
      {toast && (
        <NeoToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/bots')}
          className="neo-btn-secondary p-2"
        >
          <IconArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Create New Bot</h1>
          <p className="text-gray-500 mt-1">Add a new Telegram bot to your account</p>
        </div>
      </div>

      {/* Form */}
      <div className="neo-card max-w-2xl">
        <div className="p-6 border-b-2 border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <IconBot className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Bot Information</h2>
              <p className="text-sm text-gray-500">Enter your bot details from BotFather</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="neo-badge-danger p-3 text-sm">
              {errors.general}
            </div>
          )}

          {/* Bot Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bot Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`neo-input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="My Awesome Bot"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Bot Token */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bot Token <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bot_token"
              value={form.bot_token}
              onChange={handleChange}
              className={`neo-input font-mono text-sm ${errors.bot_token ? 'border-red-500' : ''}`}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
            />
            {errors.bot_token && (
              <p className="text-red-500 text-sm mt-1">{errors.bot_token}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Get this from <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">@BotFather</a> on Telegram
            </p>
          </div>

          {/* Payment Gateway */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Gateway
            </label>
            <select
              name="user_gateway_id"
              value={form.user_gateway_id}
              onChange={handleChange}
              className="neo-select"
            >
              <option value="">Select Gateway (Optional)</option>
              {userGateways.map((gateway) => (
                <option key={gateway.id} value={gateway.id}>
                  {gateway.gateway?.name || gateway.label} {gateway.is_default ? '(Default)' : ''}
                </option>
              ))}
            </select>
            {userGateways.length === 0 && (
              <p className="text-amber-600 text-sm mt-1">
                No payment gateway configured. <a href="/payment-gateways" className="text-primary-500 hover:underline">Configure one first</a>
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/bots')}
              className="neo-btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="neo-btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                <>
                  <IconSave className="w-4 h-4 mr-2 inline" />
                  Create Bot
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
