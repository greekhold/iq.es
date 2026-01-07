import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiTrendingUp, FiBox, FiPlus, FiSettings, FiBarChart2 } from 'react-icons/fi';
import { inventoryApi, salesApi } from '../api';
import useAuthStore from '../hooks/useAuth';

function StatCard({ title, value, icon: Icon, color, bgColor, subtext }) {
    return (
        <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
                    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
        </div>
    );
}

function QuickActionCard({ to, icon: Icon, label, bgColor, hoverColor }) {
    return (
        <Link
            to={to}
            className={`flex flex-col items-center p-6 ${bgColor} rounded-xl ${hoverColor} transition-all duration-200 hover:scale-105`}
        >
            <Icon className="w-8 h-8 text-gray-700 mb-3" />
            <span className="text-sm font-medium text-gray-700 text-center">{label}</span>
        </Link>
    );
}

export default function Dashboard() {
    const { user, isAdmin } = useAuthStore();
    const [stats, setStats] = useState({
        stock5kg: 0,
        stock1kg: 0,
        todaySales: 0,
        todayAmount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentSales, setRecentSales] = useState([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            const [stockRes, salesRes] = await Promise.all([
                inventoryApi.getStock(),
                salesApi.getAll({
                    start_date: today,
                    end_date: today,
                }),
            ]);

            const stockData = stockRes.data || [];
            const stock5kg = stockData.find((s) => s.sku === 'ICE-5KG')?.current_stock || 0;
            const stock1kg = stockData.find((s) => s.sku === 'ICE-1KG')?.current_stock || 0;

            const salesData = salesRes.data?.data || salesRes.data || [];
            const todaySales = salesData.length;
            const todayAmount = salesData.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);

            setStats({ stock5kg, stock1kg, todaySales, todayAmount });
            setRecentSales(salesData.slice(0, 5));
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-cyan-700 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Selamat Datang, {user?.name?.split(' ')[0] || 'User'}! 👋
                        </h1>
                        <p className="text-cyan-100 mt-1">
                            {user?.role?.display_name || 'User'} • IQ.es Ice Crystal Factory
                        </p>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-cyan-200 text-sm">
                            {new Date().toLocaleDateString('id-ID', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Stok Es 5kg"
                    value={loading ? '...' : `${stats.stock5kg} pcs`}
                    icon={FiBox}
                    color="text-blue-600"
                    bgColor="bg-blue-100"
                    subtext="Kristal 5 kilogram"
                />
                <StatCard
                    title="Stok Es 1kg"
                    value={loading ? '...' : `${stats.stock1kg} pcs`}
                    icon={FiPackage}
                    color="text-cyan-600"
                    bgColor="bg-cyan-100"
                    subtext="Kristal 1 kilogram"
                />
                <StatCard
                    title="Penjualan Hari Ini"
                    value={loading ? '...' : `${stats.todaySales} transaksi`}
                    icon={FiShoppingCart}
                    color="text-green-600"
                    bgColor="bg-green-100"
                />
                <StatCard
                    title="Omzet Hari Ini"
                    value={loading ? '...' : formatCurrency(stats.todayAmount)}
                    icon={FiTrendingUp}
                    color="text-purple-600"
                    bgColor="bg-purple-100"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <div className="card h-full">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <QuickActionCard
                                to="/sales/new"
                                icon={FiPlus}
                                label="Penjualan Baru"
                                bgColor="bg-cyan-50"
                                hoverColor="hover:bg-cyan-100"
                            />
                            {isAdmin() && (
                                <>
                                    <QuickActionCard
                                        to="/production"
                                        icon={FiSettings}
                                        label="Input Produksi"
                                        bgColor="bg-green-50"
                                        hoverColor="hover:bg-green-100"
                                    />
                                    <QuickActionCard
                                        to="/inventory"
                                        icon={FiBox}
                                        label="Cek Stok"
                                        bgColor="bg-blue-50"
                                        hoverColor="hover:bg-blue-100"
                                    />
                                    <QuickActionCard
                                        to="/reports"
                                        icon={FiBarChart2}
                                        label="Lihat Laporan"
                                        bgColor="bg-purple-50"
                                        hoverColor="hover:bg-purple-100"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Sales */}
                <div className="lg:col-span-2">
                    <div className="card h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Penjualan Terbaru</h2>
                            <Link to="/sales" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                                Lihat Semua →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : recentSales.length === 0 ? (
                            <div className="text-center py-8">
                                <FiShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400">Belum ada penjualan hari ini</p>
                                <Link to="/sales/new" className="btn btn-primary mt-4 inline-flex items-center gap-2">
                                    <FiPlus className="w-4 h-4" />
                                    Buat Penjualan
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentSales.map((sale) => (
                                    <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sale.sales_channel === 'FACTORY' ? 'bg-blue-100' : 'bg-orange-100'
                                                }`}>
                                                <FiShoppingCart className={`w-5 h-5 ${sale.sales_channel === 'FACTORY' ? 'text-blue-600' : 'text-orange-600'
                                                    }`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{sale.invoice_number}</p>
                                                <p className="text-xs text-gray-400">
                                                    {sale.customer?.name || 'Walk-in'} • {formatTime(sale.sold_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-800">{formatCurrency(sale.total_amount)}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${sale.payment_method === 'CASH'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {sale.payment_method === 'CASH' ? 'Tunai' : 'Transfer'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
