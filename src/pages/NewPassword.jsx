import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { IconEye, IconEyeOff } from '../components/Icons'

export default function NewPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  })

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('password_reset_email')
    const verified = sessionStorage.getItem('password_reset_verified')

    if (!storedEmail || !verified) {
      navigate('/forgot-password')
      return
    }
    setEmail(storedEmail)
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Password confirmation does not match' })
      return
    }

    setIsLoading(true)

    try {
      const res = await api.post('/auth/forgot-password/set-password', {
        email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      })

      if (res.data.success) {
        // Clear session storage
        sessionStorage.removeItem('password_reset_email')
        sessionStorage.removeItem('password_reset_verified')
        
        // Redirect to login with success message
        navigate('/login', { state: { message: 'Password updated successfully! You can now login with your new password.' } })
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setError(err.response?.data?.message || 'Failed to update password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gray-900 rounded-xl translate-x-1 translate-y-1"></div>
                <div className="relative w-14 h-14 bg-[#8B5CF6] rounded-xl border-2 border-gray-900 flex items-center justify-center">
                  <span className="text-white font-black text-xl">S</span>
                </div>
              </div>
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">SPACEDIGITAL</h1>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
          <div className="w-12 h-1 bg-green-500"></div>
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
          <div className="w-12 h-1 bg-green-500"></div>
          <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-bold">3</div>
        </div>

        {/* Card */}
        <div className="neo-card p-8">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#8B5CF6]/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Password</h2>
            <p className="text-gray-500 mt-2">
              Set a new password for<br />
              <span className="font-semibold text-[#8B5CF6]">{email}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-500 rounded-lg">
              <p className="text-sm text-red-700 font-medium text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="neo-input pr-12"
                  placeholder="Min 8 chars, uppercase + lowercase"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>
              )}
              <p className="mt-1.5 text-xs text-gray-400">
                Must be at least 8 characters with uppercase and lowercase letters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="neo-input"
                placeholder="Repeat your password"
                required
              />
              {errors.password_confirmation && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password_confirmation}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.password || !formData.password_confirmation}
              className="neo-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:underline">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
