import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Turnstile from 'react-turnstile'
import api from '../services/api'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACAOvQAepU-lpDlC'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [turnstileError, setTurnstileError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setTurnstileError('')

    if (!turnstileToken) {
      setTurnstileError('Please complete the security verification')
      return
    }

    setIsLoading(true)

    try {
      const res = await api.post('/auth/forgot-password', {
        email,
        turnstile_token: turnstileToken,
      })

      if (res.data.success) {
        // Store email for OTP verification page
        sessionStorage.setItem('password_reset_email', email)
        navigate('/forgot-password/verify')
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to send reset code. Please try again.')
      }
      // Reset turnstile on error
      setTurnstileToken('')
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

        {/* Card */}
        <div className="neo-card p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
            <p className="text-gray-500 mt-1">Enter your email to receive a password reset code</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neo-input"
                placeholder="you@example.com"
                required
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Turnstile Widget */}
            <div className="flex justify-center">
              <Turnstile
                sitekey={TURNSTILE_SITE_KEY}
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken('')}
                theme="light"
              />
            </div>
            {errors.turnstile && (
              <p className="text-sm text-red-500 text-center">{errors.turnstile}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="neo-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-[#8B5CF6] hover:underline font-medium">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
