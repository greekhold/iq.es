import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiPlus, FiEye, FiFilter, FiX, FiPackage, FiCheck, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { salesApi } from '../api';
import useAuthStore from '../hooks/useAuth';

export default function Sales() {
    const { isAdmin } = useAuthStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filters, setFilters] = useState({
        channel: '',
        start_date: '',
        end_date: '',
    });

    // Check if filtering for unpaid only (from Reports page link)
    const showUnpaidOnly = searchParams.get('payment_status') === 'unpaid';

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

    // Filter sales for display
    const displayedSales = showUnpaidOnly
        ? sales.filter(s => s.payment_status === 'unpaid' || s.payment_status === 'overdue')
        : sales;

    const clearUnpaidFilter = () => {
        setSearchParams({});
    };

    const handleMarkAsPaid = async (saleId) => {
        try {
            const response = await salesApi.markAsPaid(saleId);
            toast.success('Pembayaran berhasil dicatat!');
            setShowDetailModal(false);
            loadSales();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mencatat pembayaran');
        }
    };

    const handleDelete = async (sale) => {
        if (!confirm(`Hapus penjualan "${sale.invoice_number}"?`)) return;
        try {
            await salesApi.delete(sale.id);
            toast.success('Penjualan berhasil dihapus');
            loadSales();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus penjualan');
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

    const openDetail = (sale) => {
        setSelectedSale(sale);
        setShowDetailModal(true);
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

            {/* Unpaid Filter Banner */}
            {showUnpaidOnly && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-amber-700 font-medium">⚠️ Menampilkan hanya piutang yang belum lunas</span>
                    </div>
                    <button
                        onClick={clearUnpaidFilter}
                        className="text-amber-700 hover:text-amber-900 text-sm flex items-center gap-1"
                    >
                        <FiX className="w-4 h-4" /> Hapus Filter
                    </button>
                </div>
            )}

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
                                {displayedSales.map((sale) => (
                                    <tr key={sale.id} className={`hover:bg-gray-50 transition-colors ${sale.payment_status === 'overdue' ? 'bg-red-50' :
                                        sale.payment_status === 'unpaid' ? 'bg-amber-50' : ''
                                        }`}>
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
                                            <div className="flex flex-col gap-1">
                                                <span className={`badge ${sale.payment_method === 'CASH' ? 'badge-success' : sale.payment_method === 'OTHER' ? 'badge-warning' : 'badge-info'}`}>
                                                    {sale.payment_method === 'CASH' ? 'Tunai' : sale.payment_method === 'OTHER' ? 'Lainnya' : 'Transfer'}
                                                </span>
                                                {sale.payment_method === 'OTHER' && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${sale.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                        sale.payment_status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {sale.payment_status === 'paid' ? '✔ Lunas' :
                                                            sale.payment_status === 'overdue' ? '⚠ Jatuh Tempo' :
                                                                '⏳ Belum Lunas'}
                                                    </span>
                                                )}
                                            </div>
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
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openDetail(sale)}
                                                    className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                    <span>Detail</span>
                                                </button>
                                                {isAdmin() && (
                                                    <button
                                                        onClick={() => handleDelete(sale)}
                                                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-700"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedSale && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }} className="animate-fadeIn">
                        {/* Modal Header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Detail Penjualan</h2>
                                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{selectedSale.invoice_number}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280' }}
                            >
                                <FiX style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px' }}>
                            {/* Sale Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Tanggal</p>
                                    <p style={{ fontWeight: '500', color: '#1F2937', margin: 0 }}>{formatDate(selectedSale.sold_at)}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Customer</p>
                                    <p style={{ fontWeight: '500', color: '#1F2937', margin: 0 }}>{selectedSale.customer?.name || 'Retail'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Channel</p>
                                    <span className={`badge ${selectedSale.sales_channel === 'FACTORY' ? 'badge-info' : 'badge-warning'}`}>
                                        {selectedSale.sales_channel === 'FACTORY' ? 'Pabrik' : 'Lapangan'}
                                    </span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Pembayaran</p>
                                    <span className={`badge ${selectedSale.payment_method === 'CASH' ? 'badge-success' : selectedSale.payment_method === 'OTHER' ? 'badge-warning' : 'badge-info'}`}>
                                        {selectedSale.payment_method === 'CASH' ? 'Tunai' : selectedSale.payment_method === 'OTHER' ? 'Lainnya' : 'Transfer'}
                                    </span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Status</p>
                                    <span className={`badge ${selectedSale.status === 'completed' ? 'badge-success' : selectedSale.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                                        {selectedSale.status === 'completed' ? 'Selesai' : selectedSale.status === 'cancelled' ? 'Dibatalkan' : 'Pending'}
                                    </span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Kasir</p>
                                    <p style={{ fontWeight: '500', color: '#1F2937', margin: 0 }}>{selectedSale.created_by?.name || '-'}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Item Penjualan</h3>
                                <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#F9FAFB' }}>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Produk</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Qty</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Harga</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(selectedSale.items || []).map((item, index) => (
                                                <tr key={index} style={{ borderTop: '1px solid #E5E7EB' }}>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '32px', height: '32px', backgroundColor: '#E0F7FA', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <FiPackage style={{ color: '#00ACC1' }} />
                                                            </div>
                                                            <span style={{ fontWeight: '500', color: '#1F2937' }}>{item.product?.name || 'Produk'}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#374151' }}>{item.quantity}</td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#374151' }}>{formatCurrency(item.price_snapshot)}</td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#1F2937' }}>{formatCurrency(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Total */}
                            <div style={{ backgroundColor: '#F0FDFA', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '16px', fontWeight: '600', color: '#0F766E' }}>Total</span>
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F766E' }}>{formatCurrency(selectedSale.total_amount)}</span>
                            </div>

                            {/* Notes */}
                            {selectedSale.notes && (
                                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Catatan</p>
                                    <p style={{ color: '#374151', margin: 0 }}>{selectedSale.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px' }}>
                            {(selectedSale.payment_status === 'unpaid' || selectedSale.payment_status === 'overdue') && (
                                <button
                                    onClick={() => handleMarkAsPaid(selectedSale.id)}
                                    className="btn btn-primary"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <FiCheck className="w-4 h-4" />
                                    Tandai Lunas
                                </button>
                            )}
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="btn btn-secondary"
                                style={{ flex: selectedSale.payment_status === 'paid' ? 1 : undefined }}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
