import { useState, useEffect } from 'react';
import { FiPlus, FiShoppingBag, FiEye, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { purchasesApi, suppliesApi } from '../api';

export default function Purchases() {
    const [purchases, setPurchases] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
    });
    const [formData, setFormData] = useState({
        supplier_name: '',
        purchased_at: new Date().toISOString().split('T')[0],
        notes: '',
        items: [{ supply_id: '', quantity: '', price_per_unit: '' }],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [purchasesRes, suppliesRes] = await Promise.all([
                purchasesApi.getAll(filters),
                suppliesApi.getAll(true),
            ]);
            setPurchases(purchasesRes?.data || purchasesRes || []);
            setSupplies(suppliesRes || []);
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

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { supply_id: '', quantity: '', price_per_unit: '' }],
        });
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData({
                ...formData,
                items: formData.items.filter((_, i) => i !== index),
            });
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => {
            return sum + (parseFloat(item.quantity || 0) * parseFloat(item.price_per_unit || 0));
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const validItems = formData.items.filter(item => item.supply_id && item.quantity && item.price_per_unit);
            if (validItems.length === 0) {
                toast.error('Tambahkan minimal 1 item');
                return;
            }
            await purchasesApi.create({ ...formData, items: validItems });
            toast.success('Pembelian berhasil dicatat');
            setShowModal(false);
            setFormData({
                supplier_name: '',
                purchased_at: new Date().toISOString().split('T')[0],
                notes: '',
                items: [{ supply_id: '', quantity: '', price_per_unit: '' }],
            });
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Pembelian / Purchases</h1>
                    <p style={{ color: '#6B7280', marginTop: '4px' }}>Catat pembelian bahan & supplies</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPlus /> Catat Pembelian
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
                    <button type="submit" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCalendar /> Filter
                    </button>
                </form>
            </div>

            {/* Purchases Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                        <div style={{ width: '32px', height: '32px', border: '4px solid #00ACC1', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
                    </div>
                ) : purchases.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px' }}>
                        <FiShoppingBag style={{ width: '48px', height: '48px', color: '#D1D5DB', margin: '0 auto 16px' }} />
                        <p style={{ color: '#6B7280' }}>Belum ada pembelian</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4B5563', textTransform: 'uppercase' }}>Invoice</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4B5563', textTransform: 'uppercase' }}>Tanggal</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4B5563', textTransform: 'uppercase' }}>Supplier</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#4B5563', textTransform: 'uppercase' }}>Items</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#4B5563', textTransform: 'uppercase' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map((purchase) => (
                                    <tr key={purchase.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <td style={{ padding: '16px 24px', fontWeight: '500', color: '#1F2937' }}>{purchase.invoice_number}</td>
                                        <td style={{ padding: '16px 24px', color: '#4B5563' }}>{formatDate(purchase.purchased_at)}</td>
                                        <td style={{ padding: '16px 24px', color: '#4B5563' }}>{purchase.supplier_name || '-'}</td>
                                        <td style={{ padding: '16px 24px', color: '#4B5563' }}>{purchase.items?.length || 0} item</td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#1F2937' }}>{formatCurrency(purchase.total_amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Purchase Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }} className="animate-fadeIn">
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '16px' }}>Catat Pembelian Baru</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="label">Nama Supplier/Toko</label>
                                    <input type="text" value={formData.supplier_name} onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })} className="input" placeholder="Toko ABC" />
                                </div>
                                <div>
                                    <label className="label">Tanggal Beli</label>
                                    <input type="date" value={formData.purchased_at} onChange={(e) => setFormData({ ...formData, purchased_at: e.target.value })} className="input" required />
                                </div>
                            </div>

                            <div>
                                <label className="label" style={{ marginBottom: '8px' }}>Item Pembelian</label>
                                {formData.items.map((item, index) => (
                                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                                        <select value={item.supply_id} onChange={(e) => updateItem(index, 'supply_id', e.target.value)} className="input" required>
                                            <option value="">Pilih Bahan</option>
                                            {supplies.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="input" placeholder="Qty" required />
                                        <input type="number" min="0" value={item.price_per_unit} onChange={(e) => updateItem(index, 'price_per_unit', e.target.value)} className="input" placeholder="Harga/unit" required />
                                        <button type="button" onClick={() => removeItem(index)} className="btn btn-secondary" style={{ padding: '8px', color: '#DC2626' }}>×</button>
                                    </div>
                                ))}
                                <button type="button" onClick={addItem} className="btn btn-secondary" style={{ marginTop: '8px' }}>
                                    <FiPlus style={{ marginRight: '4px' }} /> Tambah Item
                                </button>
                            </div>

                            <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                                    <span>Total:</span>
                                    <span>{formatCurrency(calculateTotal())}</span>
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
        </div>
    );
}
