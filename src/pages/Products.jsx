import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import productService from '../services/productService'
import { botService } from '../services/botService'

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

export default function Products() {
  const [products, setProducts] = useState([])
  const [bots, setBots] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBot, setSelectedBot] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    bot_id: '',
    name: '',
    description: '',
    price: '',
    stock: -1,
    category: '',
    variants: [],
    image_url: '',
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    fetchData()
  }, [selectedBot])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, botsRes] = await Promise.all([
        productService.getProducts({ bot_id: selectedBot || undefined }),
        botService.getAll()
      ])
      // Handle both paginated and non-paginated responses
      const productData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.data || productsRes.data || [])
      setProducts(productData)
      setBots(botsRes.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData({
      bot_id: selectedBot || (bots[0]?.id || ''),
      name: '',
      description: '',
      price: '',
      stock: -1,
      category: '',
      variants: [],
      image_url: '',
      is_active: true,
      sort_order: 0
    })
    setError('')
    setShowModal(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      bot_id: product.bot_id || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock ?? -1,
      category: product.category || '',
      variants: product.variants || [],
      image_url: product.image_url || '',
      is_active: product.is_active ?? true,
      sort_order: product.sort_order || 0
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || -1,
        sort_order: parseInt(formData.sort_order) || 0
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload)
      } else {
        await productService.createProduct(payload)
      }

      setShowModal(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product) => {
    try {
      await productService.deleteProduct(product.id)
      setDeleteConfirm(null)
      fetchData()
    } catch (err) {
      console.error('Error deleting product:', err)
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Products</h1>
          <p className="text-gray-600 mt-1">Kelola produk yang dijual melalui bot</p>
        </div>
        <button
          onClick={openCreateModal}
          className="neo-btn-primary inline-flex items-center gap-2"
        >
          <IconPlus className="w-5 h-5" />
          Tambah Produk
        </button>
      </div>

      {/* Filters */}
      <div className="neo-card p-4">
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
          <select
            value={selectedBot}
            onChange={(e) => setSelectedBot(e.target.value)}
            className="neo-input"
          >
            <option value="">Semua Bot</option>
            {bots.map(bot => (
              <option key={bot.id} value={bot.id}>{bot.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border-4 border-black p-6 animate-pulse">
              <div className="h-40 bg-gray-200 mb-4"></div>
              <div className="h-6 bg-gray-200 mb-2"></div>
              <div className="h-4 bg-gray-200 w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold mb-2">Belum ada produk</h3>
          <p className="text-gray-600 mb-6">Mulai tambahkan produk untuk dijual melalui bot Anda</p>
          <button
            onClick={openCreateModal}
            className="neo-btn-primary inline-flex items-center gap-2"
          >
            <IconPlus className="w-5 h-5" />
            Tambah Produk Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
              {/* Product Image */}
              <div className="aspect-video bg-gray-100 relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📦
                  </div>
                )}
                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-3 py-1 border-2 border-black font-bold text-sm ${
                  product.is_active ? 'bg-green-300' : 'bg-gray-300'
                }`}>
                  {product.is_active ? 'Aktif' : 'Nonaktif'}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg line-clamp-2">{product.name}</h3>
                </div>

                {product.category && (
                  <span className="inline-block bg-blue-100 border-2 border-black px-2 py-0.5 text-sm font-medium mb-2">
                    {product.category}
                  </span>
                )}

                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {product.description || 'Tidak ada deskripsi'}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-black text-green-600">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    Stok: {product.stock === -1 ? '∞' : product.stock}
                  </span>
                </div>

                {/* Bot Name */}
                <div className="text-xs text-gray-500 mb-4 border-t border-gray-200 pt-3">
                  Bot: <span className="font-medium">{product.bot?.name || '-'}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="neo-btn-outline-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <IconEdit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product)}
                    className="neo-btn-outline-danger flex items-center justify-center gap-2"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b-4 border-black p-4 bg-yellow-300">
              <h2 className="text-xl font-black">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-100 border-4 border-red-500 p-4 font-bold text-red-700">
                  {error}
                </div>
              )}

              {/* Bot Selection */}
              <div>
                <label className="block font-bold mb-2">Bot *</label>
                <select
                  value={formData.bot_id}
                  onChange={(e) => setFormData({ ...formData, bot_id: e.target.value })}
                  required
                  className="neo-input"
                >
                  <option value="">Pilih Bot</option>
                  {bots.map(bot => (
                    <option key={bot.id} value={bot.id}>{bot.name}</option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block font-bold mb-2">
                  Nama Produk *
                  {editingProduct && (
                    <span className="text-sm font-normal text-red-600 ml-2">
                      (Tidak dapat diubah)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={!!editingProduct}
                  placeholder="Nama produk"
                  className={`neo-input ${editingProduct ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {editingProduct && (
                  <p className="text-xs text-gray-600 mt-1">
                    💡 Tip: Untuk mengubah nama, hapus produk dan buat ulang
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Deskripsi produk"
                  className="neo-input"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Harga (Rp) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    placeholder="10000"
                    className="neo-input"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">Stok (-1 = Unlimited)</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    min="-1"
                    placeholder="-1"
                    className="neo-input"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold mb-2">Kategori</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Contoh: Pulsa, Paket Data, Voucher"
                  className="neo-input"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold mb-2">URL Gambar</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="neo-input"
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="block font-bold mb-2">Urutan</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  min="0"
                  placeholder="0"
                  className="neo-input"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-6 h-6 border-4 border-black"
                />
                <label htmlFor="is_active" className="font-bold">Produk Aktif</label>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t-4 border-black">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="neo-btn-outline-primary flex-1"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
            <div className="border-b-4 border-black p-4 bg-red-400">
              <h2 className="text-xl font-black">Hapus Produk</h2>
            </div>
            <div className="p-6">
              <p className="text-lg mb-6">
                Apakah Anda yakin ingin menghapus produk <strong>{deleteConfirm.name}</strong>?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="neo-btn-outline-primary flex-1"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="neo-btn-outline-danger flex-1"
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
