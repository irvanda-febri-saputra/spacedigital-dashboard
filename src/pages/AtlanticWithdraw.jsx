import { useState, useEffect } from 'react'
import api from '../services/api'

export default function AtlanticWithdraw() {
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  
  // Balance states
  const [balance, setBalance] = useState(null)
  const [pendingBalance, setPendingBalance] = useState(null)
  const [loadingBalance, setLoadingBalance] = useState(true)
  
  // Banks
  const [banks, setBanks] = useState([])
  const [loadingBanks, setLoadingBanks] = useState(true)
  
  // Withdraw fee
  const withdrawFee = 2000
  
  // Form
  const [formData, setFormData] = useState({
    amount: '',
    bank_code: '',
    account_name: '',
    account_number: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchBalance()
    fetchBanks()
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const fetchBalance = async () => {
    try {
      setLoadingBalance(true)
      const res = await api.get('/dashboard/atlantic/balance')
      if (res.data.success) {
        setBalance(res.data.balance)
        setPendingBalance(res.data.pendingBalance)
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err)
    } finally {
      setLoadingBalance(false)
    }
  }

  const fetchBanks = async () => {
    try {
      setLoadingBanks(true)
      const res = await api.get('/dashboard/atlantic/banks')
      if (res.data.success) {
        setBanks(res.data.banks || [])
      }
    } catch (err) {
      console.error('Failed to fetch banks:', err)
    } finally {
      setLoadingBanks(false)
    }
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '---'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleVerifyAccount = async () => {
    if (!formData.bank_code || !formData.account_number) {
      setVerifyError('Please select bank and enter account number first')
      return
    }

    setVerifying(true)
    setVerifyError('')
    setVerified(false)

    try {
      const res = await api.post('/dashboard/atlantic/verify', {
        bank_code: formData.bank_code,
        account_number: formData.account_number,
      })

      if (res.data.success) {
        setFormData(prev => ({ 
          ...prev, 
          account_name: res.data.account_name,
          account_number: res.data.account_number || prev.account_number 
        }))
        setVerified(true)
      } else {
        setVerifyError(res.data.message || 'Account not found')
      }
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Connection error')
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    setErrors({})

    try {
      const res = await api.post('/dashboard/atlantic/withdraw', formData)
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message || 'Withdrawal submitted successfully!' })
        setFormData({
          amount: '',
          bank_code: '',
          account_name: '',
          account_number: '',
        })
        setVerified(false)
        fetchBalance()
      } else {
        setMessage({ type: 'error', text: res.data.message || 'Withdrawal failed' })
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit withdrawal' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const totalWithdraw = formData.amount ? parseInt(formData.amount) + withdrawFee : 0
  const canSubmit = verified && formData.amount && parseInt(formData.amount) >= 10000 && balance !== null && totalWithdraw <= balance

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-5 w-72 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="neo-card p-6">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Atlantic Withdraw</h1>
        <p className="text-gray-500 mt-1">Withdraw your Atlantic H2H balance to bank or e-wallet</p>
      </div>

      {/* Weekend Notice */}
      <div className="neo-card bg-amber-50 border-amber-500 p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="text-amber-800 font-medium">Atlantic Withdrawal Notice</span>
            <p className="text-amber-700 text-sm mt-1">
              Withdrawals are not available on weekends (Saturday & Sunday). Please try again on Monday.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`neo-card p-4 ${
          message.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="neo-card p-6 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center">
              {loadingBalance ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-white/80 text-sm font-semibold">Available Balance</p>
              <p className="text-white text-2xl font-bold">
                {loadingBalance ? 'Loading...' : formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="neo-card p-6 bg-gradient-to-br from-pink-500 to-rose-500">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center">
              {loadingBalance ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-white/80 text-sm font-semibold">Pending Settlement</p>
              <p className="text-white text-2xl font-bold">
                {loadingBalance ? 'Loading...' : (pendingBalance === null ? 'N/A' : formatCurrency(pendingBalance))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Form */}
      <div className="neo-card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Withdraw Funds</h2>
        <p className="text-gray-500 text-sm mb-6">Fill in the details below to withdraw your balance</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Amount Withdraw *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="neo-input"
              placeholder="Enter amount (min. Rp 10.000)"
              min="10000"
            />
            <p className="mt-1.5 text-sm text-gray-500">
              Withdrawal fee: <span className="font-semibold text-[#8B5CF6]">{formatCurrency(withdrawFee)}</span>
            </p>
            {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
          </div>

          {/* Bank Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Bank / E-Wallet *
            </label>
            <select
              value={formData.bank_code}
              onChange={(e) => {
                setFormData({ ...formData, bank_code: e.target.value, account_name: '' })
                setVerified(false)
              }}
              className="neo-input"
              disabled={loadingBanks}
            >
              <option value="">
                {loadingBanks ? 'Loading banks...' : 'Select Bank or E-Wallet'}
              </option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name} ({bank.type})
                </option>
              ))}
            </select>
            {errors.bank_code && <p className="mt-1 text-sm text-red-500">{errors.bank_code}</p>}
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Account Number *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) => {
                  setFormData({ ...formData, account_number: e.target.value, account_name: '' })
                  setVerified(false)
                }}
                className="neo-input flex-1"
                placeholder="Enter account number"
              />
              <button
                type="button"
                onClick={handleVerifyAccount}
                disabled={verifying || !formData.bank_code || !formData.account_number}
                className="neo-btn-outline-primary px-4 py-2 whitespace-nowrap disabled:opacity-50"
              >
                {verifying ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Verify'
                )}
              </button>
            </div>
            {verifyError && <p className="mt-1 text-sm text-red-500">{verifyError}</p>}
            {errors.account_number && <p className="mt-1 text-sm text-red-500">{errors.account_number}</p>}
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Account Holder Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value.toUpperCase() })}
                className={`neo-input ${verified ? 'bg-green-50 border-green-500' : ''}`}
                placeholder="Enter FULL account holder name (e.g. JOHN DOE)"
              />
              {verified && (
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            {verified && formData.account_name && (
              <p className="mt-1 text-xs text-green-600">
                ✓ Verified account. Please ensure the name matches the account holder exactly.
              </p>
            )}
            {errors.account_name && <p className="mt-1 text-sm text-red-500">{errors.account_name}</p>}
          </div>

          {/* Summary */}
          {formData.amount && parseInt(formData.amount) >= 10000 && (
            <div className="neo-card bg-gray-50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Withdraw Amount</span>
                <span className="font-medium">{formatCurrency(parseInt(formData.amount))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fee</span>
                <span className="font-medium text-red-500">- {formatCurrency(withdrawFee)}</span>
              </div>
              <hr className="border-gray-300" />
              <div className="flex justify-between text-base font-bold">
                <span className="text-gray-900">Total Deducted</span>
                <span className="text-[#8B5CF6]">{formatCurrency(totalWithdraw)}</span>
              </div>
              {totalWithdraw > balance && (
                <p className="text-red-500 text-sm mt-2">⚠️ Insufficient balance</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="neo-btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              'Submit Withdrawal'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
