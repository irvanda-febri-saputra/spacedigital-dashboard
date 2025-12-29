import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Notifications() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/notifications')
      if (res.data.success) {
        setNotifications(res.data.notifications || [])
        setUnreadCount(res.data.unread_count || 0)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (id) => {
    try {
      await api.post(`/dashboard/notifications/${id}/read`)
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/dashboard/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/dashboard/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '💰'
      case 'payment': return '💳'
      case 'withdraw': return '🏦'
      case 'password': return '🔐'
      case 'warning': return '⚠️'
      case 'info': return '🤖'
      case 'system': return '🔔'
      case 'error': return '❌'
      default: return '📌'
    }
  }

  const getNotificationBg = (type) => {
    switch (type) {
      case 'success':
      case 'payment': return 'bg-green-50 border-green-200'
      case 'withdraw': return 'bg-blue-50 border-blue-200'
      case 'password': return 'bg-purple-50 border-purple-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'info': return 'bg-blue-50 border-blue-200'
      case 'system': return 'bg-purple-50 border-purple-200'
      case 'error': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="neo-btn-outline-primary text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-w-3xl">
        {loading ? (
          <div className="neo-card p-8 text-center">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full mx-auto animate-spin"></div>
            <p className="text-gray-500 mt-4">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`neo-card p-4 transition-all ${!notification.read ? 'ring-2 ring-purple-300 bg-purple-50/30' : ''}`}
              >
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2 ${getNotificationBg(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-3 h-3 rounded-full bg-purple-500 animate-pulse"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-gray-400">
                        {formatTime(notification.created_at)}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-purple-600 hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="neo-card p-12 text-center">
            <span className="text-5xl">🔔</span>
            <h3 className="text-lg font-semibold text-gray-900 mt-4">No notifications yet</h3>
            <p className="text-gray-500 mt-2">
              We'll notify you when something important happens
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
