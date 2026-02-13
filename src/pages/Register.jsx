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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header Outside Card */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <div className="h-0.5 bg-[#8B5CF6] mx-auto mt-2 mb-4" style={{width: 'fit-content', minWidth: '150px'}}></div>
          <p className="text-gray-600">Join Spacedigital to manage bot store telegram</p>
        </div>

        {/* Register Card */}
        <div className="bg-white p-8 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Info Box - Blue */}
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg shadow-[3px_3px_0_#3b82f6]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700">You'll receive a verification email after registration</span>
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:border-[#8B5CF6] focus:shadow-[6px_6px_0px_0px_rgba(139,92,246,0.3)] text-gray-900 font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-200 ease-in-out"
                placeholder="Enter your full name"
                required
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:border-[#8B5CF6] focus:shadow-[6px_6px_0px_0px_rgba(139,92,246,0.3)] text-gray-900 font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-200 ease-in-out"
                placeholder="Enter your email"
                required
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border-2 border-black rounded-lg focus:outline-none focus:border-[#8B5CF6] focus:shadow-[6px_6px_0px_0px_rgba(139,92,246,0.3)] text-gray-900 font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-200 ease-in-out"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:border-[#8B5CF6] focus:shadow-[6px_6px_0px_0px_rgba(139,92,246,0.3)] text-gray-900 font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-200 ease-in-out"
                placeholder="Confirm your password"
                required
              />
              {errors.password_confirmation && (
                <p className="mt-2 text-sm text-red-500">{errors.password_confirmation}</p>
              )}
            </div>

            {/* Turnstile Widget */}
            <div className="flex justify-center">
              <Turnstile
                sitekey={TURNSTILE_SITE_KEY}
                onVerify={(token) => {
                  setTurnstileToken(token)
                  setTurnstileError('')
                }}
                onError={() => {
                  setTurnstileError('Security verification failed. Please try again.')
                  setTurnstileToken('')
                }}
                onExpire={() => {
                  setTurnstileToken('')
                }}
                theme="light"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !turnstileToken}
              className="w-full bg-[#8B5CF6] text-white py-3 px-4 text-sm font-bold rounded-lg hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">OR</span>
          </div>

          {/* Login Link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#8B5CF6] hover:text-[#7C3AED] font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
