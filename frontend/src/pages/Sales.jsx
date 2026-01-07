import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEye, FiFilter, FiDownload } from 'react-icons/fi';
import { salesApi } from '../api';
import useAuthStore from '../hooks/useAuth';

export default function Sales() {
    const { isAdmin } = useAuthStore();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        channel: '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.channel) params.channel = filters.channel;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;

            const response = await salesApi.getAll(params);
            setSales(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to load sales:', error);
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleFilter = (e) => {
        e.preventDefault();
        loadSales();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Riwayat Penjualan</h1>
                    <p className="text-gray-500 mt-1">Daftar semua transaksi penjualan</p>
                </div>
                <Link
                    to="/sales/new"
                    className="btn btn-primary inline-flex items-center gap-2"
                >
                    <FiPlus className="w-5 h-5" />
                    <span>Penjualan Baru</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="card">
                <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="label">Channel</label>
                        <select
                            value={filters.channel}
                            onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
                            className="input"
                            style={{ minWidth: '150px' }}
                        >
                            <option value="">Semua Channel</option>
                            <option value="FACTORY">Pabrik</option>
                            <option value="FIELD">Lapangan</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Dari Tanggal</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                            className="input"
                        />
                    </div>
                    <button type="submit" className="btn btn-secondary inline-flex items-center gap-2">
                        <FiFilter className="w-4 h-4" />
                        Filter
                    </button>
                </form>
            </div>

            {/* Sales Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : sales.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Belum ada transaksi penjualan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Channel</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pembayaran</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-800">{sale.invoice_number}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(sale.sold_at)}</td>
                                        <td className="px-6 py-4 text-gray-600">{sale.customer?.name || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${sale.sales_channel === 'FACTORY' ? 'badge-info' : 'badge-warning'}`}>
                                                {sale.sales_channel === 'FACTORY' ? 'Pabrik' : 'Lapangan'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${sale.payment_method === 'CASH' ? 'badge-success' : 'badge-info'}`}>
                                                {sale.payment_method === 'CASH' ? 'Tunai' : 'Transfer'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-800">
                                            {formatCurrency(sale.total_amount)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`badge ${sale.status === 'completed' ? 'badge-success' : sale.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                                                {sale.status === 'completed' ? 'Selesai' : sale.status === 'cancelled' ? 'Dibatalkan' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                to={`/sales/${sale.id}`}
                                                className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700"
                                            >
                                                <FiEye className="w-4 h-4" />
                                                <span>Detail</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
