import { useState, useEffect } from 'react';
import { FiCalendar, FiDownload, FiTrendingUp, FiShoppingCart, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { salesApi, productionApi, inventoryApi } from '../api';

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [reportData, setReportData] = useState({
        totalSales: 0,
        totalAmount: 0,
        totalProduction: {},
        currentStock: [],
        salesByDay: [],
    });

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        setLoading(true);
        try {
            const [salesRes, productionRes, stockRes] = await Promise.all([
                salesApi.getAll({ start_date: dateRange.start, end_date: dateRange.end, per_page: 1000 }),
                productionApi.getSummary(dateRange.start, dateRange.end).catch(() => ({ data: {} })),
                inventoryApi.getStock(),
            ]);

            const sales = salesRes.data?.data || salesRes.data || [];
            const totalAmount = sales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);

            // Group sales by date
            const salesByDay = {};
            sales.forEach((sale) => {
                const date = sale.sold_at?.split('T')[0];
                if (date) {
                    salesByDay[date] = (salesByDay[date] || 0) + parseFloat(sale.total_amount || 0);
                }
            });

            setReportData({
                totalSales: sales.length,
                totalAmount,
                totalProduction: productionRes.data || {},
                currentStock: stockRes.data || [],
                salesByDay: Object.entries(salesByDay).map(([date, amount]) => ({ date, amount })),
            });
        } catch (error) {
            toast.error('Gagal memuat laporan');
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

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Laporan & Statistik</h1>
                    <p className="text-gray-500 mt-1">Ringkasan performa bisnis</p>
                </div>
                <button className="btn btn-secondary inline-flex items-center gap-2">
                    <FiDownload className="w-5 h-5" />
                    <span>Export PDF</span>
                </button>
            </div>

            {/* Date Filter */}
            <div className="card">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="label">Dari Tanggal</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="input"
                        />
                    </div>
                    <button onClick={loadReport} className="btn btn-primary inline-flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        Terapkan
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <FiTrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Omzet</p>
                                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(reportData.totalAmount)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <FiShoppingCart className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Transaksi</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData.totalSales}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <FiPackage className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Rata-rata/Transaksi</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {formatCurrency(reportData.totalSales > 0 ? reportData.totalAmount / reportData.totalSales : 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales Chart (Simple Bar) */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Penjualan per Hari</h2>
                        {reportData.salesByDay.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">Tidak ada data penjualan</p>
                        ) : (
                            <div className="space-y-3">
                                {reportData.salesByDay.sort((a, b) => a.date.localeCompare(b.date)).map((day) => {
                                    const maxAmount = Math.max(...reportData.salesByDay.map((d) => d.amount));
                                    const percentage = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                                    return (
                                        <div key={day.date} className="flex items-center gap-4">
                                            <div className="w-20 text-sm text-gray-600">{formatDate(day.date)}</div>
                                            <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <div className="w-32 text-right font-semibold text-gray-800">
                                                {formatCurrency(day.amount)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Current Stock */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Stok Saat Ini</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {reportData.currentStock.map((stock) => (
                                <div key={stock.id} className="p-4 bg-gray-50 rounded-xl text-center">
                                    <p className="text-sm text-gray-500">{stock.name}</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{stock.current_stock}</p>
                                    <p className="text-xs text-gray-400">pcs</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
