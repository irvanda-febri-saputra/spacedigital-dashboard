import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IconBot, IconArrowLeft, IconSave, IconTrash, IconCopy, IconCheck, IconKey } from '../components/Icons'
import { botService } from '../services/botService'
import { gatewayService } from '../services/gatewayService'
import NeoToast from '../components/NeoToast'

export default function BotEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [userGateways, setUserGateways] = useState([])
  const [errors, setErrors] = useState({})
  const [copied, setCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({
    name: '',
    bot_token: '',
    user_gateway_id: '',
    status: 'active',
  })
  const [botInfo, setBotInfo] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [botData, gatewaysData] = await Promise.all([
          botService.getById(id),
          gatewayService.getUserGateways(),
        ])
        
        setBotInfo(botData)
        setForm({
          name: botData.name || '',
          bot_token: botData.bot_token || '',
          user_gateway_id: botData.user_gateway_id?.toString() || '',
          status: botData.status || 'active',
        })
        setUserGateways(gatewaysData || [])
      } catch (error) {
        console.error('Error fetching bot:', error)
        navigate('/bots')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await botService.update(id, {
        name: form.name,
        bot_token: form.bot_token,
        user_gateway_id: form.user_gateway_id || null,
        status: form.status,
      })
      // Show toast then navigate
      setToast({ message: 'Bot berhasil diperbarui!', type: 'success' })
      setTimeout(() => {
        navigate('/bots', { state: { message: 'Bot updated successfully!' } })
      }, 1200)
    } catch (error) {
      console.error('Error updating bot:', error)
      const message = error.response?.data?.message || 'Failed to update bot'
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: message })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await botService.delete(id)
      navigate('/bots', { state: { message: 'Bot deleted successfully!' } })
    } catch (error) {
      console.error('Error deleting bot:', error)
      setErrors({ general: error.response?.data?.message || 'Failed to delete bot' })
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const copyApiKey = () => {
    if (botInfo?.settings?.api_key) {
      navigator.clipboard.writeText(botInfo.settings.api_key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="neo-card max-w-2xl h-96 animate-pulse bg-gray-100"></div>
      </div>
    )
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/bots')}
            className="neo-btn-secondary p-2"
          >
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">Edit Bot</h1>
            <p className="text-gray-500 mt-1">{botInfo?.name || 'Loading...'}</p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="neo-btn-danger"
        >
          <IconTrash className="w-4 h-4 mr-2 inline" />
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="neo-card max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Bot?</h3>
              <p className="text-gray-500 mb-4">
                Are you sure you want to delete <strong>{botInfo?.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="neo-btn-secondary flex-1"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="neo-btn-danger flex-1"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="neo-card">
            <div className="p-6 border-b-2 border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                  <IconBot className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-900">Bot Settings</h2>
                    {botInfo?.id && (
                      <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full">
                        #{botInfo.id}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Update your bot configuration</p>
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
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="neo-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  <option value="">Select Gateway</option>
                  {userGateways.map((gateway) => (
                    <option key={gateway.id} value={gateway.id}>
                      {gateway.gateway?.name || gateway.label} {gateway.is_default ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
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
                  disabled={saving}
                  className="neo-btn-primary flex-1"
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <>
                      <IconSave className="w-4 h-4 mr-2 inline" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar - API Key */}
        <div className="space-y-6">
          {botInfo?.settings?.api_key && (
            <div className="neo-card">
              <div className="p-6 border-b-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <IconKey className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">API Key</h3>
                    <p className="text-sm text-gray-500">For bot integration</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs break-all border-2 border-gray-200">
                  {botInfo.settings.api_key}
                </div>
                <button
                  onClick={copyApiKey}
                  className="neo-btn-secondary w-full mt-3"
                >
                  {copied ? (
                    <>
                      <IconCheck className="w-4 h-4 mr-2 inline text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <IconCopy className="w-4 h-4 mr-2 inline" />
                      Copy API Key
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Bot Info */}
          <div className="neo-card-flat p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Bot Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Username</span>
                <span className="text-sm font-medium">@{botInfo?.bot_username || 'Not connected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`neo-badge-${form.status === 'active' ? 'success' : 'gray'}`}>
                  {form.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm font-medium">{botInfo?.created_at || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
