import { useState, useEffect } from 'react'
import api from '../services/api'
import { IconBot, IconSearch } from '../components/Icons'
import { TableRowSkeleton } from '../components/Skeleton'

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'neo-badge-success',
    inactive: 'neo-badge-gray',
    suspended: 'bg-red-100 text-red-700 px-2.5 py-1 text-xs font-semibold rounded-full border border-red-300',
  }
  return (
    <span className={styles[status] || 'neo-badge-gray'}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  )
}

const StatCard = ({ title, value, color }) => (
  <div className="neo-card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
        <IconBot className="w-5 h-5 text-primary-500" />
      </div>
    </div>
  </div>
)

export default function AdminBots() {
  const [loading, setLoading] = useState(true)
  const [bots, setBots] = useState({ data: [], last_page: 1 })
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, transactions: 0 })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const fetchBots = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      params.append('page', page)

      const res = await api.get(`/dashboard/admin/bots?${params}`)
      setBots(res.data.bots)
      setStats(res.data.stats)
    } catch (err) {
      console.error('Error fetching bots:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBots()
  }, [page])

  const applyFilters = () => {
    setPage(1)
    fetchBots()
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPage(1)
    setTimeout(fetchBots, 0)
  }

  const handleToggleStatus = async (botId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    if (confirm(`Change bot status to ${newStatus}?`)) {
      try {
        await api.put(`/dashboard/admin/bots/${botId}/status`, { status: newStatus })
        fetchBots()
      } catch (err) {
        console.error('Error updating bot status:', err)
      }
    }
  }

  const handleDelete = async (botId, botName) => {
    if (confirm(`Delete bot "${botName}"? This action cannot be undone!`)) {
      try {
        await api.delete(`/dashboard/admin/bots/${botId}`)
        fetchBots()
      } catch (err) {
        console.error('Error deleting bot:', err)
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <IconBot className="w-6 h-6 text-primary-500" /> All Bots
        </h1>
        <p className="text-gray-500 mt-1">View and manage all bots across users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bots" value={stats.total} color="text-gray-900" />
        <StatCard title="Active" value={stats.active} color="text-green-600" />
        <StatCard title="Inactive" value={stats.inactive} color="text-gray-600" />
        <StatCard title="Total Transactions" value={stats.transactions} color="text-primary-500" />
      </div>

      {/* Filters */}
      <div className="neo-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Search</label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="Bot name or username..."
                className="neo-input pl-10"
              />
            </div>
          </div>
          <div className="w-36">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="neo-input">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={applyFilters} className="neo-btn-primary text-sm">Filter</button>
            <button onClick={clearFilters} className="neo-btn-secondary text-sm">Clear</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="neo-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Bot</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Transactions</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Created</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => <TableRowSkeleton key={i} columns={7} />)
              ) : bots.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-xl flex items-center justify-center">
                      <IconBot className="w-6 h-6 text-gray-400" />
                    </div>
                    No bots found
                  </td>
                </tr>
              ) : (
                bots.data.map((bot) => (
                  <tr key={bot.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                          <IconBot className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{bot.name}</p>
                          <p className="text-xs text-gray-500">@{bot.bot_username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{bot.user?.name}</p>
                        <p className="text-xs text-gray-500">{bot.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={bot.status} />
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {bot.transactions_count || 0}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      {formatCurrency(bot.total_revenue || 0)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {bot.created_at}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(bot.id, bot.status)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-colors ${
                            bot.status === 'active'
                              ? 'text-yellow-600 border-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 border-green-600 hover:bg-green-50'
                          }`}
                        >
                          {bot.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(bot.id, bot.name)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {bots.last_page > 1 && (
          <div className="px-4 py-3 border-t-2 border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {bots.last_page}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg text-sm font-semibold border-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(bots.last_page, p + 1))}
                disabled={page === bots.last_page}
                className="px-3 py-1 rounded-lg text-sm font-semibold border-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
