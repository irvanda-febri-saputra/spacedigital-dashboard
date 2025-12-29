import { useState, useEffect } from 'react'
import api from '../services/api'
import { IconUsers, IconSearch } from '../components/Icons'
import { TableRowSkeleton } from '../components/Skeleton'
import { useAuthStore } from '../store/authStore'

const StatusBadge = ({ status }) => {
  const colors = {
    active: 'neo-badge-success',
    pending: 'bg-yellow-100 text-yellow-700 px-2.5 py-1 text-xs font-medium rounded-full',
    suspended: 'bg-red-100 text-red-700 px-2.5 py-1 text-xs font-medium rounded-full',
  }
  return (
    <span className={colors[status] || 'neo-badge-gray'}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  )
}

const RoleBadge = ({ role }) => {
  const colors = {
    super_admin: 'bg-purple-100 text-purple-700 px-2.5 py-1 text-xs font-medium rounded-full',
    user: 'bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium rounded-full',
  }
  const labels = {
    super_admin: 'Super Admin',
    user: 'User',
  }
  return <span className={colors[role]}>{labels[role]}</span>
}

const StatCard = ({ title, value, color }) => (
  <div className="neo-card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
        <IconUsers className="w-5 h-5 text-primary-500" />
      </div>
    </div>
  </div>
)

export default function AdminUsers() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState({ data: [], last_page: 1 })
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, suspended: 0 })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const { user: currentUser } = useAuthStore()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      if (role) params.append('role', role)
      params.append('page', page)

      const res = await api.get(`/dashboard/admin/users?${params}`)
      setUsers(res.data.users)
      setStats(res.data.stats)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  const applyFilters = () => {
    setPage(1)
    fetchUsers()
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setRole('')
    setPage(1)
    setTimeout(fetchUsers, 0)
  }

  const handleApprove = async (userId) => {
    try {
      await api.post(`/dashboard/admin/users/${userId}/approve`)
      fetchUsers()
    } catch (err) {
      console.error('Error approving user:', err)
    }
  }

  const handleSuspend = async (userId) => {
    try {
      await api.post(`/dashboard/admin/users/${userId}/suspend`)
      fetchUsers()
    } catch (err) {
      console.error('Error suspending user:', err)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/dashboard/admin/users/${userId}/role`, { role: newRole })
      fetchUsers()
    } catch (err) {
      console.error('Error updating role:', err)
    }
  }

  const handleDelete = async (userId, userName) => {
    if (confirm(`Delete user "${userName}"? This action cannot be undone!`)) {
      try {
        await api.delete(`/dashboard/admin/users/${userId}`)
        fetchUsers()
      } catch (err) {
        console.error('Error deleting user:', err)
      }
    }
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <IconUsers className="w-6 h-6 text-primary-500" /> User Management
        </h1>
        <p className="text-gray-500 mt-1">Manage users, approve registrations, and assign roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.total} color="text-gray-900" />
        <StatCard title="Active" value={stats.active} color="text-green-600" />
        <StatCard title="Pending" value={stats.pending} color="text-yellow-600" />
        <StatCard title="Suspended" value={stats.suspended} color="text-red-600" />
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
                placeholder="Name or email..."
                className="neo-input pl-10"
              />
            </div>
          </div>
          <div className="w-36">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="neo-input">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="w-36">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="neo-input">
              <option value="">All</option>
              <option value="super_admin">Super Admin</option>
              <option value="user">User</option>
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
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Bots</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => <TableRowSkeleton key={i} columns={6} />)
              ) : users.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-xl flex items-center justify-center">
                      <IconUsers className="w-6 h-6 text-gray-400" />
                    </div>
                    No users found
                  </td>
                </tr>
              ) : (
                users.data.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/7.x/${user.avatar_style || 'bottts'}/svg?seed=${user.avatar_seed || user.email}&backgroundColor=8B5CF6`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full border-2 border-gray-200 bg-purple-50"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{user.bots_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.created_at}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 'pending' && (
                          <button onClick={() => handleApprove(user.id)} className="px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded">
                            Approve
                          </button>
                        )}
                        {user.status === 'active' && user.id !== currentUser?.id && (
                          <button onClick={() => handleSuspend(user.id)} className="px-2 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded">
                            Suspend
                          </button>
                        )}
                        {user.status === 'suspended' && (
                          <button onClick={() => handleApprove(user.id)} className="px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded">
                            Reactivate
                          </button>
                        )}
                        {user.id !== currentUser?.id && (
                          <>
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="user">User</option>
                              <option value="super_admin">Admin</option>
                            </select>
                            <button onClick={() => handleDelete(user.id, user.name)} className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {users.last_page > 1 && (
          <div className="px-4 py-3 border-t-2 border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {users.last_page}
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
                onClick={() => setPage(p => Math.min(users.last_page, p + 1))}
                disabled={page === users.last_page}
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
