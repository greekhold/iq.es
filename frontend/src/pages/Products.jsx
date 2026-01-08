import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiBox, FiRefreshCw, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsApi, inventoryApi } from '../api';
import useAuthStore from '../hooks/useAuth';

export default function Products() {
    const { isAdmin } = useAuthStore();
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [adjustingProduct, setAdjustingProduct] = useState(null);
    const [adjustQty, setAdjustQty] = useState('');
    const [formData, setFormData] = useState({ name: '', sku: '', weight_kg: '', requires_stock: true });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load products first
            const productsRes = await productsApi.getAll(false);
            setProducts(productsRes.data || productsRes || []);

            // Try to load stock data (may fail if no movements yet)
            try {
                const stocksRes = await inventoryApi.getStock();
                const stockData = stocksRes.data || stocksRes || [];
                const stockMap = {};
                stockData.forEach(s => {
                    stockMap[s.product_id] = s.current_stock || 0;
                });
                setStocks(stockMap);
            } catch (stockError) {
                console.log('No stock data yet');
                setStocks({});
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            toast.error('Gagal memuat produk');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await productsApi.update(editingProduct.id, formData);
                toast.success('Produk berhasil diupdate');
            } else {
                await productsApi.create(formData);
                toast.success('Produk berhasil ditambahkan');
            }
            setShowModal(false);
            setEditingProduct(null);
            setFormData({ name: '', sku: '', weight_kg: '', requires_stock: true });
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
        }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        try {
            await inventoryApi.adjustment({
                product_id: adjustingProduct.id,
                quantity: parseInt(adjustQty),
            });
            toast.success('Stok berhasil disesuaikan');
            setShowAdjustModal(false);
            setAdjustingProduct(null);
            setAdjustQty('');
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyesuaikan stok');
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku,
            weight_kg: product.weight_kg,
            requires_stock: product.requires_stock,
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', sku: '', weight_kg: '', requires_stock: true });
        setShowModal(true);
    };

    const openAdjustModal = (product) => {
        setAdjustingProduct(product);
        setAdjustQty('');
        setShowAdjustModal(true);
    };

    const getProductStock = (productId) => {
        return stocks[productId] || 0;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Manajemen Produk & Stok</h1>
                    <p style={{ color: '#6B7280', marginTop: '4px' }}>Kelola produk dan stok es kristal</p>
                </div>
                {isAdmin() && (
                    <button onClick={openCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiPlus /> Tambah Produk
                    </button>
                )}
            </div>

            {/* Products Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                    <div style={{ width: '32px', height: '32px', border: '4px solid #00ACC1', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {products.map((product) => (
                        <div key={product.id} className="card" style={{ position: 'relative' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        backgroundColor: product.requires_stock ? '#E0F7FA' : '#EDE9FE',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {product.requires_stock ? (
                                            <FiBox style={{ width: '24px', height: '24px', color: '#00ACC1' }} />
                                        ) : (
                                            <FiZap style={{ width: '24px', height: '24px', color: '#7C3AED' }} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: '600', color: '#1F2937', margin: 0 }}>{product.name}</h3>
                                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{product.sku}</p>
                                    </div>
                                </div>
                                {isAdmin() && (
                                    <button
                                        onClick={() => openEditModal(product)}
                                        style={{ padding: '8px', color: '#9CA3AF', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#00ACC1'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}
                                    >
                                        <FiEdit2 style={{ width: '16px', height: '16px' }} />
                                    </button>
                                )}
                            </div>

                            {/* Info */}
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Berat</p>
                                        <p style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>{product.weight_kg} kg</p>
                                    </div>
                                    {product.requires_stock ? (
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Stok</p>
                                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: getProductStock(product.id) > 0 ? '#059669' : '#DC2626', margin: 0 }}>
                                                {getProductStock(product.id)}
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            backgroundColor: '#EDE9FE',
                                            color: '#7C3AED',
                                            borderRadius: '9999px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            <FiZap style={{ width: '14px', height: '14px' }} />
                                            Langsung Jual
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {product.requires_stock && isAdmin() && (
                                    <button
                                        onClick={() => openAdjustModal(product)}
                                        className="btn btn-secondary"
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <FiRefreshCw style={{ width: '16px', height: '16px' }} />
                                        Sesuaikan Stok
                                    </button>
                                )}
                            </div>

                            {/* Status Badge */}
                            <div style={{ position: 'absolute', top: '12px', right: '48px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    fontSize: '10px',
                                    fontWeight: '500',
                                    borderRadius: '9999px',
                                    backgroundColor: product.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                                    color: product.status === 'active' ? '#059669' : '#DC2626'
                                }}>
                                    {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }} className="animate-fadeIn">
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '16px' }}>
                            {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="label">Nama Produk</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    placeholder="Es Kristal 5kg"
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="label">SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="input"
                                        placeholder="ICE-5KG"
                                        required
                                        disabled={!!editingProduct}
                                    />
                                </div>
                                <div>
                                    <label className="label">Berat (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.weight_kg}
                                        onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                                        className="input"
                                        placeholder="5.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.requires_stock}
                                        onChange={(e) => setFormData({ ...formData, requires_stock: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span className="label" style={{ margin: 0 }}>Perlu stok (produksi dulu)</span>
                                </label>
                                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                                    {formData.requires_stock
                                        ? 'Es kristal, es buntel - harus diproduksi dulu baru bisa dijual'
                                        : 'Galon - langsung jual tanpa perlu stok'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {editingProduct ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Adjust Stock Modal */}
            {showAdjustModal && adjustingProduct && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }} className="animate-fadeIn">
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '16px' }}>Sesuaikan Stok</h2>
                        <p style={{ color: '#6B7280', marginBottom: '16px' }}>
                            {adjustingProduct.name} - Stok saat ini: <strong>{getProductStock(adjustingProduct.id)}</strong>
                        </p>
                        <form onSubmit={handleAdjust} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="label">Jumlah Penyesuaian</label>
                                <input
                                    type="number"
                                    value={adjustQty}
                                    onChange={(e) => setAdjustQty(e.target.value)}
                                    className="input"
                                    placeholder="Contoh: 50 atau -10"
                                    required
                                />
                                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                                    Gunakan angka positif untuk menambah, negatif untuk mengurangi
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setShowAdjustModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
