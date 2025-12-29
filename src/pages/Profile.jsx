import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

// Random avatar styles from DiceBear
const AVATAR_STYLES = ['adventurer', 'avataaars', 'bottts', 'identicon', 'initials', 'pixel-art', 'shapes']

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [message, setMessage] = useState(null)
  
  const [avatarSeed, setAvatarSeed] = useState(user?.avatar_seed || user?.email || 'default')
  const [avatarStyle, setAvatarStyle] = useState(user?.avatar_style || 'adventurer')
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '' })
      setAvatarSeed(user.avatar_seed || user.email || 'default')
      setAvatarStyle(user.avatar_style || 'adventurer')
    }
  }, [user])

  const getAvatarUrl = (seed, style) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=8B5CF6`
  }

  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 12)
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)]
    setAvatarSeed(randomSeed)
    setAvatarStyle(randomStyle)
  }

  const handleAvatarSave = async () => {
    setSavingAvatar(true)
    setMessage(null)
    try {
      const res = await api.put('/dashboard/profile/avatar', {
        avatar_seed: avatarSeed,
        avatar_style: avatarStyle,
      })
      if (res.data?.user) {
        setUser(res.data.user)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      }
      setMessage({ type: 'success', text: 'Avatar updated successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save avatar' })
    } finally {
      setSavingAvatar(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setErrors({})
    
    try {
      const res = await api.put('/dashboard/profile', formData)
      if (res.data?.user) {
        setUser(res.data.user)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6 animate-pulse">
        <div className="mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-5 w-64 bg-gray-200 rounded"></div>
        </div>
        <div className="neo-card p-6">
          <div className="h-24 bg-gray-200 rounded"></div>
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
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Update your profile picture and information</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* Avatar Section */}
        <div className="neo-card">
          <div className="p-6 border-b-2 border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Profile Picture</h2>
            <p className="text-sm text-gray-500 mt-1">Your avatar across the platform</p>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-6">
              {/* Avatar Preview */}
              <div className="relative">
                <div className="w-24 h-24 rounded-xl border-3 border-gray-900 shadow-[4px_4px_0_#1A1A1A] overflow-hidden bg-[#8B5CF6]/10">
                  <img 
                    src={getAvatarUrl(avatarSeed, avatarStyle)} 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Avatar Controls */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Avatar Style</label>
                  <select
                    value={avatarStyle}
                    onChange={(e) => setAvatarStyle(e.target.value)}
                    className="neo-input"
                  >
                    {AVATAR_STYLES.map(style => (
                      <option key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={generateRandomAvatar}
                    className="neo-btn-outline-primary text-sm"
                  >
                    Generate Random
                  </button>
                  <button 
                    type="button"
                    onClick={handleAvatarSave}
                    disabled={savingAvatar}
                    className="neo-btn-primary text-sm"
                  >
                    {savingAvatar ? 'Saving...' : 'Save Avatar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="neo-card">
          <div className="p-6 border-b-2 border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
            <p className="text-sm text-gray-500 mt-1">Update your account's profile information</p>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="neo-input"
              />
              {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="neo-input bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed after registration</p>
            </div>

            <button type="submit" disabled={saving} className="neo-btn-primary text-sm">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
