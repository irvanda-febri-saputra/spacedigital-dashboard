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

function IconPackage({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
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

function IconX({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

export default function Stocks() {
  const [stocks, setStocks] = useState([])
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)
  const [stats, setStats] = useState({ total: 0, available: 0, sold: 0 })

  // Filters
  const [filterProduct, setFilterProduct] = useState('')
  const [filterVariant, setFilterVariant] = useState('')
  const [filterStatus, setFilterStatus] = useState('') // '', 'available', 'sold'

  // Pagination
  const [pagination, setPagination] = useState({ page: 1, total: 0, per_page: 20 })

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Form
  const [form, setForm] = useState({
    product_id: '',
    variant_id: '',
    data: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchStocks()
    fetchStats()
  }, [])

  useEffect(() => {
    if (filterProduct) {
      fetchVariantsForProduct(filterProduct)
    } else {
      setVariants([])
      setFilterVariant('')
    }
  }, [filterProduct])

  const fetchProducts = async () => {
    try {
      const response = await stockService.getProducts()
      // Handle different response formats
      if (response.data) {
        setProducts(response.data)
      } else if (Array.isArray(response)) {
        setProducts(response)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const fetchVariantsForProduct = async (productId) => {
    try {
      const response = await stockService.getProductVariants(productId)
      if (response.data) {
        setVariants(response.data)
      } else if (Array.isArray(response)) {
        setVariants(response)
      }
    } catch (error) {
      console.error('Failed to fetch variants:', error)
      setVariants([])
    }
  }

  const fetchStocks = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filterProduct) params.product_id = filterProduct
      if (filterVariant) params.variant_id = filterVariant
      if (filterStatus === 'available') params.is_sold = false
      if (filterStatus === 'sold') params.is_sold = true
      if (searchQuery) params.search = searchQuery

      const [response] = await Promise.all([
        stockService.getStocks(params),
        new Promise(resolve => setTimeout(resolve, 300))
      ])

      if (response.data) {
        setStocks(response.data)
        setPagination({
          page: response.current_page || 1,
          total: response.total || response.data.length,
          per_page: response.per_page || 20
        })
      } else if (Array.isArray(response)) {
        setStocks(response)
      }
    } catch (error) {
      showToast('Gagal memuat stock', 'error')
    } finally {
      setLoading(false)
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

  const handleSearch = (e) => {
    e.preventDefault()
    fetchStocks()
  }

  const handleFilter = () => {
    fetchStocks()
  }

  const openAddModal = () => {
    setForm({ product_id: '', variant_id: '', data: '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.product_id || !form.data.trim()) {
      showToast('Pilih produk dan isi data stock', 'error')
      return
    }

    try {
      setSaving(true)
      await stockService.addStock(form)
      showToast('Stock berhasil ditambahkan!', 'success')
      setShowModal(false)
      fetchStocks()
      fetchStats()
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
      fetchStocks()
      fetchStats()
    } catch (error) {
      showToast('Gagal menghapus stock', 'error')
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6">
      {/* Toast */}
      {toast && (
        <NeoToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kelola Stok</h1>
          <p className="text-gray-600">Kelola stok produk untuk bot Telegram</p>
        </div>
        <button
          onClick={openAddModal}
          className="neo-btn-primary flex items-center gap-2"
        >
          <IconPlus className="w-5 h-5" />
          Tambah Stok
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="neo-card-flat p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg border-2 border-black">
              <IconPackage className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Stok</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="neo-card-flat p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg border-2 border-black">
              <IconPackage className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tersedia</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
          </div>
        </div>
        <div className="neo-card-flat p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg border-2 border-black">
              <IconPackage className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Terjual</p>
              <p className="text-2xl font-bold text-orange-600">{stats.sold}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="neo-card-flat p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Product Filter */}
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="neo-select"
          >
            <option value="">Semua Produk</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Variant Filter */}
          <select
            value={filterVariant}
            onChange={(e) => setFilterVariant(e.target.value)}
            className="neo-select"
            disabled={!filterProduct}
          >
            <option value="">Semua Variant</option>
            {variants.map(v => (
              <option key={v.id} value={v.id}>{v.name} - {formatPrice(v.price)}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="neo-select"
          >
            <option value="">Semua Status</option>
            <option value="available">Tersedia</option>
            <option value="sold">Terjual</option>
          </select>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari data stok..."
              className="neo-input flex-1"
            />
          </form>

          {/* Filter Button */}
          <button
            onClick={handleFilter}
            className="neo-btn-secondary flex items-center justify-center gap-2"
          >
            <IconSearch className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="neo-card-flat overflow-hidden">
        <table className="neo-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Produk</th>
              <th>Variant</th>
              <th>Detail Stok</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRowSkeleton key={i} columns={7} />
              ))
            ) : stocks.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  <IconPackage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada stok</p>
                </td>
              </tr>
            ) : (
              stocks.map((stock, idx) => (
                <tr key={stock.id}>
                  <td className="font-mono text-sm">{idx + 1}</td>
                  <td className="font-medium">{stock.product?.name || '-'}</td>
                  <td>
                    {stock.variant ? (
                      <span className="neo-badge-purple">
                        {stock.variant.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="font-mono text-sm max-w-xs truncate" title={stock.data}>
                    {stock.data}
                  </td>
                  <td>
                    {stock.is_sold ? (
                      <span className="neo-badge-warning">Terjual</span>
                    ) : (
                      <span className="neo-badge-success">Tersedia</span>
                    )}
                  </td>
                  <td className="text-sm text-gray-600">
                    {formatDate(stock.created_at)}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirm(stock)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="neo-card-flat w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tambah Stok</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-sm font-bold mb-2">Pilih Produk *</label>
                <select
                  value={form.product_id}
                  onChange={(e) => {
                    setForm({ ...form, product_id: e.target.value, variant_id: '' })
                    if (e.target.value) fetchVariantsForProduct(e.target.value)
                  }}
                  className="neo-select"
                  required
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.product_code})</option>
                  ))}
                </select>
              </div>

              {/* Variant Select */}
              <div>
                <label className="block text-sm font-bold mb-2">Pilih Variant</label>
                <select
                  value={form.variant_id}
                  onChange={(e) => setForm({ ...form, variant_id: e.target.value })}
                  className="neo-select"
                  disabled={!form.product_id || variants.length === 0}
                >
                  <option value="">-- Tanpa Variant --</option>
                  {variants.map(v => (
                    <option key={v.id} value={v.id}>{v.name} - {formatPrice(v.price)}</option>
                  ))}
                </select>
                {form.product_id && variants.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Produk ini tidak memiliki variant</p>
                )}
              </div>

              {/* Stock Data */}
              <div>
                <label className="block text-sm font-bold mb-2">Detail Stok *</label>
                <textarea
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  placeholder="email@example.com|password123&#10;email2@example.com|password456"
                  className="neo-input h-32 resize-none font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: email|password (satu per baris untuk bulk)
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="neo-card-flat w-full max-w-md p-6 text-center">
            <IconTrash className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-bold mb-2">Hapus Stok?</h3>
            <p className="text-gray-600 mb-4 font-mono text-sm truncate">
              {deleteConfirm.data}
            </p>
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
    </div>
  )
}
