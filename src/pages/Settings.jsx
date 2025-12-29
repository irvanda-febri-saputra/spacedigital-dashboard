import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Settings() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [message, setMessage] = useState(null)
  const [passwordSaving, setPasswordSaving] = useState(false)
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const copyApiKey = () => {
    if (user?.api_token) {
      navigator.clipboard.writeText(user.api_token)
      setCopying(true)
      setTimeout(() => setCopying(false), 2000)
    }
  }

  const regenerateApiKey = async () => {
    if (!confirm('Are you sure you want to regenerate your API Key? This will invalidate your current key and require updating all connected bots.')) {
      return
    }
    
    setRegenerating(true)
    try {
      const res = await api.post('/dashboard/settings/regenerate-api-key')
      if (res.data?.user) {
        setUser(res.data.user)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      }
      setMessage({ type: 'success', text: 'API Key regenerated successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to regenerate API key' })
    } finally {
      setRegenerating(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match' })
      return
    }
    
    if (passwordForm.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' })
      return
    }
    
    setPasswordSaving(true)
    setMessage(null)
    setErrors({})
    
    try {
      await api.put('/dashboard/password', passwordForm)
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      })
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' })
      }
    } finally {
      setPasswordSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6 animate-pulse">
        <div className="mb-6">
          <div className="h-8 w-28 bg-gray-200 rounded mb-2"></div>
          <div className="h-5 w-72 bg-gray-200 rounded"></div>
        </div>
        <div className="neo-card p-6">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
        <div className="neo-card p-6">
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and API access</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border-2 max-w-2xl ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* API Key Section */}
        <div className="neo-card">
          <div className="p-6 border-b-2 border-gray-100 bg-purple-50">
            <h2 className="text-lg font-bold text-gray-900">API Key</h2>
            <p className="text-sm text-gray-500 mt-1">Use this key to connect your bot to the dashboard</p>
          </div>

          <div className="p-6 space-y-4">
            {user?.api_token ? (
              <>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm font-mono bg-gray-100 px-4 py-3 rounded-lg border-2 border-gray-200 break-all">
                    {user.api_token}
                  </code>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyApiKey}
                    className="neo-btn-primary text-sm"
                  >
                    {copying ? '✓ Copied!' : 'Copy API Key'}
                  </button>
                  <button
                    onClick={regenerateApiKey}
                    disabled={regenerating}
                    className="neo-btn-outline-primary text-sm text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {regenerating ? 'Regenerating...' : 'Regenerate Key'}
                  </button>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">How to use:</p>
                  <p className="text-sm text-blue-700">
                    Add this to your bot's <code className="bg-blue-100 px-1 rounded">.env</code> file:
                  </p>
                  <code className="block mt-2 text-xs font-mono bg-blue-100 px-3 py-2 rounded break-all overflow-x-auto whitespace-pre-wrap">
                    DASHBOARD_API_KEY={user.api_token}
                  </code>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No API Key generated yet</p>
                <button
                  onClick={regenerateApiKey}
                  disabled={regenerating}
                  className="neo-btn-primary"
                >
                  {regenerating ? 'Generating...' : 'Generate API Key'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="neo-card">
          <div className="p-6 border-b-2 border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-500">Ensure your account is using a secure password</p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="neo-input pr-12"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.current_password && (
                <p className="mt-2 text-sm text-red-500">{errors.current_password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                className="neo-input"
                placeholder="Min 8 chars, uppercase + lowercase"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">Must be at least 8 characters with uppercase and lowercase letters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={passwordForm.password_confirmation}
                onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                className="neo-input"
                placeholder="Repeat new password"
              />
              {errors.password_confirmation && (
                <p className="mt-2 text-sm text-red-500">{errors.password_confirmation}</p>
              )}
            </div>

            <button type="submit" disabled={passwordSaving} className="neo-btn-primary text-sm">
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="neo-card">
          <div className="p-6 border-b-2 border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Account Information</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Email</span>
              <span className="text-sm text-gray-700">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Role</span>
              <span className="neo-badge-purple">
                {user?.role === 'super_admin' ? 'Super Admin' : 'User'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Member Since</span>
              <span className="text-sm text-gray-700">{formatDate(user?.created_at)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Status</span>
              <span className="neo-badge-success">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
