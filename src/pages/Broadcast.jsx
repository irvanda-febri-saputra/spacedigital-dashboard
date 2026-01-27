import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Broadcast() {
  const [message, setMessage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [format, setFormat] = useState('HTML')
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Fetch broadcast history on mount
  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await api.get('/dashboard/broadcast/history')
      if (res.data.success) {
        setHistory(res.data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch broadcast history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Pesan tidak boleh kosong!')
      return
    }

    setSending(true)
    try {
      const res = await api.post('/dashboard/broadcast', {
        message: message.trim(),
        image_url: imageUrl.trim() || null,
        format: format
      })

      if (res.data.success) {
        alert('Broadcast berhasil dikirim!')
        setMessage('')
        setImageUrl('')
        fetchHistory()
      } else {
        alert('Gagal mengirim broadcast: ' + (res.data.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Broadcast error:', err)
      alert('Error: ' + (err.response?.data?.message || err.message))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Broadcast</h1>
          <p className="text-gray-600">Kirim pesan ke semua user bot Telegram</p>
        </div>
      </div>

      {/* Send Broadcast Form */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          Kirim Broadcast Baru
        </h2>

        <div className="space-y-4">
          {/* Message */}
          <div>
            <label className="block text-sm font-bold mb-2">Pesan *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full border-4 border-black p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Masukkan pesan broadcast...&#10;&#10;Gunakan format HTML:&#10;<b>Bold</b> <i>Italic</i> <code>Code</code>"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-bold mb-2">URL Gambar (Opsional)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border-4 border-black p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-bold mb-2">Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="HTML"
                  checked={format === 'HTML'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="font-medium">HTML</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="Markdown"
                  checked={format === 'Markdown'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="font-medium">Markdown</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="plain"
                  checked={format === 'plain'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="font-medium">Plain Text</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {message && (
            <div>
              <label className="block text-sm font-bold mb-2">Preview</label>
              <div className="border-4 border-dashed border-gray-300 p-4 bg-gray-50 rounded">
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-w-xs max-h-48 mb-3 border-2 border-black"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div 
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: format === 'HTML' ? message : message.replace(/</g, '&lt;').replace(/>/g, '&gt;') 
                  }}
                />
              </div>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className={`w-full py-3 px-6 font-bold text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
              ${sending || !message.trim() 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
              }`}
          >
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mengirim...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Kirim Broadcast
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Riwayat Broadcast
        </h2>

        {loadingHistory ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="animate-spin h-8 w-8 mx-auto mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Memuat riwayat...
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            Belum ada riwayat broadcast
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div key={idx} className="border-2 border-gray-200 p-4 hover:border-black transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 mb-1">
                      {new Date(item.created_at).toLocaleString('id-ID')}
                    </p>
                    <p className="text-gray-800 line-clamp-2">{item.message}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold border-2 border-black
                      ${item.status === 'completed' ? 'bg-green-400' : item.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'}`}>
                      {item.status === 'completed' ? `✓ ${item.sent_count || 0} terkirim` : 
                       item.status === 'pending' ? '⏳ Mengirim...' : '✕ Gagal'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
