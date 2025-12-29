import { useState, useEffect, useRef } from 'react'
import { IconTransaction, IconSearch, IconRefresh } from '../components/Icons'
import { TableRowSkeleton } from '../components/Skeleton'
import { transactionService } from '../services/transactionService'
import { formatCurrency, formatDate } from '../lib/utils'
import { cn } from '../lib/utils'

const statusColors = {
  pending: 'neo-badge-warning',
  success: 'neo-badge-success',
  expired: 'neo-badge-gray',
  failed: 'neo-badge-danger',
  cancelled: 'neo-badge-gray',
}

const AUTO_REFRESH_INTERVAL = 10000 // 10 seconds

export default function Transactions() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, total: 0, per_page: 20 })
  const intervalRef = useRef(null)

  const fetchTransactions = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await transactionService.getAll({
        page: pagination.page,
        search,
        status: statusFilter,
      })
      setTransactions(data.data || [])
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        per_page: data.per_page || 20,
      }))
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Auto-refresh in background
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchTransactions(true) // silent refresh
    }, AUTO_REFRESH_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [pagination.page, statusFilter])

  useEffect(() => {
    fetchTransactions()
  }, [pagination.page, statusFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchTransactions()
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-1">View all payment transactions</p>
        </div>
        <button onClick={() => fetchTransactions()} className="neo-btn-secondary">
          <IconRefresh className={cn("w-4 h-4 mr-2 inline", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="neo-card-flat p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neo-input pl-10"
              placeholder="Search by invoice or reference..."
            />
          </form>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="neo-select w-full md:w-48"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="expired">Expired</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="neo-card-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Gateway</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                </>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <span className="font-mono text-sm text-primary-600 font-medium">
                        {tx.order_id || tx.invoice_id || '-'}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{tx.product_name || '-'}</p>
                        <p className="text-xs text-gray-500">{tx.bot?.name || '-'}</p>
                      </div>
                    </td>
                    <td className="font-bold text-primary-500">
                      {formatCurrency(tx.amount || tx.total_price || 0)}
                    </td>
                    <td>
                      <span className={cn(statusColors[tx.status] || 'neo-badge-gray')}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="text-gray-600">
                      {tx.gateway?.name || tx.payment_gateway || '-'}
                    </td>
                    <td className="text-sm text-gray-500">
                      {formatDate(tx.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <IconTransaction className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.total > pagination.per_page && (
          <div className="flex items-center justify-between p-4 border-t-2 border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
              {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total} results
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
                disabled={pagination.page * pagination.per_page >= pagination.total}
                className="neo-btn-secondary neo-btn-sm disabled:opacity-50"
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
