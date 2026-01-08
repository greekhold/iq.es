import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiTrendingUp, FiShoppingCart, FiDownload, FiShoppingBag, FiCreditCard, FiDollarSign, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { salesApi, inventoryApi, purchasesApi, expensesApi } from '../api';

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
    });
    const [salesData, setSalesData] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [purchasesTotal, setPurchasesTotal] = useState(0);
    const [expensesTotal, setExpensesTotal] = useState(0);
    const [expensesByCategory, setExpensesByCategory] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load data separately with fallbacks
            let salesResult = [];
            let stockResult = [];
            let purchasesTotalResult = 0;
            let expensesTotalResult = 0;
            let expensesByCategoryResult = [];

            try {
                const salesRes = await salesApi.getAll({
                    start_date: filters.start_date,
                    end_date: filters.end_date,
                    per_page: 1000 // Get all sales for report
                });
                // Handle paginated response: data.data.data or data.data or data
                const resData = salesRes?.data;
                if (resData?.data) {
                    // Paginated: { success: true, data: { data: [...], ... }}
                    salesResult = Array.isArray(resData.data) ? resData.data : [];
                } else if (Array.isArray(resData)) {
                    salesResult = resData;
                } else {
                    salesResult = [];
                }
                console.log('Sales loaded:', salesResult.length);
            } catch (e) {
                console.error('Failed to load sales:', e);
            }

            try {
                const stockRes = await inventoryApi.getStock();
                stockResult = stockRes?.data || stockRes || [];
            } catch (e) {
                console.error('Failed to load stock:', e);
            }

            try {
                const purchasesSummary = await purchasesApi.getSummary(filters.start_date, filters.end_date);
                purchasesTotalResult = purchasesSummary?.total_purchases || purchasesSummary?.data?.total_purchases || 0;
            } catch (e) {
                console.error('Failed to load purchases summary:', e);
            }

            try {
                const expensesSummary = await expensesApi.getSummary(filters.start_date, filters.end_date);
                expensesTotalResult = expensesSummary?.total_expenses || expensesSummary?.data?.total_expenses || 0;
                expensesByCategoryResult = expensesSummary?.by_category || expensesSummary?.data?.by_category || [];
            } catch (e) {
                console.error('Failed to load expenses summary:', e);
            }

            setSalesData(salesResult);
            setStocks(stockResult);
            setPurchasesTotal(purchasesTotalResult);
            setExpensesTotal(expensesTotalResult);
            setExpensesByCategory(expensesByCategoryResult);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Gagal memuat data laporan');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        loadData();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
    };

    // Calculate summary with null checks
    const completedSales = Array.isArray(salesData) ? salesData.filter(s => s.status === 'completed') : [];
    const totalSales = completedSales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
    const totalTransactions = completedSales.length;
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Piutang (Unpaid sales with OTHER payment method)
    const piutangSales = completedSales.filter(s => s.payment_status === 'unpaid' || s.payment_status === 'overdue');
    const totalPiutang = piutangSales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
    const overduePiutang = piutangSales.filter(s => s.payment_status === 'overdue');
    const totalOverdue = overduePiutang.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);

    // Laba = Penjualan - Pembelian Bahan - Pengeluaran Operasional
    const netProfit = totalSales - purchasesTotal - expensesTotal;

    // Daily sales for chart with null check
    const dailySales = completedSales.reduce((acc, sale) => {
        const date = new Date(sale.sold_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        acc[date] = (acc[date] || 0) + parseFloat(sale.total_amount || 0);
        return acc;
    }, {});

    const dailySalesEntries = Object.entries(dailySales);
    const maxDaily = dailySalesEntries.length > 0 ? Math.max(...Object.values(dailySales), 1) : 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Laporan Keuangan</h1>
                    <p style={{ color: '#6B7280', marginTop: '4px' }}>Ringkasan penjualan, pembelian, dan pengeluaran</p>
                </div>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiDownload /> Export PDF
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <form onSubmit={handleFilter} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '16px' }}>
                    <div>
                        <label className="label">Dari Tanggal</label>
                        <input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} className="input" />
                    </div>
                    <div>
                        <label className="label">Sampai Tanggal</label>
                        <input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} className="input" />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCalendar /> Terapkan
                    </button>
                </form>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                    <div style={{ width: '32px', height: '32px', border: '4px solid #00ACC1', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                        <div className="card" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiTrendingUp style={{ width: '24px', height: '24px' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Total Penjualan</p>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(totalSales)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiShoppingBag style={{ width: '24px', height: '24px' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Total Pembelian Bahan</p>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(purchasesTotal)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiCreditCard style={{ width: '24px', height: '24px' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Total Pengeluaran Ops</p>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(expensesTotal)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ background: netProfit >= 0 ? 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiDollarSign style={{ width: '24px', height: '24px' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Laba Bersih</p>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(netProfit)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#DBEAFE', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiShoppingCart style={{ color: '#2563EB' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Total Transaksi</p>
                                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>{totalTransactions}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#D1FAE5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiTrendingUp style={{ color: '#059669' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Rata-rata/Transaksi</p>
                                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>{formatCurrency(averageTransaction)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                        {/* Daily Sales Chart */}
                        <div className="card">
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>Grafik Penjualan Harian</h3>
                            {dailySalesEntries.length === 0 ? (
                                <p style={{ color: '#6B7280', textAlign: 'center', padding: '32px' }}>Tidak ada data penjualan dalam periode ini</p>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', overflowX: 'auto', paddingBottom: '8px' }}>
                                    {dailySalesEntries.map(([date, amount]) => (
                                        <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: `${Math.max((amount / maxDaily) * 160, 10)}px`,
                                                background: 'linear-gradient(180deg, #00ACC1 0%, #0097A7 100%)',
                                                borderRadius: '6px 6px 0 0',
                                            }} />
                                            <p style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', textAlign: 'center' }}>{date}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Piutang Section (Unpaid sales) */}
                        {totalPiutang > 0 && (
                            <div className="card" style={{ border: '2px solid #F59E0B', background: 'linear-gradient(180deg, #FFFBEB 0%, white 100%)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400E', margin: 0 }}>Total Piutang</h3>
                                        <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                                            {piutangSales.length} transaksi belum lunas
                                        </p>
                                        {totalOverdue > 0 && (
                                            <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0 0' }}>
                                                ⚠️ {overduePiutang.length} transaksi jatuh tempo ({formatCurrency(totalOverdue)})
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#D97706', margin: 0 }}>{formatCurrency(totalPiutang)}</p>
                                        <Link
                                            to="/sales?payment_status=unpaid"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '13px',
                                                color: '#92400E',
                                                textDecoration: 'none',
                                                marginTop: '8px'
                                            }}
                                        >
                                            Lihat Detail <FiExternalLink style={{ width: '14px', height: '14px' }} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Expense Breakdown - Only operational expenses, NOT purchases */}
                        {expensesByCategory.length > 0 && (
                            <div className="card">
                                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>Breakdown Pengeluaran Operasional</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {expensesByCategory.map((item, index) => (
                                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#4B5563' }}>{item.category?.name || item.category_name || 'Lainnya'}</span>
                                            <span style={{ fontWeight: '600', color: '#DC2626' }}>{formatCurrency(item.total)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stock Overview */}
                    {Array.isArray(stocks) && stocks.length > 0 && (
                        <div className="card">
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '16px' }}>Stok Produk Saat Ini</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                {stocks.filter(s => s.current_stock > 0 || s.requires_stock !== false).map((stock) => (
                                    <div key={stock.product_id || stock.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', backgroundColor: '#E0F7FA', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '24px' }}>🧊</span>
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600', color: '#1F2937', margin: 0 }}>{stock.product_name || stock.name}</p>
                                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#00ACC1', margin: 0 }}>{stock.current_stock || 0} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6B7280' }}>pcs</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
