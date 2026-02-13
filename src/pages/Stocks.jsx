import { useState, useEffect } from 'react'
import stockService from '../services/stockService'
import NeoToast from '../components/NeoToast'
import { TableRowSkeleton } from '../components/Skeleton'

// Icons
function IconPlus({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}

function IconSearch({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  )
}

function IconTrash({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  )
}

function IconEdit({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  )
}

function IconLink({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  )
}

function IconCopy({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  )
}

function IconRefresh({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"></polyline>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </svg>
  )
}

function IconPackage({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  )
}

function IconX({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [editStock, setEditStock] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false)

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
      const variantsData = response.data || response || []
      
      // Fetch stock count for each variant
      const variantsWithStock = await Promise.all(
        variantsData.map(async (variant) => {
          try {
            const stockResponse = await stockService.getStocks({
              product_id: productId,
              variant_id: variant.id,
              is_sold: false
            })
            const stockData = stockResponse.data || stockResponse || []
            return {
              ...variant,
              stock_count: Array.isArray(stockData) ? stockData.length : 0
            }
          } catch {
            return { ...variant, stock_count: 0 }
          }
        })
      )
      
      setVariants(variantsWithStock)
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
      setCurrentPage(1) // Reset pagination
      const params = { product_id: productId, is_sold: false }
      if (variantId) params.variant_id = variantId
      
      const response = await stockService.getStocks(params)
      // Handle both paginated and non-paginated responses
      const stockData = Array.isArray(response.data) ? response.data : (response.data?.data || response.data || [])
      setStocks(stockData)
      setHastebinLink('')
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
      
      if (form.product_id === selectedProduct) {
        fetchStocksForProduct(selectedProduct, selectedVariant)
      }
      fetchStats()
      fetchProducts()
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menambah stock', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStock = async (e) => {
    e.preventDefault()
    if (!editStock.data.trim()) {
      showToast('Data stock tidak boleh kosong', 'error')
      return
    }

    try {
      setSaving(true)
      await stockService.updateStock(editStock.id, { data: editStock.data })
      showToast('Stock berhasil diupdate!', 'success')
      setEditStock(null)
      fetchStocksForProduct(selectedProduct, selectedVariant)
      fetchStats()
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal update stock', 'error')
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

  const handleDeleteAll = async () => {
    try {
      await stockService.deleteAllStocks(selectedProduct, selectedVariant || null)
      showToast('Semua stock berhasil dihapus', 'success')
      setDeleteAllConfirm(false)
      fetchStocksForProduct(selectedProduct, selectedVariant)
      fetchStats()
      fetchProducts()
    } catch (error) {
      showToast('Gagal menghapus semua stock', 'error')
    }
  }

  // Generate Hastebin link via backend proxy
  const generateHastebinLink = async () => {
    if (stocks.length === 0) {
      showToast('Tidak ada stock untuk di-export', 'error')
      return
    }

    try {
      setHastebinLoading(true)
      
      const product = products.find(p => p.id == selectedProduct)
      const variant = variants.find(v => v.id == selectedVariant)
      
      let text = '═══════════════════════════════════════\n'
      text += `   STOCK: ${product?.name || 'Unknown'}`
      if (variant) text += ` - ${variant.name}`
      text += '\n═══════════════════════════════════════\n\n'
      
      stocks.forEach((stock, idx) => {
        text += `${idx + 1}. ${stock.data}\n`
      })
      
      text += '\n═══════════════════════════════════════\n'
      text += `Total: ${stocks.length} akun\n`
      text += `Generated: ${new Date().toLocaleString('id-ID')}\n`
      text += '═══════════════════════════════════════'

      // Use backend proxy to avoid CORS
      const response = await stockService.generateHastebin(text)
      
      if (response.url) {
        setHastebinLink(response.url)
        showToast('Link Hastebin berhasil dibuat!', 'success')
      } else {
        throw new Error('No URL returned')
      }
    } catch (error) {
      console.error('Hastebin error:', error)
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
    <div className="space-y-6">
      {/* Toast */}
      {toast && <NeoToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Stocks</h1>
          <p className="text-gray-600 mt-1">Kelola stok produk untuk bot Telegram</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="neo-btn-primary inline-flex items-center gap-2"
        >
          <IconPlus className="w-5 h-5" />
          Tambah Stok
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-200 border-2 border-black">
              <IconPackage className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Stok</p>
              <p className="text-2xl font-black">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-200 border-2 border-black">
              <IconPackage className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tersedia</p>
              <p className="text-2xl font-black text-green-600">{stats.available}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-200 border-2 border-black">
              <IconPackage className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Terjual</p>
              <p className="text-2xl font-black text-orange-600">{stats.sold}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selector */}
      <div className="neo-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-2">Pilih Produk</label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value)
                setSelectedVariant('')
              }}
              className="neo-input"
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
              <label className="block font-bold mb-2">Pilih Variant</label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="neo-input"
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
      {selectedProduct ? (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Header */}
          <div className="bg-primary-100 border-b-4 border-black p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <IconPackage className="w-5 h-5" />
              <span className="font-bold">{stocks.length} stok tersedia</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchStocksForProduct(selectedProduct, selectedVariant)}
                className="neo-btn-outline-primary px-3 py-2 flex items-center gap-2"
              >
                <IconRefresh className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setDeleteAllConfirm(true)}
                disabled={stocks.length === 0}
                className="neo-btn-danger px-3 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconTrash className="w-4 h-4" />
                Hapus Semua
              </button>
              <button
                onClick={generateHastebinLink}
                disabled={hastebinLoading || stocks.length === 0}
                className="neo-btn-primary px-3 py-2 flex items-center gap-2 disabled:opacity-50"
              >
                <IconLink className="w-4 h-4" />
                {hastebinLoading ? 'Loading...' : 'Hastebin'}
              </button>
            </div>
          </div>

          {/* Hastebin Link */}
          {hastebinLink && (
            <div className="bg-blue-100 border-b-4 border-black p-3 flex items-center justify-between">
              <a 
                href={hastebinLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-700 font-mono hover:underline truncate flex-1"
              >
                {hastebinLink}
              </a>
              <button
                onClick={() => copyToClipboard(hastebinLink)}
                className="ml-3 p-2 border-2 border-black bg-white hover:bg-gray-100"
              >
                <IconCopy className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Stock Items */}
          <div className="max-h-[500px] overflow-y-auto">
            {stockLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : stocks.length === 0 ? (
              <div className="p-12 text-center">
                <IconPackage className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-bold">Tidak ada stok tersedia</p>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-4 border-black">
                    <tr>
                      <th className="text-left p-3 font-bold">#</th>
                      <th className="text-left p-3 font-bold">Data</th>
                      {!selectedVariant && variants.length > 0 && (
                        <th className="text-left p-3 font-bold">Variant</th>
                      )}
                      <th className="text-right p-3 font-bold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((stock, idx) => {
                        const actualIndex = (currentPage - 1) * itemsPerPage + idx + 1
                        return (
                          <tr key={stock.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                            <td className="p-3 text-gray-500 font-mono">{actualIndex}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-gray-100 px-2 py-1 border border-gray-300 truncate max-w-xs">
                                  {stock.data}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(stock.data)}
                                  className="p-1 text-gray-400 hover:text-black"
                                >
                                  <IconCopy className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                            {!selectedVariant && variants.length > 0 && (
                              <td className="p-3">
                                {stock.variant && (
                                  <span className="bg-purple-100 border-2 border-black px-2 py-1 text-sm font-medium">
                                    {stock.variant.name}
                                  </span>
                                )}
                              </td>
                            )}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditStock(stock)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200"
                                  title="Edit Stock"
                                >
                                  <IconEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(stock)}
                                  className="p-2 text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-200"
                                  title="Hapus Stock"
                                >
                                  <IconTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
                
                {/* Pagination */}
                {stocks.length > itemsPerPage && (
                  <div className="border-t-4 border-black p-4 bg-gray-50 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, stocks.length)} dari {stocks.length} stok
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="neo-btn-secondary neo-btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(stocks.length / itemsPerPage), p + 1))}
                        disabled={currentPage >= Math.ceil(stocks.length / itemsPerPage)}
                        className="neo-btn-secondary neo-btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <IconPackage className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold mb-2">Pilih Produk</h3>
          <p className="text-gray-600">Pilih produk dari dropdown di atas untuk melihat stok</p>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="border-b-4 border-black p-4 bg-primary-100 flex justify-between items-center">
              <h2 className="text-xl font-black">Tambah Stok</h2>
              <button 
                onClick={() => {
                  setShowAddModal(false)
                  setForm({ product_id: '', variant_id: '', data: '' })
                  setFormVariants([])
                }}
                className="p-1 hover:bg-primary-200"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddStock} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-2">Produk *</label>
                <select
                  value={form.product_id}
                  onChange={(e) => {
                    setForm({ ...form, product_id: e.target.value, variant_id: '' })
                    if (e.target.value) fetchFormVariants(e.target.value)
                    else setFormVariants([])
                  }}
                  className="neo-input"
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
                  <label className="block font-bold mb-2">Variant</label>
                  <select
                    value={form.variant_id}
                    onChange={(e) => setForm({ ...form, variant_id: e.target.value })}
                    className="neo-input"
                  >
                    <option value="">-- Tanpa Variant --</option>
                    {formVariants.map(v => (
                      <option key={v.id} value={v.id}>{v.name} - {formatPrice(v.price)}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold mb-2">Data Stok *</label>
                <textarea
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  placeholder="email@example.com|password123&#10;email2@example.com|password456"
                  className="neo-input h-40 resize-none font-mono text-sm"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Satu akun per baris. Format: email|password
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setForm({ product_id: '', variant_id: '', data: '' })
                    setFormVariants([])
                  }}
                  className="neo-btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="neo-btn-primary flex-1"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg">
            <div className="border-b-4 border-black p-4 bg-blue-100 flex justify-between items-center">
              <h2 className="text-xl font-black">Edit Stok</h2>
              <button 
                onClick={() => setEditStock(null)}
                className="p-1 hover:bg-blue-200"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-2">Data Stok *</label>
                <textarea
                  value={editStock.data}
                  onChange={(e) => setEditStock({ ...editStock, data: e.target.value })}
                  placeholder="email@example.com|password123"
                  className="neo-input h-40 resize-none font-mono text-sm"
                  required
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-1">
                  Edit data akun sesuai kebutuhan
                </p>
              </div>

              <div className="bg-gray-100 border-2 border-gray-300 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1 font-bold">INFO:</p>
                {editStock.variant && (
                  <p className="text-sm text-gray-700">Variant: <span className="font-bold">{editStock.variant.name}</span></p>
                )}
                <p className="text-xs text-gray-500 mt-1">ID: {editStock.id}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditStock(null)}
                  className="neo-btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="neo-btn-primary flex-1"
                >
                  {saving ? 'Menyimpan...' : 'Update Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-6 text-center">
            <IconTrash className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-bold mb-2">Hapus Stok?</h3>
            <code className="text-sm text-gray-600 bg-gray-100 px-3 py-1 border block truncate mb-6">
              {deleteConfirm.data}
            </code>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="neo-btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="neo-btn-danger flex-1"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation */}
      {deleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg rounded-lg overflow-hidden">
            <div className="border-b-4 border-black p-6 bg-gradient-to-r from-red-100 to-pink-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-200 border-2 border-black rounded-lg">
                  <IconTrash className="w-6 h-6 text-red-700" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800">Hapus Semua Stok?</h3>
                  <p className="text-sm text-gray-600 font-medium">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 p-4 rounded-xl mb-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-black rounded-lg flex-shrink-0">
                      <IconPackage className="w-4 h-4 text-purple-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-700 text-sm mb-1">Produk yang akan dihapus:</p>
                      <p className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg font-bold text-purple-700 text-sm">
                        {products.find(p => p.id == selectedProduct)?.name}
                      </p>
                    </div>
                  </div>
                  
                  {selectedVariant && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-black rounded-lg flex-shrink-0">
                        <IconLink className="w-4 h-4 text-purple-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-700 text-sm mb-1">Variant:</p>
                        <p className="bg-purple-50 border-2 border-purple-200 px-3 py-2 rounded-lg font-bold text-purple-700 text-sm">
                          {variants.find(v => v.id == selectedVariant)?.name}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 border-2 border-black rounded-lg flex-shrink-0">
                      <IconTrash className="w-4 h-4 text-red-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-700 text-sm mb-1">Total stok yang akan terhapus:</p>
                      <p className="bg-red-50 border-2 border-red-200 px-3 py-2 rounded-lg font-black text-red-600 text-lg">
                        {stocks.length} item
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteAllConfirm(false)}
                  className="neo-btn-secondary flex-1 py-3 font-bold rounded-lg transition-all hover:scale-105"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="neo-btn-danger flex-1 py-3 font-bold rounded-lg transition-all hover:scale-105"
                >
                  Ya, Hapus Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
