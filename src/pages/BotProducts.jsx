import { useState, useEffect, useRef } from 'react'
import botProductService from '../services/botProductService'
import NeoToast from '../components/NeoToast'
import { TableRowSkeleton } from '../components/Skeleton'

// Local icon components
function IconPlus({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
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

function IconImage({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  )
}

export default function BotProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)
  
  // Pagination
  const [pagination, setPagination] = useState({ page: 1, total: 0, per_page: 10 })
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('product') // product, stock, variant, broadcast
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  // File upload ref
  const fileInputRef = useRef(null)

  // Product form
  const [productForm, setProductForm] = useState({
    name: '',
    product_code: '',
    description: '',
    price: '',
    category: 'Digital Product',
    terms: '',
    is_active: 1
  })

  // Stock form
  const [stockForm, setStockForm] = useState({
    variant_id: '',
    stock_data: '',
    mode: 'single', // 'single' or 'bulk'
    single_data: ''
  })

  // Variant form
  const [variantForm, setVariantForm] = useState({
    name: '',
    variant_code: '',
    price: ''
  })

  // Edit variant state
  const [editingVariant, setEditingVariant] = useState(null)

  // Broadcast form - now with image support
  const [broadcastForm, setBroadcastForm] = useState({
    message: '',
    parse_mode: 'HTML',
    target: 'all',
    image: null,
    imagePreview: null
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Minimum loading time untuk animasi terlihat
      const [response] = await Promise.all([
        botProductService.getProducts(),
        new Promise(resolve => setTimeout(resolve, 500))
      ])
      // Laravel returns paginated response: { data: [...], current_page, total, etc }
      // Or it could return { success, data } from old bot API
      if (response.success !== undefined) {
        // Old format: { success: true, data: [...] }
        setProducts(response.data || [])
      } else if (response.data) {
        // Laravel paginated format: { data: [...], current_page, ... }
        setProducts(response.data || [])
      } else if (Array.isArray(response)) {
        // Direct array response
        setProducts(response)
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setToast({ message: 'Gagal mengambil data produk. Pastikan bot berjalan.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product_code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination logic
  const paginatedProducts = filteredProducts.slice(
    (pagination.page - 1) * pagination.per_page,
    pagination.page * pagination.per_page
  )

  // Update total when filteredProducts changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, total: filteredProducts.length, page: 1 }))
  }, [searchQuery, products.length])

  // ==================== PRODUCT HANDLERS ====================
  
  const openProductModal = (product = null) => {
    setEditingProduct(product)
    setProductForm(product ? {
      name: product.name || '',
      product_code: product.product_code || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || 'Digital Product',
      terms: product.terms || '',
      is_active: product.is_active ? 1 : 0
    } : {
      name: '',
      product_code: '',
      description: '',
      price: '',
      category: 'Digital Product',
      terms: '',
      is_active: 1
    })
    setModalType('product')
    setShowModal(true)
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingProduct) {
        await botProductService.updateProduct(editingProduct.id, productForm)
        setToast({ message: 'Produk berhasil diupdate!', type: 'success' })
      } else {
        await botProductService.createProduct(productForm)
        setToast({ message: 'Produk berhasil ditambahkan!', type: 'success' })
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Gagal menyimpan produk', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (product) => {
    try {
      await botProductService.deleteProduct(product.id)
      setToast({ message: 'Produk berhasil dihapus!', type: 'success' })
      setDeleteConfirm(null)
      fetchProducts()
    } catch (err) {
      setToast({ message: 'Gagal menghapus produk', type: 'error' })
    }
  }

  // ==================== STOCK HANDLERS ====================
  
  const openStockModal = (product, variant = null) => {
    setSelectedProduct(product)
    setSelectedVariant(variant)
    setStockForm({
      variant_id: variant?.id || '',
      stock_data: '',
      mode: 'single',
      single_data: ''
    })
    setModalType('stock')
    setShowModal(true)
  }

  const handleStockSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Determine which data to send based on mode
      const dataToSend = stockForm.mode === 'single' 
        ? stockForm.single_data 
        : stockForm.stock_data

      const response = await botProductService.addStock(selectedProduct.id, {
        variant_id: stockForm.variant_id || null,
        stock_data: dataToSend
      })
      
      if (response.success) {
        setToast({ 
          message: `${response.data.added} stock ditambahkan!${response.data.duplicates > 0 ? ` (${response.data.duplicates} duplikat)` : ''}`, 
          type: 'success' 
        })
        setShowModal(false)
        fetchProducts()
      }
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Gagal menambah stock', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // ==================== VARIANT HANDLERS ====================
  
  const openVariantModal = (product, variant = null) => {
    setSelectedProduct(product)
    setEditingVariant(variant)
    setVariantForm(variant ? {
      name: variant.name || '',
      variant_code: variant.variant_code || '',
      price: variant.price || ''
    } : {
      name: '',
      variant_code: '',
      price: ''
    })
    setModalType('variant')
    setShowModal(true)
  }

  const handleVariantSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingVariant) {
        await botProductService.updateVariant(editingVariant.id, variantForm)
        setToast({ message: 'Varian berhasil diupdate!', type: 'success' })
      } else {
        await botProductService.addVariant(selectedProduct.id, variantForm)
        setToast({ message: 'Varian berhasil ditambahkan!', type: 'success' })
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Gagal menambah varian', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteVariant = async (variantId) => {
    try {
      await botProductService.deleteVariant(variantId)
      setToast({ message: 'Varian berhasil dihapus!', type: 'success' })
      fetchProducts()
    } catch (err) {
      setToast({ message: 'Gagal menghapus varian', type: 'error' })
    }
  }

  // ==================== BROADCAST HANDLERS ====================
  
  const openBroadcastModal = () => {
    setBroadcastForm({
      message: '',
      parse_mode: 'HTML',
      target: 'all',
      image: null,
      imagePreview: null
    })
    setModalType('broadcast')
    setShowModal(true)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setToast({ message: 'Ukuran gambar maksimal 10MB', type: 'error' })
        return
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        setToast({ message: 'File harus berupa gambar', type: 'error' })
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setBroadcastForm(prev => ({
          ...prev,
          image: file,
          imagePreview: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setBroadcastForm(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await botProductService.sendBroadcast({
        message: broadcastForm.message,
        parse_mode: broadcastForm.parse_mode,
        target: broadcastForm.target,
        image: broadcastForm.image
      })
      
      if (response.success) {
        setToast({ 
          message: `Broadcast terkirim ke ${response.data.sent} user!`, 
          type: 'success' 
        })
        setShowModal(false)
      }
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Gagal mengirim broadcast', type: 'error' })
    } finally {
      setSaving(false)
    }
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
      {toast && (
        <NeoToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Bot Products</h1>
          <p className="text-gray-600 mt-1">Kelola produk langsung di bot Telegram</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openBroadcastModal}
            className="neo-btn-secondary inline-flex items-center gap-2"
          >
            📢 Broadcast
          </button>
          <button
            onClick={() => openProductModal()}
            className="neo-btn-primary inline-flex items-center gap-2"
          >
            <IconPlus className="w-5 h-5" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="neo-card-flat p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neo-input pl-12"
            />
          </div>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="neo-btn-secondary inline-flex items-center gap-2"
          >
            <IconRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="neo-card-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Harga</th>
                <th className="text-center">Stock</th>
                <th>Varian</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <TableRowSkeleton cols={5} />
                  <TableRowSkeleton cols={5} />
                  <TableRowSkeleton cols={5} />
                  <TableRowSkeleton cols={5} />
                  <TableRowSkeleton cols={5} />
                </>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{product.product_code}</p>
                        {product.description && (
                          <p className="text-xs text-gray-400 truncate max-w-xs">{product.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="font-bold text-primary-500 font-mono">
                      {formatPrice(product.price)}
                    </td>
                    <td className="text-center align-middle">
                      <span className={`neo-badge-${
                        product.stock_count > 10 ? 'success' :
                        product.stock_count > 0 ? 'warning' : 'danger'
                      }`}>
                        {product.stock_count}
                      </span>
                    </td>
                    <td className="align-top">
                      {Array.isArray(product.variants) && product.variants.length > 0 ? (
                        <div className="space-y-1">
                          {(Array.isArray(product.variants) ? product.variants : []).slice(0, 3).map(v => (
                            <div key={v.id} className="flex items-center gap-2 text-xs">
                              <span className="font-medium text-gray-700 whitespace-nowrap">{v.name}</span>
                              <span className="font-mono text-primary-500 whitespace-nowrap">{formatPrice(v.price)}</span>
                              <span className="font-mono text-gray-400 whitespace-nowrap">({v.stock_count})</span>
                              <button
                                onClick={() => openStockModal(product, v)}
                                className="text-green-500 hover:text-green-700"
                                title="Add Stock"
                              >
                                <IconPlus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => openVariantModal(product, v)}
                                className="text-primary-500 hover:text-primary-700"
                                title="Edit Variant"
                              >
                                <IconEdit className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {product.variants.length > 3 && (
                            <p className="text-xs text-gray-400">+{product.variants.length - 3} lainnya</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="align-top">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openStockModal(product)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Add Stock"
                        >
                          <IconPackage className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openVariantModal(product)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Add Variant"
                        >
                          <IconPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openProductModal(product)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <IconPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Belum ada produk</p>
                    <button
                      onClick={() => openProductModal()}
                      className="neo-btn-primary neo-btn-sm inline-flex items-center gap-2"
                    >
                      <IconPlus className="w-4 h-4" />
                      Tambah Produk
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredProducts.length > pagination.per_page && (
          <div className="flex items-center justify-between p-4 border-t-2 border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
              {Math.min(pagination.page * pagination.per_page, filteredProducts.length)} of{' '}
              {filteredProducts.length} products
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="neo-btn-secondary neo-btn-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page * pagination.per_page >= filteredProducts.length}
                className="neo-btn-secondary neo-btn-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && modalType === 'product' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
              </h2>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-2">Nama Produk *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  className="neo-input"
                  placeholder="Netflix Premium 1 Bulan"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Kode Produk</label>
                <input
                  type="text"
                  value={productForm.product_code}
                  onChange={(e) => setProductForm({ ...productForm, product_code: e.target.value })}
                  className="neo-input"
                  placeholder="NETFLIX_1M (auto-generate jika kosong)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Harga</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="neo-input"
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">Kategori</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="neo-input"
                    placeholder="Digital Product"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">Deskripsi</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="neo-input"
                  placeholder="Deskripsi produk..."
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Syarat & Ketentuan</label>
                <textarea
                  value={productForm.terms}
                  onChange={(e) => setProductForm({ ...productForm, terms: e.target.value })}
                  rows={3}
                  className="neo-input"
                  placeholder="S&K yang akan ditampilkan ke pembeli..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={productForm.is_active === 1}
                  onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked ? 1 : 0 })}
                  className="w-6 h-6 border-4 border-black"
                />
                <label htmlFor="is_active" className="font-bold">Produk Aktif</label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
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
                  {saving ? 'Menyimpan...' : (editingProduct ? 'Update' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {showModal && modalType === 'stock' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-xl font-bold text-gray-900">
                Add Stock - {selectedProduct?.name}
                {selectedVariant && ` (${selectedVariant.name})`}
              </h2>
            </div>
            <form onSubmit={handleStockSubmit} className="p-6 space-y-4">
              {selectedProduct?.variants?.length > 0 && !selectedVariant && (
                <div>
                  <label className="block font-bold mb-2">Pilih Varian</label>
                  <select
                    value={stockForm.variant_id}
                    onChange={(e) => setStockForm({ ...stockForm, variant_id: e.target.value })}
                    className="neo-input"
                  >
                    <option value="">Tanpa Varian (Produk Utama)</option>
                    {selectedProduct.variants.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mode Toggle */}
              <div>
                <label className="block font-bold mb-2">Mode Input</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStockForm({ ...stockForm, mode: 'single' })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                      stockForm.mode === 'single' 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Satuan
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockForm({ ...stockForm, mode: 'bulk' })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                      stockForm.mode === 'bulk' 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Bulk
                  </button>
                </div>
              </div>

              {/* Single Mode Input */}
              {stockForm.mode === 'single' && (
                <div>
                  <label className="block font-bold mb-2">Data Stock</label>
                  <p className="text-sm text-gray-500 mb-2">
                    Format: email|password atau sesuai format produk
                  </p>
                  <input
                    type="text"
                    value={stockForm.single_data}
                    onChange={(e) => setStockForm({ ...stockForm, single_data: e.target.value })}
                    className="neo-input font-mono"
                    placeholder="user@email.com|password123"
                    required
                  />
                </div>
              )}

              {/* Bulk Mode Input */}
              {stockForm.mode === 'bulk' && (
                <>
                  <div>
                    <label className="block font-bold mb-2">Stock Data (Bulk)</label>
                    <p className="text-sm text-gray-500 mb-2">
                      Masukkan 1 akun per baris. Format: email|password atau data lainnya
                    </p>
                    <textarea
                      value={stockForm.stock_data}
                      onChange={(e) => setStockForm({ ...stockForm, stock_data: e.target.value })}
                      rows={10}
                      className="neo-input font-mono text-sm"
                      placeholder="user1@email.com|password123&#10;user2@email.com|password456&#10;user3@email.com|password789"
                      required
                    />
                  </div>

                  <div className="text-sm text-gray-500">
                    Jumlah: <strong>{stockForm.stock_data.split('\n').filter(s => s.trim()).length}</strong> item
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
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
                  {saving ? 'Menambahkan...' : 'Tambah Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {showModal && modalType === 'variant' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingVariant ? 'Edit Varian' : 'Tambah Varian'} - {selectedProduct?.name}
              </h2>
            </div>
            <form onSubmit={handleVariantSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-2">Nama Varian *</label>
                <input
                  type="text"
                  value={variantForm.name}
                  onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                  required
                  className="neo-input"
                  placeholder="1 Bulan / 3 Bulan / 1 Tahun"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Harga Varian *</label>
                <input
                  type="number"
                  value={variantForm.price}
                  onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                  required
                  className="neo-input"
                  placeholder="25000"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
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
                  {saving ? 'Menyimpan...' : (editingVariant ? 'Update Varian' : 'Tambah Varian')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showModal && modalType === 'broadcast' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-xl font-bold text-gray-900">Broadcast Message</h2>
            </div>
            <form onSubmit={handleBroadcastSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-2">Target</label>
                <select
                  value={broadcastForm.target}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, target: e.target.value })}
                  className="neo-input"
                >
                  <option value="all">Semua User</option>
                  <option value="active">User Aktif (7 hari terakhir)</option>
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block font-bold mb-2">Gambar Banner (Opsional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {broadcastForm.imagePreview ? (
                  <div className="relative">
                    <img 
                      src={broadcastForm.imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-gray-50 transition-colors"
                  >
                    <IconImage className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Klik untuk upload gambar</span>
                    <span className="text-xs text-gray-400">Max 10MB (JPG, PNG, GIF)</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block font-bold mb-2">
                  {broadcastForm.image ? 'Caption' : 'Pesan'}
                </label>
                <textarea
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  rows={8}
                  className="neo-input font-mono text-sm"
                  placeholder={`<b>📢 BROADCAST MESSAGE<b>

Selamat pagi/siang/sore/malam 

update stock terbaru dari kami:
✅ Spotify Premium
✅ YouTube Premium

klik no dibawah untuk melihat produk

Hubungi admin untuk info lebih lanjut!`}
                  required={!broadcastForm.image}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Support HTML: &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;code&gt;code&lt;/code&gt;, &lt;a href=""&gt;link&lt;/a&gt;
                </p>
              </div>

              <div>
                <label className="block font-bold mb-2">Format</label>
                <select
                  value={broadcastForm.parse_mode}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, parse_mode: e.target.value })}
                  className="neo-input"
                >
                  <option value="HTML">HTML</option>
                  <option value="Markdown">Markdown</option>
                </select>
              </div>

              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4">
                <p className="text-sm font-bold text-yellow-800">
                  ⚠️ Pesan akan dikirim ke {broadcastForm.target === 'all' ? 'semua' : 'user aktif'}. Pastikan sudah benar!
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="neo-btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || (!broadcastForm.message && !broadcastForm.image)}
                  className="neo-btn-primary flex-1 disabled:opacity-50"
                >
                  {saving ? 'Mengirim...' : 'Kirim Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-xl font-bold text-gray-900">Hapus Produk</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Apakah Anda yakin ingin menghapus produk <strong>{deleteConfirm.name}</strong>?
              </p>
              <p className="text-red-500 text-sm mb-6">
                Semua stock dan varian akan ikut terhapus!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="neo-btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDeleteProduct(deleteConfirm)}
                  className="neo-btn-primary bg-red-500 hover:bg-red-600 flex-1"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
