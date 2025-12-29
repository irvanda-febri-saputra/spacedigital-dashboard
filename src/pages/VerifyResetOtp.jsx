import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function VerifyResetOtp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const inputRefs = useRef([])

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('password_reset_email')
    if (!storedEmail) {
      navigate('/forgot-password')
      return
    }
    setEmail(storedEmail)
  }, [navigate])

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = otp.split('')
    newOtp[index] = value.slice(-1)

    const otpString = newOtp.join('').slice(0, 6)
    setOtp(otpString)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    setOtp(pastedData)

    const focusIndex = Math.min(pastedData.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (otp.length < 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setIsLoading(true)

    try {
      const res = await api.post('/auth/forgot-password/verify', {
        email,
        otp,
      })

      if (res.data.success) {
        // Store verified flag
        sessionStorage.setItem('password_reset_verified', 'true')
        navigate('/forgot-password/new-password')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code')
      setOtp('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    setIsResending(true)

    try {
      const res = await api.post('/auth/forgot-password/resend', { email })
      if (res.data.success) {
        setMessage('A new code has been sent to your email')
        setOtp('')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code')
    } finally {
      setIsResending(false)
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
          <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-bold">2</div>
          <div className="w-12 h-1 bg-gray-200"></div>
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
        </div>

        {/* Card */}
        <div className="neo-card p-8">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#8B5CF6]/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
            <p className="text-gray-500 mt-2">
              We sent a 6-digit code to<br />
              <span className="font-semibold text-[#8B5CF6]">{email}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-500 rounded-lg">
              <p className="text-sm text-red-700 font-medium text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
              <p className="text-sm text-green-700 font-medium text-center">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index] || ''}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-900 rounded-lg shadow-[3px_3px_0_#1A1A1A] focus:border-[#8B5CF6] focus:shadow-[3px_3px_0_#8B5CF6] focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="neo-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-[#8B5CF6] hover:underline font-medium disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend'}
              </button>
            </p>

            <div className="border-t border-gray-100 pt-3">
              <Link to="/login" className="text-sm text-gray-500 hover:underline">
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
