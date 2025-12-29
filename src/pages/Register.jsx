import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Turnstile from 'react-turnstile'
import api from '../services/api'
import { IconEye, IconEyeOff } from '../components/Icons'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACAOvQAepU-lpDlC'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [turnstileError, setTurnstileError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setTurnstileError('')

    if (!turnstileToken) {
      setTurnstileError('Please complete the security verification')
      return
    }

    // Basic validation
    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Password confirmation does not match' })
      return
    }

    setIsLoading(true)

    try {
      const res = await api.post('/auth/register', {
        ...formData,
        turnstile_token: turnstileToken,
      })

      if (res.data.success) {
        // Store email for verification page
        sessionStorage.setItem('verification_email', formData.email)
        navigate('/verify-email')
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Registration failed. Please try again.')
      }
      // Reset turnstile on error
      setTurnstileToken('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Register Card - Neo Brutalism */}
        <div className="neo-card p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gray-900 rounded-xl translate-x-1 translate-y-1"></div>
                <div className="relative w-14 h-14 bg-[#8B5CF6] rounded-xl border-2 border-gray-900 flex items-center justify-center">
                  <span className="text-white font-black text-xl">S</span>
                </div>
              </div>
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">SPACEDIGITAL</h1>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Create an Account
            </h2>
            <p className="text-gray-500 mt-2">
              Join Spacedigital to manage your bot
            </p>
          </div>

          {/* Info Box */}
          <div className="mb-6 flex items-start gap-3 p-4 bg-violet-50 border-2 border-violet-500 shadow-[4px_4px_0_#7C3AED] rounded-lg">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-violet-700">You'll receive a verification email after registration</span>
          </div>

          {/* Error Message */}
          {(error || turnstileError) && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg shadow-[3px_3px_0_#ef4444]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-red-700">{error || turnstileError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="neo-input"
                placeholder="John Doe"
                required
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="neo-input"
                placeholder="name@example.com"
                required
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="neo-input pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password}</p>
              )}
              <p className="mt-1.5 text-xs text-gray-400">
                Must be at least 8 characters with uppercase and lowercase letters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="neo-input"
                placeholder="••••••••"
                required
              />
              {errors.password_confirmation && (
                <p className="mt-2 text-sm text-red-500">{errors.password_confirmation}</p>
              )}
            </div>

            {/* Cloudflare Turnstile */}
            <div className="flex justify-center">
              <Turnstile
                sitekey={TURNSTILE_SITE_KEY}
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken('')}
                theme="light"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="neo-btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-gray-400 text-sm font-medium">
                OR
              </span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#8B5CF6] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          © 2025 Spacedigital. All rights reserved.
        </p>
      </div>
    </div>
  )
}
