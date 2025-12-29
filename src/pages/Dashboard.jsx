import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { IconBot, IconChart, IconWallet, IconCheckCircle } from '../components/Icons'
import { StatCardSkeleton, BotCardSkeleton } from '../components/Skeleton'
import { botService } from '../services/botService'
import { transactionService } from '../services/transactionService'

const ProjectCard = ({ project }) => (
    <div className="neo-card overflow-hidden">
        <div className="p-6 border-b-2 border-gray-100">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                        <IconBot className="w-6 h-6 text-[#8B5CF6]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-500">@{project.bot_username || 'Not connected'}</p>
                    </div>
                </div>
                <span className={project.status === 'active' ? 'neo-badge-success' : 'neo-badge-gray'}>
                    {project.status}
                </span>
            </div>
        </div>
        <div className="p-6 bg-gray-50 space-y-3">
            <div className="flex justify-between">
                <span className="text-sm text-gray-500">Transactions</span>
                <span className="font-bold text-gray-900">{project.transactions_count || 0}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm text-gray-500">Revenue</span>
                <span className="font-bold text-[#8B5CF6]">
                    Rp {Math.floor(project.total_revenue || 0).toLocaleString('id-ID')}
                </span>
            </div>
        </div>
        <div className="px-6 py-4 border-t-2 border-gray-100 flex justify-end">
            <Link
                to={`/bots/${project.id}/edit`}
                className="text-sm font-semibold text-[#8B5CF6] hover:underline"
            >
                Manage →
            </Link>
        </div>
    </div>
)

const QuickStat = ({ label, value, icon: Icon, color = "text-[#8B5CF6]" }) => (
    <div className="neo-stat-card">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-500 uppercase">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    </div>
)

export default function Dashboard() {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [bots, setBots] = useState([])
    const [stats, setStats] = useState({
        totalBots: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        pendingTransactions: 0,
    })
    const [recentTransactions, setRecentTransactions] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [botsData, statsData, transactionsData] = await Promise.all([
                    botService.getAll().catch(() => []),
                    transactionService.getStats().catch(() => ({})),
                    transactionService.getAll({ limit: 5 }).catch(() => ({ data: [] })),
                ])
                setBots(botsData || [])
                setStats({
                    totalBots: botsData?.length || 0,
                    totalTransactions: statsData?.total_transactions || 0,
                    totalRevenue: statsData?.total_revenue || 0,
                    pendingTransactions: statsData?.pending_count || 0,
                })
                setRecentTransactions(transactionsData?.data || [])
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <>
            {loading ? (
                // SKELETON LOADING STATE
                <div className="space-y-6">
                    {/* Header Skeleton */}
                    <div className="mb-6">
                        <div className="h-8 w-72 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-5 w-56 bg-gray-200 rounded animate-pulse" />
                    </div>

                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </div>

                    {/* Bots Section Skeleton */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <BotCardSkeleton />
                            <BotCardSkeleton />
                        </div>
                    </div>
                </div>
            ) : (
                // ACTUAL CONTENT
                <div>
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back, {user?.name || 'User'}!
                        </h1>
                        <p className="text-gray-500 mt-1">Here's what's happening with your bots</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <QuickStat label="Total Bots" value={stats.totalBots} icon={IconBot} />
                        <QuickStat label="Transactions" value={stats.totalTransactions} icon={IconChart} />
                        <QuickStat label="Revenue" value={`Rp ${Math.floor(stats.totalRevenue || 0).toLocaleString('id-ID')}`} icon={IconWallet} color="text-green-600" />
                        <QuickStat label="Pending" value={stats.pendingTransactions} icon={IconCheckCircle} color="text-yellow-600" />
                    </div>

                    {/* Projects Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Your Bots</h2>
                            <Link to="/bots/create" className="neo-btn-primary text-sm">
                                + Add Bot
                            </Link>
                        </div>

                        {bots && bots.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {bots.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        ) : (
                            <div className="neo-card p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <IconBot className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No bots yet</h3>
                                <p className="text-gray-500 mb-4">Create your first bot to start accepting payments</p>
                                <Link to="/bots/create" className="neo-btn-primary">
                                    Create Bot
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recent Transactions */}
                    {recentTransactions && recentTransactions.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                                <Link to="/transactions" className="text-sm font-semibold text-[#8B5CF6] hover:underline">
                                    View All →
                                </Link>
                            </div>
                            <div className="neo-table">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Product</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransactions.slice(0, 5).map((trx) => (
                                            <tr key={trx.id}>
                                                <td className="font-mono text-sm">{trx.invoice_id || trx.order_id}</td>
                                                <td>{trx.product_name || trx.product || 'N/A'}</td>
                                                <td className="font-bold text-[#8B5CF6]">
                                                    Rp {Math.floor(trx.amount || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td>
                                                    <span className={`neo-badge-${trx.status === 'success' ? 'success' : trx.status === 'pending' ? 'warning' : 'gray'}`}>
                                                        {trx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
