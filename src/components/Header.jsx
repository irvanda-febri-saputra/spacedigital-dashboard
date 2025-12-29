import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import {
    IconBell,
    IconUser,
    IconSettings,
    IconLogout,
    IconMenu,
    IconChevronDown,
} from './Icons'

export default function Header({ onMenuClick }) {
    const { user, logout } = useAuthStore()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/dashboard/notifications?limit=5')
            if (res.data.success) {
                setNotifications(res.data.notifications || [])
                setUnreadCount(res.data.unread_count || 0)
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err)
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

    const handleLogout = async () => {
        await logout()
        window.location.href = '/login'
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
            case 'payment': return '💰'
            case 'withdraw': return '🏦'
            case 'password': return '🔐'
            case 'warning': return '⚠️'
            default: return '🔔'
        }
    }

    const formatTime = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const getAvatarUrl = () => {
        if (user?.avatar_seed && user?.avatar_style) {
            return `https://api.dicebear.com/7.x/${user.avatar_style}/svg?seed=${user.avatar_seed}&backgroundColor=8B5CF6`
        }
        return null
    }

    return (
        <header className="neo-header flex items-center justify-between">
            {/* Mobile menu button */}
            <button
                onClick={onMenuClick}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 lg:hidden"
            >
                <IconMenu className="h-6 w-6" />
            </button>

            {/* Search or spacer */}
            <div className="flex-1" />

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setNotifDropdownOpen(!notifDropdownOpen)
                            setDropdownOpen(false)
                        }}
                        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <IconBell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {notifDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setNotifDropdownOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-80 neo-card z-50 overflow-hidden">
                                <div className="p-3 border-b-2 border-gray-100 flex items-center justify-between bg-gray-50">
                                    <span className="font-bold text-gray-900">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => !notif.read && markAsRead(notif.id)}
                                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-purple-50/50' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{formatTime(notif.created_at)}</p>
                                                    </div>
                                                    {!notif.read && (
                                                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-gray-500">
                                            <span className="text-3xl block mb-2">🔔</span>
                                            No notifications yet
                                        </div>
                                    )}
                                </div>
                                <Link
                                    to="/notifications"
                                    onClick={() => setNotifDropdownOpen(false)}
                                    className="block p-3 text-center text-sm text-purple-600 font-medium hover:bg-gray-50 border-t-2 border-gray-100"
                                >
                                    View all notifications
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setDropdownOpen(!dropdownOpen)
                            setNotifDropdownOpen(false)
                        }}
                        className="flex items-center gap-3 pl-3 border-l-2 border-gray-200"
                    >
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500">
                                {user?.role === 'super_admin' ? 'Super Admin' : 'User'}
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-0.5 translate-y-0.5"></div>
                            {getAvatarUrl() ? (
                                <img
                                    src={getAvatarUrl()}
                                    alt="Avatar"
                                    className="relative w-9 h-9 bg-[#8B5CF6]/10 rounded-lg border-2 border-gray-900"
                                />
                            ) : (
                                <div className="relative w-9 h-9 bg-[#8B5CF6] rounded-lg border-2 border-gray-900 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <IconChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setDropdownOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 neo-card p-2 z-50">
                                <Link
                                    to="/profile"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <IconUser className="h-4 w-4" />
                                    My Profile
                                </Link>
                                <Link
                                    to="/settings"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <IconSettings className="h-4 w-4" />
                                    Settings
                                </Link>
                                <hr className="my-1 border-gray-200" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <IconLogout className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
