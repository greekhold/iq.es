import { useState, useEffect } from 'react';
import { FiPlus, FiPackage, FiEdit2, FiAlertTriangle, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { suppliesApi, productsApi } from '../api';

export default function Supplies() {
    const [supplies, setSupplies] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [editingSupply, setEditingSupply] = useState(null);
    const [adjustingSupply, setAdjustingSupply] = useState(null);
    const [adjustQty, setAdjustQty] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        unit: 'pcs',
        min_stock: 10,
        linked_product_id: '',
        deduct_per_sale: 1,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [suppliesRes, productsRes] = await Promise.all([
                suppliesApi.getAll(false),
                productsApi.getAll(true),
            ]);
            // Handle different response formats
            setSupplies(suppliesRes?.data || suppliesRes || []);
            setProducts(productsRes?.data || productsRes || []);
        } catch (error) {
            console.error('Failed to load data', error);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupply) {
                await suppliesApi.update(editingSupply.id, formData);
                toast.success('Bahan berhasil diupdate');
            } else {
                await suppliesApi.create(formData);
                toast.success('Bahan berhasil ditambahkan');
            }
            setShowModal(false);
            resetForm();
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan');
        }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        try {
            await suppliesApi.adjust(adjustingSupply.id, parseInt(adjustQty));
            toast.success('Stok berhasil disesuaikan');
            setShowAdjustModal(false);
            setAdjustingSupply(null);
            setAdjustQty('');
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyesuaikan stok');
        }
    };

    const resetForm = () => {
        setEditingSupply(null);
        setFormData({
            name: '',
            sku: '',
            unit: 'pcs',
            min_stock: 10,
            linked_product_id: '',
            deduct_per_sale: 1,
        });
    };

    const openEditModal = (supply) => {
        setEditingSupply(supply);
        setFormData({
            name: supply.name,
            sku: supply.sku,
            unit: supply.unit,
            min_stock: supply.min_stock,
            linked_product_id: supply.linked_product_id || '',
            deduct_per_sale: supply.deduct_per_sale,
        });
        setShowModal(true);
    };

    const openAdjustModal = (supply) => {
        setAdjustingSupply(supply);
        setAdjustQty('');
        setShowAdjustModal(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Bahan & Supplies</h1>
                    <p style={{ color: '#6B7280', marginTop: '4px' }}>Kelola plastik es, galon, tutup galon, dll</p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPlus /> Tambah Bahan
                </button>
            </div>

            {/* Supplies Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                    <div style={{ width: '32px', height: '32px', border: '4px solid #00ACC1', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {supplies.map((supply) => (
                        <div key={supply.id} className="card" style={{ position: 'relative' }}>
                            {/* Low stock warning */}
                            {supply.current_stock <= supply.min_stock && (
                                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '9999px', fontSize: '12px' }}>
                                    <FiAlertTriangle /> Stok Rendah
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#E0F7FA', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiPackage style={{ width: '24px', height: '24px', color: '#00ACC1' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: '600', color: '#1F2937', margin: 0 }}>{supply.name}</h3>
                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{supply.sku}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Stok Saat Ini</p>
                                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: supply.current_stock <= supply.min_stock ? '#DC2626' : '#1F2937', margin: 0 }}>
                                            {supply.current_stock} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6B7280' }}>{supply.unit}</span>
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Min. Stok</p>
                                        <p style={{ fontSize: '18px', fontWeight: '600', color: '#6B7280', margin: 0 }}>{supply.min_stock}</p>
                                    </div>
                                </div>

                                {supply.linked_product_id && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#059669', marginBottom: '12px' }}>
                                        <FiLink /> Auto-deduct {supply.deduct_per_sale}x per penjualan
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => openAdjustModal(supply)} className="btn btn-secondary" style={{ flex: 1, fontSize: '14px' }}>
                                        Sesuaikan
                                    </button>
                                    <button onClick={() => openEditModal(supply)} className="btn btn-secondary" style={{ padding: '8px' }}>
                                        <FiEdit2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }} className="animate-fadeIn">
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '16px' }}>
                            {editingSupply ? 'Edit Bahan' : 'Tambah Bahan Baru'}
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="label">Nama Bahan</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="Plastik Es Kristal 5kg" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="label">SKU</label>
                                    <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="input" placeholder="PLT-5KG" required disabled={!!editingSupply} />
                                </div>
                                <div>
                                    <label className="label">Satuan</label>
                                    <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="input" placeholder="pcs" required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Minimum Stok (Warning)</label>
                                <input type="number" min="0" value={formData.min_stock} onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })} className="input" />
                            </div>
                            <div>
                                <label className="label">Link ke Produk (Auto-deduct saat jual)</label>
                                <select value={formData.linked_product_id} onChange={(e) => setFormData({ ...formData, linked_product_id: e.target.value })} className="input">
                                    <option value="">Tidak ada</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            {formData.linked_product_id && (
                                <div>
                                    <label className="label">Jumlah dikurangi per penjualan</label>
                                    <input type="number" min="1" value={formData.deduct_per_sale} onChange={(e) => setFormData({ ...formData, deduct_per_sale: e.target.value })} className="input" />
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Batal</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingSupply ? 'Update' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Adjust Stock Modal */}
            {showAdjustModal && adjustingSupply && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }} className="animate-fadeIn">
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '16px' }}>Sesuaikan Stok</h2>
                        <p style={{ color: '#6B7280', marginBottom: '16px' }}>{adjustingSupply.name} - Stok saat ini: <strong>{adjustingSupply.current_stock}</strong></p>
                        <form onSubmit={handleAdjust} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="label">Jumlah (+ atau -)</label>
                                <input type="number" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} className="input" placeholder="Contoh: 50 atau -10" required />
                                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Gunakan angka negatif untuk mengurangi</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setShowAdjustModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Batal</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
