import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function OrderKuota() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)
  const [tokenStatus, setTokenStatus] = useState(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Login state
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [otp, setOtp] = useState('')
  
  // QRIS state
  const [qrisString, setQrisString] = useState('')
  const [savingQris, setSavingQris] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const res = await api.get('/dashboard/orderkuota/status')
      if (res.data.success) {
        setStatus(res.data.data)
        setCredentials(prev => ({ ...prev, username: res.data.data.username || '' }))
        setQrisString(res.data.data.qris_string || '')
      }
    } catch (err) {
      console.error('Error fetching status:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkToken = async () => {
    setChecking(true)
    setError('')
    try {
      const res = await api.get('/dashboard/orderkuota/check-token')
      setTokenStatus(res.data)
    } catch (err) {
      setTokenStatus({ valid: false, message: 'Connection error' })
    } finally {
      setChecking(false)
    }
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.post('/dashboard/orderkuota/request-otp', credentials)
      if (res.data.success) {
        setSuccess('OTP telah dikirim ke email Anda!')
        setShowOtpForm(true)
      } else {
        setError(res.data.message || 'Failed to request OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.post('/dashboard/orderkuota/verify-otp', { otp })
      if (res.data.success) {
        setSuccess('Token berhasil disimpan!')
        setShowOtpForm(false)
        setCredentials(prev => ({ ...prev, password: '' }))
        setOtp('')
        fetchStatus()
        checkToken()
      } else {
        setError(res.data.message || 'Invalid OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSaveQris = async (e) => {
    e.preventDefault()
    if (!qrisString || qrisString.length < 50) {
      setError('QRIS string tidak valid (minimal 50 karakter)')
      return
    }
    
    setSavingQris(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.post('/dashboard/orderkuota/save-qris', { qris_string: qrisString })
      if (res.data.success) {
        setSuccess('QRIS string berhasil disimpan!')
        fetchStatus()
      } else {
        setError(res.data.message || 'Failed to save QRIS')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save QRIS')
    } finally {
      setSavingQris(false)
    }
  }

  // Auto check token on mount
  useEffect(() => {
    if (status?.has_token) {
      checkToken()
    }
  }, [status?.has_token])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border-4 border-black p-8 animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-12 bg-gray-200"></div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border-4 border-black p-8 animate-pulse">
                <div className="space-y-4">
                  {[1, 2].map(j => (
                    <div key={j} className="h-12 bg-gray-200"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Flash Messages */}
      {success && (
        <div className="neo-card bg-green-50 border-green-500 p-4">
          <p className="text-green-800 font-semibold">{success}</p>
        </div>
      )}
      {error && (
        <div className="neo-card bg-red-50 border-red-500 p-4">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - How to Use */}
        <div className="lg:col-span-1">
          <div className="neo-card p-6">
            <h3 className="font-bold text-lg mb-4">How to Use</h3>
            <ol className="space-y-4 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-xs">1</span>
                <div>
                  <p className="font-semibold">Get QRIS String</p>
                  <p className="text-gray-500">Open Order Kuota app, go to QRIS section, screenshot your QR code, then use
                    <a href="https://www.imagetotext.info/qr-code-scanner" target="_blank" rel="noopener noreferrer" className="text-primary-500 underline ml-1">QR Scanner</a> to get the string.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-xs">2</span>
                <div>
                  <p className="font-semibold">Login & Get Token</p>
                  <p className="text-gray-500">Enter your Order Kuota username and password, verify OTP sent to your email.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-xs">3</span>
                <div>
                  <p className="font-semibold">Configure Gateway</p>
                  <p className="text-gray-500">Go to <Link to="/payment-gateways" className="text-primary-500 underline">Payment Gateways</Link>, configure Order Kuota with your saved credentials.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-xs">4</span>
                <div>
                  <p className="font-semibold">Assign to Bot</p>
                  <p className="text-gray-500">Assign Order Kuota gateway to your bot. Payments will be auto-detected via polling.</p>
                </div>
              </li>
            </ol>

            <div className="mt-6 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-bold">Note:</span> Orkut memiliki batas maksimum 10 login perangkat. Hindari meminta OTP baru jika token saat ini masih berlaku.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Token Status */}
          <div className="neo-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Token Status</h3>
              <button
                onClick={checkToken}
                disabled={checking}
                className="neo-btn-primary"
              >
                {checking ? 'Checking...' : 'Check Token'}
              </button>
            </div>

            <div className="p-4 border-2 border-black rounded-lg bg-gray-50">
              {checking ? (
                <p className="text-gray-500">Checking token validity...</p>
              ) : tokenStatus ? (
                <div>
                  <p className={`font-semibold ${tokenStatus.valid ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {tokenStatus.valid ? 'Valid' : 'Invalid'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{tokenStatus.message}</p>
                  {tokenStatus.balance && (
                    <p className="text-sm text-gray-600">Balance: Rp {parseInt(tokenStatus.balance).toLocaleString('id-ID')}</p>
                  )}
                </div>
              ) : status?.has_token ? (
                <p className="text-gray-500">Click "Check Token" to verify your token</p>
              ) : (
                <p className="text-gray-500">No token configured. Please login below.</p>
              )}

              {status?.username && (
                <p className="text-sm text-gray-500 mt-2">Username: {status.username}</p>
              )}
              {status?.token_saved_at && (
                <p className="text-sm text-gray-500">Token saved: {new Date(status.token_saved_at).toLocaleString('id-ID')}</p>
              )}
            </div>
          </div>

          {/* Login Form */}
          <div className="neo-card p-6">
            <h3 className="font-bold text-lg mb-4">
              {showOtpForm ? 'Verify OTP' : 'Login Order Kuota'}
            </h3>

            {!showOtpForm ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Username</label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="neo-input"
                    placeholder="Your Order Kuota username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Password</label>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="neo-input"
                    placeholder="Your Order Kuota password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="neo-btn-primary"
                >
                  {loginLoading ? 'Sending OTP...' : 'Request OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-gray-600 mb-4">OTP code has been sent to your email. Check your inbox.</p>
                <div>
                  <label className="block text-sm font-semibold mb-2">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="neo-input"
                    placeholder="Enter 5-digit OTP"
                    maxLength={5}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="neo-btn-primary"
                  >
                    {loginLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOtpForm(false)}
                    className="neo-btn-secondary"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* QRIS String */}
          <div className="neo-card p-6">
            <h3 className="font-bold text-lg mb-2">QRIS String</h3>
            <p className="text-sm text-gray-600 mb-4">
              Paste your static QRIS string from Order Kuota.
              Use <a href="https://www.imagetotext.info/qr-code-scanner" target="_blank" rel="noopener noreferrer" className="text-primary-500 underline">QR Scanner</a> to extract string from QR image.
            </p>

            <form onSubmit={handleSaveQris} className="space-y-4">
              <div>
                <textarea
                  value={qrisString}
                  onChange={(e) => setQrisString(e.target.value)}
                  className="neo-input min-h-[100px] font-mono text-xs"
                  placeholder="00020101021126670016COM.NOBUBANK.WWW..."
                />
              </div>
              <button
                type="submit"
                disabled={savingQris}
                className="neo-btn-primary"
              >
                {savingQris ? 'Saving...' : 'Save QRIS String'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
