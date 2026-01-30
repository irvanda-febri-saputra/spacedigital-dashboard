import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { gatewayService } from '../services/gatewayService';
import { botService } from '../services/botService';

// Copy dari project lama - IconCreditCard
function IconCreditCard({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
    );
}

// Copy dari project lama - Skeleton
function Skeleton({ className }) {
    return <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>;
}

function TableRowSkeleton({ columns }) {
    return (
        <tr className="border-b border-gray-100">
            {[...Array(columns)].map((_, i) => (
                <td key={i} className="px-4 py-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

export default function PaymentGatewaysIndex() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [gateways, setGateways] = useState([]);
    const [userGateways, setUserGateways] = useState({});
    const [bots, setBots] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [gatewaysRes, userGatewaysRes, botsRes] = await Promise.all([
                gatewayService.getAll(),
                gatewayService.getUserGateways(),
                botService.getAll().catch(() => [])
            ]);

            setGateways(gatewaysRes || []);
            setBots(botsRes || []);

            // Convert to object keyed by gateway_id (same as old project)
            const userGatewaysArray = userGatewaysRes?.data || userGatewaysRes || [];
            const userGatewaysObj = {};
            userGatewaysArray.forEach(ug => {
                userGatewaysObj[ug.gateway_id] = ug;
            });
            setUserGateways(userGatewaysObj);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            // Initial loading delay - same as old project
            setTimeout(() => setLoading(false), 600);
        }
    };

    // Convert userGateways object to array for easier handling
    const userGatewaysArray = userGateways ? Object.values(userGateways) : [];

    // Check if a gateway is being used by any bot
    const isUsedByBot = (userGatewayId) => {
        // Bot uses active_gateway_id which points to UserGateway.id
        // Also check active_gateway.id for nested object
        return bots.some(bot => 
            bot.active_gateway_id === userGatewayId || 
            bot.active_gateway?.id === userGatewayId
        );
    };

    // Get bots using this gateway
    const getBotsUsingGateway = (userGatewayId) => {
        return bots.filter(bot => 
            bot.active_gateway_id === userGatewayId || 
            bot.active_gateway?.id === userGatewayId
        );
    };

    // Check if a gateway is configured by user
    const isConfigured = (gatewayId) => {
        return userGateways && userGateways[gatewayId];
    };

    const getUserGateway = (gatewayId) => {
        return userGateways ? userGateways[gatewayId] : null;
    };

    const handleDelete = async (userGatewayId, gatewayName) => {
        if (confirm(`Are you sure you want to remove "${gatewayName}" configuration?`)) {
            try {
                await gatewayService.deleteUserGateway(userGatewayId);
                await fetchData();
            } catch (err) {
                console.error('Error deleting:', err);
            }
        }
    };

    // Loading skeleton - copy persis dari project lama
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="mb-6">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-72" />
                </div>

                <div className="neo-card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b-3 border-gray-900">
                            <tr>
                                <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
                                <th className="px-4 py-3"><Skeleton className="h-4 w-16" /></th>
                                <th className="px-4 py-3"><Skeleton className="h-4 w-16" /></th>
                                <th className="px-4 py-3"><Skeleton className="h-4 w-12" /></th>
                                <th className="px-4 py-3"><Skeleton className="h-4 w-16" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(4)].map((_, i) => (
                                <TableRowSkeleton key={i} columns={5} />
                            ))}
                        </tbody>
                    </table>
                </div>

                <div>
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="neo-card p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <Skeleton className="w-12 h-12 rounded-lg" />
                                    <div>
                                        <Skeleton className="h-5 w-24 mb-2" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Payment Gateways</h1>
                <p className="text-gray-500 mt-1">Configure payment providers for your bots</p>
            </div>

            {/* My Configured Gateways */}
            {userGatewaysArray.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">My Payment Gateways</h2>

                    {/* Mobile Cards View */}
                    <div className="block lg:hidden space-y-4">
                        {userGatewaysArray.map((userGateway) => (
                            <div key={userGateway.id} className="neo-card p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                        {userGateway.gateway?.logo ? (
                                            <img
                                                src={userGateway.gateway.logo}
                                                alt={userGateway.gateway.name}
                                                className="w-full h-full object-contain p-1"
                                            />
                                        ) : (
                                            <IconCreditCard className="w-5 h-5 text-[#8B5CF6]" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{userGateway.gateway?.name}</p>
                                        <p className="text-xs text-gray-500">{userGateway.label || userGateway.gateway?.code}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {/* Toggle Switch */}
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await gatewayService.toggleActive(userGateway.id);
                                                    await fetchData();
                                                } catch (err) {
                                                    console.error('Error toggling gateway:', err);
                                                }
                                            }}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                userGateway.is_active ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    userGateway.is_active ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                        <span className="text-xs text-gray-500">
                                            {userGateway.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                    <span>Fee: {Number(userGateway.gateway?.fee_percent)}%{userGateway.gateway?.fee_flat > 0 && ` + Rp ${Number(userGateway.gateway?.fee_flat).toLocaleString()}`}</span>
                                    {isUsedByBot(userGateway.id) && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                            In Use
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/payment-gateways/${userGateway.gateway?.id}/configure`}
                                        className="neo-btn-outline-primary flex-1 text-center text-sm"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(userGateway.id, userGateway.gateway?.name)}
                                        className="neo-btn-outline-danger flex-1 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block neo-table overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b-3 border-gray-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Gateway</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Label</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Fee</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userGatewaysArray.map((userGateway) => (
                                        <tr key={userGateway.id} className="hover:bg-gray-50 border-b border-gray-100">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                                        {userGateway.gateway?.logo ? (
                                                            <img
                                                                src={userGateway.gateway.logo}
                                                                alt={userGateway.gateway.name}
                                                                className="w-full h-full object-contain p-1"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'block';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <IconCreditCard
                                                            className={`w-5 h-5 text-[#8B5CF6] ${userGateway.gateway?.logo ? 'hidden' : ''}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{userGateway.gateway?.name}</p>
                                                        <p className="text-xs text-gray-500">{userGateway.gateway?.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {userGateway.label || '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    {/* Toggle Switch for Active/Inactive */}
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await gatewayService.toggleActive(userGateway.id);
                                                                await fetchData();
                                                            } catch (err) {
                                                                console.error('Error toggling gateway:', err);
                                                            }
                                                        }}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                                            userGateway.is_active ? 'bg-green-500' : 'bg-gray-300'
                                                        }`}
                                                        title={userGateway.is_active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                userGateway.is_active ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                        />
                                                    </button>
                                                    <span className="text-sm text-gray-600 min-w-[60px]">
                                                        {userGateway.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    
                                                    {/* In Use Indicator */}
                                                    {isUsedByBot(userGateway.id) && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md" title={`Digunakan oleh: ${getBotsUsingGateway(userGateway.id).map(b => b.name).join(', ')}`}>
                                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                            In Use
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {Number(userGateway.gateway?.fee_percent)}%
                                                {userGateway.gateway?.fee_flat > 0 && (
                                                    <span> + Rp {Number(userGateway.gateway?.fee_flat).toLocaleString()}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/payment-gateways/${userGateway.gateway?.id}/configure`}
                                                        className="neo-btn-outline-primary"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(userGateway.id, userGateway.gateway?.name)}
                                                        className="neo-btn-outline-danger"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Available Gateways */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Available Gateways</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gateways?.map((gateway) => {
                        const configured = isConfigured(gateway.id);
                        const userGateway = getUserGateway(gateway.id);

                        return (
                            <div key={gateway.id} className="neo-card overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                            {gateway.logo ? (
                                                <img
                                                    src={gateway.logo}
                                                    alt={gateway.name}
                                                    className="w-full h-full object-contain p-1"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                />
                                            ) : null}
                                            <IconCreditCard
                                                className={`w-6 h-6 text-[#8B5CF6] ${gateway.logo ? 'hidden' : ''}`}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{gateway.name}</h3>
                                            <p className="text-sm text-gray-500">{gateway.code}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3">
                                        {gateway.description || 'Payment gateway integration'}
                                    </p>

                                    {/* Fee Info */}
                                    <div className="text-sm text-gray-500 mb-4">
                                        <span className="font-medium">Fee: </span>
                                        {Number(gateway.fee_percent)}%
                                        {gateway.fee_flat > 0 && (
                                            <span> + Rp {Number(gateway.fee_flat).toLocaleString()}</span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className={configured ? 'neo-badge-success' : 'neo-badge-gray'}>
                                            {configured ? 'Configured' : 'Not configured'}
                                        </span>
                                        <Link
                                            to={`/payment-gateways/${gateway.id}/configure`}
                                            className="text-sm font-semibold text-[#8B5CF6] hover:underline"
                                        >
                                            {configured ? 'Edit →' : 'Configure →'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Guide */}
            <div className="mt-8 neo-card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">How to use</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Click <strong>Configure</strong> on a gateway to add your API credentials</li>
                    <li>After saving, go to the gateway's settings to <strong>Assign to Bots</strong></li>
                    <li>Your bot will automatically use the assigned payment gateway for transactions</li>
                </ol>
            </div>
        </>
    );
}
