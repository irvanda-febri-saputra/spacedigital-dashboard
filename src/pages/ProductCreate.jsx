import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import stockService from '../services/stockService'
import botProductService from '../services/botProductService'
import NeoToast from '../components/NeoToast'

// Icons
function IconPlus({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
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

function IconArrowLeft({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
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

export default function ProductCreate() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Product form
  const [form, setForm] = useState({
    product_code: '',
    name: '',
    description: '',
    category: '',
    price: '',
    image_url: '',
  })

  // Variants array
  const [variants, setVariants] = useState([])

  const addVariant = () => {
    const newVariant = {
      id: Date.now(),
      variant_code: '',
      name: '',
      price: '',
    }
    setVariants([...variants, newVariant])
  }

  const updateVariant = (id, field, value) => {
    setVariants(variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  const removeVariant = (id) => {
    setVariants(variants.filter(v => v.id !== id))
  }

  const autoGenerateVariantCode = (index, variantName) => {
    if (!form.product_code || !variantName) return ''
    return `${form.product_code}_${variantName}`.toUpperCase().replace(/\s+/g, '_')
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload
    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await botProductService.uploadImage(formData)
      if (response.url) {
        setForm({ ...form, image_url: response.url })
        showToast('Gambar berhasil diupload!', 'success')
      }
    } catch (error) {
      showToast('Gagal upload gambar', 'error')
      setImagePreview(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.product_code || !form.name) {
      showToast('Kode barang dan nama produk wajib diisi', 'error')
      return
    }

    try {
      setSaving(true)

      // Prepare product data
      const productData = {
        product_code: form.product_code,
        name: form.name,
        description: form.description,
        category: form.category,
        price: form.price || 0,
        image_url: form.image_url,
        is_active: 1,
        // Include variants as JSON for the old structure (backward compatible)
        variants: variants.map((v, idx) => ({
          id: v.id.toString(),
          variant_code: v.variant_code || autoGenerateVariantCode(idx, v.name),
          name: v.name,
          price: parseFloat(v.price) || 0,
          stock_count: 0,
        }))
      }

      // Create product first
      const productResponse = await botProductService.createProduct(productData)
      const productId = productResponse.data?.id || productResponse.id

      if (!productId) {
        throw new Error('Failed to get product ID')
      }

      // Create variants in new table
      for (const variant of variants) {
        if (variant.name) {
          await stockService.addVariant(productId, {
            variant_code: variant.variant_code || autoGenerateVariantCode(0, variant.name),
            name: variant.name,
            price: parseFloat(variant.price) || 0,
          })
        }
      }

      showToast('Produk berhasil ditambahkan!', 'success')
      
      setTimeout(() => {
        navigate('/bot-products')
      }, 1500)

    } catch (error) {
      console.error('Error creating product:', error)
      showToast(error.response?.data?.message || 'Gagal menambah produk', 'error')
    } finally {
      setSaving(false)
    }
  }

  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <NeoToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="neo-card-flat p-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-2xl">📦</span>
          Tambah Produk
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Product Info Section */}
        <div className="neo-card-flat p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Form Tambah Produk & Variant</h2>
          
          <h3 className="font-bold text-gray-700 mb-4">Informasi Produk</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Kode Barang */}
            <div>
              <label className="block text-sm font-bold mb-2">Kode Barang *</label>
              <input
                type="text"
                value={form.product_code}
                onChange={(e) => setForm({ ...form, product_code: e.target.value.toUpperCase() })}
                placeholder="Contoh: SPOT001"
                className="neo-input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Kode unik untuk produk ini</p>
            </div>

            {/* Nama Produk */}
            <div>
              <label className="block text-sm font-bold mb-2">Nama Produk *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Spotify Premium"
                className="neo-input"
                required
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi produk..."
              className="neo-input h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kategori */}
            <div>
              <label className="block text-sm font-bold mb-2">Kategori</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Contoh: Musik, Streaming, Gaming"
                className="neo-input"
              />
            </div>

            {/* Gambar */}
            <div>
              <label className="block text-sm font-bold mb-2">Gambar Produk</label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="neo-btn-secondary flex items-center gap-2"
                  disabled={uploadingImage}
                >
                  <IconImage className="w-4 h-4" />
                  {uploadingImage ? 'Uploading...' : 'Choose File'}
                </button>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-10 h-10 object-cover rounded border-2 border-black" />
                )}
                <span className="text-xs text-gray-500">Format: JPG, PNG, GIF (Max 2MB)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Variant Section */}
        <div className="neo-card-flat p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-700">Variant Produk</h3>
              <p className="text-sm text-gray-500">
                <a href="#" className="text-purple-600 hover:underline">tambahkan</a> berbagai pilihan variant dengan harga berbeda
              </p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="neo-btn-primary flex items-center gap-2"
            >
              <IconPlus className="w-4 h-4" />
              Tambah Variant
            </button>
          </div>

          {/* Variant List */}
          {variants.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <p>Belum ada variant. Klik "Tambah Variant" untuk menambahkan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={variant.id} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-purple-600">Variant #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Kode Variant */}
                    <div>
                      <label className="block text-xs font-bold mb-1">Kode Variant *</label>
                      <input
                        type="text"
                        value={variant.variant_code}
                        onChange={(e) => updateVariant(variant.id, 'variant_code', e.target.value.toUpperCase())}
                        placeholder={autoGenerateVariantCode(index, variant.name) || 'SPOT001_1M'}
                        className="neo-input text-sm py-2"
                      />
                    </div>

                    {/* Nama Variant */}
                    <div>
                      <label className="block text-xs font-bold mb-1">Nama Variant *</label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                        placeholder="1 Bulan"
                        className="neo-input text-sm py-2"
                        required
                      />
                    </div>

                    {/* Harga */}
                    <div>
                      <label className="block text-xs font-bold mb-1">Harga (Rp) *</label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                        placeholder="50000"
                        className="neo-input text-sm py-2"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/bot-products')}
            className="neo-btn-secondary flex items-center gap-2"
          >
            <IconArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <button
            type="submit"
            disabled={saving}
            className="neo-btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              'Menyimpan...'
            ) : (
              <>
                <span>💾</span>
                Simpan Produk & Variant
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
