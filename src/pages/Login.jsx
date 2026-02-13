import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import Turnstile from 'react-turnstile'
import { useAuthStore } from '../store/authStore'
import { IconEye, IconEyeOff } from '../components/Icons'

// Turnstile Site Key
// Production: '0x4AAAAAACAOvQAepU-lpDlC'
// Test (always passes): '1x00000000000000000000AA'
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACAOvQAepU-lpDlC'

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState('')
    const [turnstileError, setTurnstileError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Check for success message from navigation
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message)
            // Clear the state
            window.history.replaceState({}, document.title)
        }
    }, [location.state])

    // Redirect if already authenticated
    useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (isAuthenticated || token) {
            navigate('/dashboard', { replace: true })
        }
    }, [isAuthenticated, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        clearError()
        setTurnstileError('')

        if (!turnstileToken) {
            setTurnstileError('Please complete the security verification')
            return
        }

        const result = await login(email, password, turnstileToken)
        if (result.success) {
            navigate('/dashboard', { replace: true })
        } else {
            // Reset turnstile token on error
            setTurnstileToken('')
        }
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-sm">
                {/* Login Card - Neo Brutalism */}
                <div className="neo-card p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">SPACEDIGITAL</h1>
                        <div className="w-20 h-1 bg-[#8B5CF6] mx-auto mt-2 mb-4"></div>
                        <p className="text-gray-600 text-lg">Sign in to your account</p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg shadow-[3px_3px_0_#22c55e]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-green-700">{successMessage}</span>
                            </div>
                        </div>
                    )}

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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-black text-gray-900 uppercase tracking-wide mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="neo-input w-full px-4 py-3 border-2 border-black bg-white text-gray-900 focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0_#8B5CF6]"
                                placeholder=""
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-black text-gray-900 uppercase tracking-wide mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="neo-input w-full px-4 py-3 pr-12 border-2 border-black bg-white text-gray-900 focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0_#8B5CF6]"
                                    placeholder=""
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 hover:text-[#8B5CF6] font-bold transition-colors"
                                >
                                    {showPassword ? (
                                        <IconEyeOff className="w-5 h-5" />
                                    ) : (
                                        <IconEye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
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

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-2 border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                                />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-[#8B5CF6] hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !turnstileToken}
                            className="neo-btn w-full bg-[#8B5CF6] text-white py-3 px-4 border-2 border-black font-black text-base uppercase tracking-wider hover:bg-[#7C3AED] focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] active:shadow-none active:transform active:translate-x-[2px] active:translate-y-[2px] transition-all"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="text-center text-gray-400 text-sm my-4">
                        OR
                    </div>

                    {/* Register Link */}
                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-medium text-[#8B5CF6] hover:underline"
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
