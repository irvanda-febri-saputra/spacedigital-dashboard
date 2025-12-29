import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const inputRefs = useRef([])

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verification_email')
    if (!storedEmail) {
      navigate('/register')
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
      const res = await api.post('/auth/email/verify', {
        email,
        code: otp,
      })

      if (res.data.success) {
        // Clear session storage
        sessionStorage.removeItem('verification_email')
        
        // Redirect to login with success message
        navigate('/login', { state: { message: 'Email verified successfully! You can now login.' } })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code')
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
      const res = await api.post('/auth/email/resend', { email })
      if (res.data.success) {
        setMessage('A new verification code has been sent to your email')
        setOtp('')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="neo-card p-8 text-center">
          {/* Email Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>

          <p className="text-gray-500 mb-6">
            We've sent a 6-digit code to<br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-500 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
              <p className="text-sm text-green-700 font-medium">{message}</p>
            </div>
          )}

          {/* OTP Input */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
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
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-900 rounded-lg shadow-[3px_3px_0_#1A1A1A] focus:border-[#8B5CF6] focus:shadow-[3px_3px_0_#8B5CF6] focus:outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="neo-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {/* Resend */}
          <p className="text-sm text-gray-500 mb-4">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-[#8B5CF6] font-medium hover:underline disabled:opacity-50"
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>

          <div className="mt-6">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          © 2025 Spacedigital. All rights reserved.
        </p>
      </div>
    </div>
  )
}
