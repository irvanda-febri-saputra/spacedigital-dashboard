import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { IconBot, IconPlus, IconSearch } from '../components/Icons'
import { BotCardSkeleton } from '../components/Skeleton'
import { botService } from '../services/botService'
import NeoToast from '../components/NeoToast'

const StatusBadge = ({ status }) => {
  const colors = {
    active: 'neo-badge-success',
    inactive: 'neo-badge-gray',
    suspended: 'neo-badge-danger',
  }
  return (
    <span className={colors[status] || colors.inactive}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  )
}

export default function Bots() {
  const [loading, setLoading] = useState(true)
  const [bots, setBots] = useState([])
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const fetchBots = async () => {
    try {
      const data = await botService.getAll()
      setBots(data || [])
    } catch (error) {
      console.error('Error fetching bots:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBots()
    
    // Check for success message from navigation state
    if (location.state?.message) {
      setToast({ message: location.state.message, type: 'success' })
      // Clear the state so toast doesn't show again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleDelete = async (botId, botName) => {
    if (confirm(`Are you sure you want to delete "${botName}"?`)) {
      try {
        await botService.delete(botId)
        fetchBots()
      } catch (error) {
        console.error('Error deleting bot:', error)
      }
    }
  }

  const filteredBots = bots.filter((bot) =>
    bot.name?.toLowerCase().includes(search.toLowerCase()) ||
    bot.bot_username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in">
      {/* Toast Notification */}
      {toast && (
        <NeoToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">My Bots</h1>
          <p className="text-gray-500 mt-1">Manage your Telegram bots</p>
        </div>
        <Link to="/bots/create" className="neo-btn-primary">
          <IconPlus className="w-4 h-4 mr-2 inline" />
          Add New Bot
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="neo-input pl-10"
          placeholder="Search bots..."
        />
      </div>

      {/* Bots Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <BotCardSkeleton />
          <BotCardSkeleton />
          <BotCardSkeleton />
        </div>
      ) : filteredBots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBots.map((bot) => (
            <div key={bot.id} className="neo-card overflow-hidden">
              {/* Card Header */}
              <div className="p-6 border-b-2 border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center">
                      <IconBot className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{bot.name}</h3>
                      {bot.bot_username && (
                        <p className="text-sm text-gray-500">@{bot.bot_username}</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={bot.status} />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">Bot ID</span>
                  <span className="text-sm font-mono font-bold text-primary-500 bg-white px-2 py-1 rounded border border-primary-500/30">
                    #{bot.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">Gateway</span>
                  {bot.active_gateway ? (
                    <div className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded-lg">
                      {bot.active_gateway.logo && (
                        <img
                          src={bot.active_gateway.logo}
                          alt={bot.active_gateway.name}
                          className="w-4 h-4 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {bot.active_gateway.name}
                      </span>
                    </div>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg">
                      Not Configured
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">Token</span>
                  <span className="text-sm font-mono text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                    {bot.masked_token || '••••••••'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">Created</span>
                  <span className="text-sm text-gray-600">{bot.created_at || '-'}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-white border-t-2 border-gray-100 flex justify-end gap-2">
                <Link
                  to={`/bots/${bot.id}/edit`}
                  className="neo-btn-outline-primary"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(bot.id, bot.name)}
                  className="neo-btn-outline-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="neo-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
            <IconBot className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {search ? 'No bots found' : 'No bots yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {search ? 'Try a different search term' : 'Create your first bot to get started'}
          </p>
          {!search && (
            <Link to="/bots/create" className="neo-btn-primary">
              Create Bot
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
