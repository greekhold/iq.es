import { useState, useEffect } from 'react';
import { FiPlus, FiDollarSign, FiCalendar, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { expensesApi } from '../api';

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [filters, setFilters] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        category_id: '',
    });
    const [formData, setFormData] = useState({
        category_id: '',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [categoryForm, setCategoryForm] = useState({ name: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [expensesRes, categoriesRes] = await Promise.all([
                expensesApi.getAll(filters),
                expensesApi.getCategories(),
            ]);
            setExpenses(expensesRes?.data || expensesRes || []);
            setCategories(categoriesRes || []);
        } catch (error) {
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        loadData();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await expensesApi.create(formData);
            toast.success('Pengeluaran berhasil dicatat');
            setShowModal(false);
            setFormData({
                category_id: '',
                description: '',
                amount: '',
                expense_date: new Date().toISOString().split('T')[0],
                notes: '',
            });
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan');
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await expensesApi.createCategory(categoryForm);
            toast.success('Kategori berhasil ditambahkan');
            setShowCategoryModal(false);
            setCategoryForm({ name: '' });
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menambah kategori');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Pengeluaran / Expenses</h1>
                    <p style={{ color: '#6B7280', marginTop: '4px' }}>Catat pengeluaran operasional: gaji, listrik, dll</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowCategoryModal(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiTag /> Kategori
                    </button>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiPlus /> Catat Pengeluaran
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', color: 'white' }}>
                <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Total Pengeluaran ({filters.start_date} - {filters.end_date})</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0' }}>{formatCurrency(totalExpenses)}</p>
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
                    <div>
                        <label className="label">Kategori</label>
                        <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value })} className="input" style={{ minWidth: '150px' }}>
                            <option value="">Semua</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCalendar /> Filter
                    </button>
                </form>
            </div>

            {/* Expenses Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                        <div style={{ width: '32px', height: '32px', border: '4px solid #00ACC1', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
                    </div>
                ) : expenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px' }}>
                        <FiDollarSign style={{ width: '48px', height: '48px', color: '#D1D5DB', margin: '0 auto 16px' }} />
                        <p style={{ color: '#6B7280' }}>Belum ada pengeluaran</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4B5563', textTransform: 'uppercase' }}>Tanggal</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4B5563', textTransform: 'uppercase' }}>Kategori</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4B5563', textTransform: 'uppercase' }}>Deskripsi</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#4B5563', textTransform: 'uppercase' }}>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <td style={{ padding: '16px 24px', color: '#4B5563' }}>{formatDate(expense.expense_date)}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ padding: '4px 12px', backgroundColor: '#EEF2FF', color: '#4338CA', borderRadius: '9999px', fontSize: '12px', fontWeight: '500' }}>
                                                {expense.category?.name}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#1F2937' }}>{expense.description}</td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#DC2626' }}>{formatCurrency(expense.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Expense Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }} className="animate-fadeIn">
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '16px' }}>Catat Pengeluaran</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="label">Kategori</label>
                                <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="input" required>
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Deskripsi</label>
                                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" placeholder="Bayar listrik bulan Januari" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="label">Jumlah (Rp)</label>
                                    <input type="number" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input" placeholder="500000" required />
                                </div>
                                <div>
                                    <label className="label">Tanggal</label>
                                    <input type="date" value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} className="input" required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Catatan</label>
                                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input" rows={2} placeholder="Catatan tambahan" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Batal</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Category Modal */}
            {showCategoryModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }} className="animate-fadeIn">
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '16px' }}>Tambah Kategori</h2>
                        <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="label">Nama Kategori</label>
                                <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ name: e.target.value })} className="input" placeholder="Internet, BBM, dll" required />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setShowCategoryModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Batal</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
                            </div>
                        </form>
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>Kategori yang ada:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {categories.map((c) => (
                                    <span key={c.id} style={{ padding: '4px 12px', backgroundColor: '#F3F4F6', borderRadius: '9999px', fontSize: '12px' }}>{c.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
