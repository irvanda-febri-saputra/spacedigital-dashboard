import { useState, useEffect } from 'react'
import stockService from '../services/stockService'
import NeoToast from '../components/NeoToast'

// Hastebin URL
const HASTEBIN_URL = 'https://sumini.prabowo23.my.id'

export default function Stocks() {
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [stats, setStats] = useState({ total: 0, available: 0, sold: 0 })

  // Product selection
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('')

  // Stocks for selected product
  const [stocks, setStocks] = useState([])
  const [stockLoading, setStockLoading] = useState(false)

  // Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Hastebin
  const [hastebinLoading, setHastebinLoading] = useState(false)
  const [hastebinLink, setHastebinLink] = useState('')

  // Form
  const [form, setForm] = useState({
    product_id: '',
    variant_id: '',
    data: ''
  })

  // Form variants (separate from filter variants)
  const [formVariants, setFormVariants] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchStats()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      fetchVariantsForProduct(selectedProduct)
      fetchStocksForProduct(selectedProduct, selectedVariant)
    } else {
      setVariants([])
      setSelectedVariant('')
      setStocks([])
    }
  }, [selectedProduct])

  useEffect(() => {
    if (selectedProduct) {
      fetchStocksForProduct(selectedProduct, selectedVariant)
    }
  }, [selectedVariant])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await stockService.getProducts()
      const data = response.data || response || []
      setProducts(data)
    } catch (error) {
      showToast('Gagal memuat produk', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchVariantsForProduct = async (productId) => {
    try {
      const response = await stockService.getProductVariants(productId)
      setVariants(response.data || response || [])
    } catch (error) {
      setVariants([])
    }
  }

  const fetchFormVariants = async (productId) => {
    try {
      const response = await stockService.getProductVariants(productId)
      setFormVariants(response.data || response || [])
    } catch (error) {
      setFormVariants([])
    }
  }

  const fetchStocksForProduct = async (productId, variantId = '') => {
    try {
      setStockLoading(true)
      const params = { product_id: productId, is_sold: false }
      if (variantId) params.variant_id = variantId
      
      const response = await stockService.getStocks(params)
      setStocks(response.data || response || [])
      setHastebinLink('') // Reset hastebin link when changing selection
    } catch (error) {
      setStocks([])
    } finally {
      setStockLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await stockService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleAddStock = async (e) => {
    e.preventDefault()
    if (!form.product_id || !form.data.trim()) {
      showToast('Pilih produk dan isi data stock', 'error')
      return
    }

    try {
      setSaving(true)
      await stockService.addStock(form)
      showToast('Stock berhasil ditambahkan!', 'success')
      setShowAddModal(false)
      setForm({ product_id: '', variant_id: '', data: '' })
      setFormVariants([])
      
      // Refresh if same product
      if (form.product_id === selectedProduct) {
        fetchStocksForProduct(selectedProduct, selectedVariant)
      }
      fetchStats()
      fetchProducts() // Refresh product counts
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menambah stock', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await stockService.deleteStock(id)
      showToast('Stock berhasil dihapus', 'success')
      setDeleteConfirm(null)
      fetchStocksForProduct(selectedProduct, selectedVariant)
      fetchStats()
      fetchProducts()
    } catch (error) {
      showToast('Gagal menghapus stock', 'error')
    }
  }

  // Generate Hastebin link for current stocks
  const generateHastebinLink = async () => {
    if (stocks.length === 0) {
      showToast('Tidak ada stock untuk di-export', 'error')
      return
    }

    try {
      setHastebinLoading(true)
      
      // Get product name
      const product = products.find(p => p.id == selectedProduct)
      const variant = variants.find(v => v.id == selectedVariant)
      
      let text = '═══════════════════════════════════════\n'
      text += `   📦 STOCK: ${product?.name || 'Unknown'}`
      if (variant) text += ` - ${variant.name}`
      text += '\n═══════════════════════════════════════\n\n'
      
      stocks.forEach((stock, idx) => {
        text += `${idx + 1}. ${stock.data}\n`
      })
      
      text += '\n═══════════════════════════════════════\n'
      text += `📊 Total: ${stocks.length} akun\n`
      text += `⏰ Generated: ${new Date().toLocaleString('id-ID')}\n`
      text += '═══════════════════════════════════════'

      // Post to hastebin
      const response = await fetch(`${HASTEBIN_URL}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: text
      })
      
      const data = await response.json()
      
      if (data.key) {
        const link = `${HASTEBIN_URL}/${data.key}`
        setHastebinLink(link)
        showToast('Link Hastebin berhasil dibuat!', 'success')
      } else {
        throw new Error('No key returned')
      }
    } catch (error) {
      showToast('Gagal membuat link Hastebin', 'error')
    } finally {
      setHastebinLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showToast('Disalin ke clipboard!', 'success')
  }

  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && <NeoToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">📦 Kelola Stok</h1>
          <p className="text-gray-500 text-sm">Pilih produk untuk melihat stok</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm"
        >
          ➕ Tambah
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          <p className="text-xs text-gray-500">Tersedia</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.sold}</p>
          <p className="text-xs text-gray-500">Terjual</p>
        </div>
      </div>

      {/* Product Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Produk</label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value)
                setSelectedVariant('')
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Produk --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stock_count || 0} stok)
                </option>
              ))}
            </select>
          </div>
          
          {variants.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Variant</label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">-- Semua Variant --</option>
                {variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {formatPrice(v.price)} ({v.stock_count || 0})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Stock List */}
      {selectedProduct && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 p-3 flex justify-between items-center">
            <span className="font-medium text-sm">
              📋 {stocks.length} stok tersedia
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchStocksForProduct(selectedProduct, selectedVariant)}
                className="text-gray-500 hover:text-black px-2 py-1 text-sm"
                title="Refresh"
              >
                🔄
              </button>
              <button
                onClick={generateHastebinLink}
                disabled={hastebinLoading || stocks.length === 0}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {hastebinLoading ? '...' : '🔗 Hastebin'}
              </button>
            </div>
          </div>

          {/* Hastebin Link */}
          {hastebinLink && (
            <div className="bg-blue-50 border-b border-blue-100 p-3 flex items-center justify-between">
              <a 
                href={hastebinLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm truncate flex-1"
              >
                🔗 {hastebinLink}
              </a>
              <button
                onClick={() => copyToClipboard(hastebinLink)}
                className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                📋 Copy
              </button>
            </div>
          )}

          {/* Stock Items */}
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {stockLoading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : stocks.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                📦
                <p className="mt-2">Tidak ada stok</p>
              </div>
            ) : (
              stocks.map((stock, idx) => (
                <div key={stock.id} className="p-3 hover:bg-gray-50 flex items-center justify-between group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs w-6">{idx + 1}.</span>
                      <code className="text-sm truncate flex-1">{stock.data}</code>
                      <button
                        onClick={() => copyToClipboard(stock.data)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 text-xs"
                      >
                        📋
                      </button>
                    </div>
                    {stock.variant && (
                      <span className="text-xs text-purple-600 ml-8">{stock.variant.name}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(stock)}
                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 text-sm ml-2"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedProduct && !loading && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-4xl mb-2">📦</p>
          <p className="text-gray-500">Pilih produk untuk melihat stok</p>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-5">
            <h2 className="text-lg font-bold mb-4">➕ Tambah Stok</h2>

            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Produk *</label>
                <select
                  value={form.product_id}
                  onChange={(e) => {
                    setForm({ ...form, product_id: e.target.value, variant_id: '' })
                    if (e.target.value) fetchFormVariants(e.target.value)
                    else setFormVariants([])
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {form.product_id && formVariants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Variant</label>
                  <select
                    value={form.variant_id}
                    onChange={(e) => setForm({ ...form, variant_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Tanpa Variant --</option>
                    {formVariants.map(v => (
                      <option key={v.id} value={v.id}>{v.name} - {formatPrice(v.price)}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Data Stok *</label>
                <textarea
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  placeholder="email@example.com|password123&#10;email2@example.com|password456"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 font-mono text-sm resize-none"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Satu akun per baris. Format: email|password
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setForm({ product_id: '', variant_id: '', data: '' })
                    setFormVariants([])
                  }}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-5 text-center">
            <p className="text-4xl mb-3">🗑️</p>
            <h3 className="font-bold mb-2">Hapus stok ini?</h3>
            <code className="text-sm text-gray-600 block truncate mb-4">{deleteConfirm.data}</code>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
