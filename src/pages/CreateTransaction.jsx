import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import { gatewayService } from '../services/gatewayService'

// Minimum amount per gateway
const GATEWAY_MINIMUMS = {
  qiospay: 2,
  orderkuota: 2,
  atlantic: 1000,
  pakasir: 500,
  default: 1000
}

const getMinimumAmount = (gatewayCode) => {
  if (!gatewayCode) return GATEWAY_MINIMUMS.default
  const code = gatewayCode.toLowerCase()
  return GATEWAY_MINIMUMS[code] || GATEWAY_MINIMUMS.default
}

export default function CreateTransaction() {
  const [gateways, setGateways] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [transaction, setTransaction] = useState(null)
  const [status, setStatus] = useState(null)
  const pollingRef = useRef(null)

  const [formData, setFormData] = useState({
    gateway_id: '',
    amount: '10000',
    product_name: 'Test Product',
    customer_name: 'Test Customer'
  })

  // Get selected gateway
  const selectedGateway = gateways.find(g => g.id === parseInt(formData.gateway_id))
  const minimumAmount = getMinimumAmount(selectedGateway?.gateway?.code)

  useEffect(() => {
    fetchGateways()
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const fetchGateways = async () => {
    try {
      setLoading(true)
      const res = await gatewayService.getUserGateways()
      const activeGateways = (res.data || res || []).filter(g => g.is_active)
      setGateways(activeGateways)
      if (activeGateways.length > 0) {
        setFormData(prev => ({ ...prev, gateway_id: activeGateways[0].id }))
      }
    } catch (err) {
      console.error('Error fetching gateways:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    setTransaction(null)
    setStatus(null)

    try {
      const res = await api.post('/dashboard/test-transaction', {
        gateway_id: parseInt(formData.gateway_id),
        amount: parseInt(formData.amount),
        product_name: formData.product_name,
        customer_name: formData.customer_name
      })

      if (res.data.success) {
        setTransaction(res.data.data)
        startPolling(res.data.data.order_id)
      } else {
        setError(res.data.message || 'Failed to create transaction')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction')
    } finally {
      setCreating(false)
    }
  }

  const startPolling = (orderId) => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    
    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/dashboard/test-transaction/${orderId}/status`)
        if (res.data.success) {
          setStatus(res.data.data)
          if (res.data.data.status === 'success' || res.data.data.status === 'failed') {
            clearInterval(pollingRef.current)
          }
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 3000)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Simple QR Code component
  const QRCode = ({ value, size = 200 }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`
    return <img src={qrUrl} alt="QR Code" width={size} height={size} />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 animate-pulse"></div>
        <div className="bg-white border-4 border-black p-8 animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black">Create Transaction</h1>
        <p className="text-gray-600 mt-1">Test kredensial payment gateway dengan membuat transaksi percobaan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="neo-card">
          <div className="border-b-2 border-gray-200 p-4">
            <h2 className="font-black text-lg">Test Gateway</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="border-4 border-black p-4 font-bold text-red-600">
                ⚠️ {error}
              </div>
            )}

            {gateways.length === 0 ? (
              <div className="border-4 border-black p-4 text-center">
                <p className="font-bold">Tidak ada payment gateway aktif</p>
                <p className="text-sm text-gray-600 mt-1">Silakan konfigurasi gateway di halaman Payment Gateways</p>
              </div>
            ) : (
              <>
                {/* Gateway Selection */}
                <div>
                  <label className="block font-bold mb-2">Payment Gateway *</label>
                  <select
                    value={formData.gateway_id}
                    onChange={(e) => setFormData({ ...formData, gateway_id: e.target.value })}
                    required
                    className="neo-input"
                  >
                    {gateways.map(gw => (
                      <option key={gw.id} value={gw.id}>
                        {gw.label || gw.gateway?.name} ({gw.gateway?.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block font-bold mb-2">Amount (Rp) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min={minimumAmount}
                    className="neo-input"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimal Rp {minimumAmount.toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block font-bold mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    required
                    className="neo-input"
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block font-bold mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                    className="neo-input"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={creating}
                  className="neo-btn-primary w-full"
                >
                  {creating ? 'Creating...' : 'Create Test Transaction'}
                </button>
              </>
            )}
          </form>
        </div>

        {/* Result */}
        <div className="space-y-6">
          {transaction && (
            <div className="neo-card">
              <div className="border-b-2 border-gray-200 p-4">
                <h2 className="font-black text-lg">Transaction Created</h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Status */}
                {status && (
                  <div className="p-4 border-4 border-black">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Status:</span>
                      <span className={`font-black text-lg uppercase ${
                        status.status === 'success' ? 'text-green-600' : 
                        status.status === 'failed' ? 'text-red-600' : ''
                      }`}>
                        {status.status}
                      </span>
                    </div>
                    {status.paid_at && (
                      <div className="text-sm mt-2">Paid at: {new Date(status.paid_at).toLocaleString('id-ID')}</div>
                    )}
                  </div>
                )}

                {/* QR Code */}
                {transaction.qr_string && (
                  <div className="flex flex-col items-center p-4 border-4 border-black">
                    <QRCode value={transaction.qr_string} size={200} />
                    <p className="mt-4 font-bold text-center">Scan QR untuk membayar</p>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2 text-sm border-4 border-black p-4">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span>Order ID:</span>
                    <span className="font-bold font-mono">{transaction.order_id}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span>Gateway:</span>
                    <span className="font-bold">{transaction.gateway}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span>Amount:</span>
                    <span className="font-bold">{formatPrice(transaction.amount)}</span>
                  </div>
                  {transaction.final_amount !== transaction.amount && (
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Final Amount:</span>
                      <span className="font-bold">{formatPrice(transaction.final_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span className="font-bold">{new Date(transaction.expires_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* QR String (copyable) */}
                {transaction.qr_string && (
                  <div>
                    <label className="block font-bold mb-2 text-sm">QR String:</label>
                    <textarea
                      readOnly
                      value={transaction.qr_string}
                      rows={3}
                      className="w-full px-3 py-2 border-4 border-black text-xs font-mono"
                      onClick={(e) => e.target.select()}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="neo-card">
            <div className="border-b-2 border-gray-200 p-4">
              <h2 className="font-black text-lg">Cara Penggunaan</h2>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="font-black">1.</span>
                <span>Pilih payment gateway yang sudah dikonfigurasi</span>
              </div>
              <div className="flex gap-3">
                <span className="font-black">2.</span>
                <span>Masukkan nominal pembayaran untuk test</span>
              </div>
              <div className="flex gap-3">
                <span className="font-black">3.</span>
                <span>Klik "Create Test Transaction"</span>
              </div>
              <div className="flex gap-3">
                <span className="font-black">4.</span>
                <span>Jika berhasil, QR Code akan muncul</span>
              </div>
              <div className="flex gap-3">
                <span className="font-black">5.</span>
                <span>Scan QR dan lakukan pembayaran untuk memverifikasi</span>
              </div>
              <div className="flex gap-3">
                <span className="font-black">6.</span>
                <span>Status akan otomatis update ketika pembayaran diterima</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
