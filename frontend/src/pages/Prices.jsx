import { useState, useEffect } from 'react';
import { FiPlus, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { pricesApi, productsApi } from '../api';
import client from '../api/client';

export default function Prices() {
    const [prices, setPrices] = useState([]);
    const [products, setProducts] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        price: '',
        sales_channel: 'ALL',
        role_ids: [],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pricesRes, productsRes, rolesRes] = await Promise.all([
                pricesApi.getAll(),
                productsApi.getAll(true),
                client.get('/roles'),
            ]);
            setPrices(pricesRes.data || pricesRes || []);
            setProducts(productsRes.data || productsRes || []);
            setRoles(rolesRes.data?.data || rolesRes.data || []);
        } catch (error) {
            toast.error('Gagal memuat data harga');
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

    const groupedPrices = products.map((product) => ({
        ...product,
        prices: prices.filter((p) => p.product_id === product.id),
    }));

    const togglePriceStatus = async (price) => {
        try {
            await pricesApi.update(price.id, { is_active: !price.is_active });
            toast.success(`Harga berhasil ${price.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
            loadData();
        } catch (error) {
            toast.error('Gagal mengubah status harga');
        }
    };

    const handleRoleToggle = (roleId) => {
        setFormData(prev => ({
            ...prev,
            role_ids: prev.role_ids.includes(roleId)
                ? prev.role_ids.filter(id => id !== roleId)
                : [...prev.role_ids, roleId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.product_id || !formData.price) {
            toast.error('Produk dan harga wajib diisi');
            return;
        }
        if (formData.role_ids.length === 0) {
            toast.error('Pilih minimal 1 role');
            return;
        }

        setSubmitting(true);
        try {
            await pricesApi.create({
                product_id: formData.product_id,
                price: parseFloat(formData.price),
                sales_channel: formData.sales_channel,
                role_ids: formData.role_ids,
            });
            toast.success('Harga berhasil ditambahkan');
            setShowModal(false);
            setFormData({ product_id: '', price: '', sales_channel: 'ALL', role_ids: [] });
            loadData();
        } catch (error) {
            console.error('Failed to create price:', error);
            toast.error(error.response?.data?.message || 'Gagal menambah harga');
        } finally {
            setSubmitting(false);
        }
    };

    const openAddModal = () => {
        setFormData({ product_id: '', price: '', sales_channel: 'ALL', role_ids: [] });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Harga</h1>
                    <p className="text-gray-500 mt-1">Atur harga produk berdasarkan role</p>
                </div>
                <button onClick={openAddModal} className="btn btn-primary inline-flex items-center gap-2">
                    <FiPlus className="w-5 h-5" />
                    <span>Tambah Harga</span>
                </button>
            </div>

            {/* Prices by Product */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedPrices.map((product) => (
                        <div key={product.id} className="card">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                                    <FiDollarSign className="w-6 h-6 text-cyan-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.sku}</p>
                                </div>
                            </div>

                            {product.prices.length === 0 ? (
                                <p className="text-gray-400 text-sm">Belum ada harga</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {product.prices.map((price) => (
                                        <div
                                            key={price.id}
                                            className={`p-4 rounded-xl border-2 ${price.is_active
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-gray-200 bg-gray-50 opacity-60'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-800">
                                                        {formatCurrency(price.price)}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Channel: {price.sales_channel === 'ALL' ? 'Semua' : price.sales_channel === 'FACTORY' ? 'Pabrik' : 'Lapangan'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => togglePriceStatus(price)}
                                                    className={`text-xs px-2 py-1 rounded-full ${price.is_active
                                                        ? 'bg-green-200 text-green-700'
                                                        : 'bg-gray-200 text-gray-600'
                                                        }`}
                                                >
                                                    {price.is_active ? 'Aktif' : 'Nonaktif'}
                                                </button>
                                            </div>
                                            {price.role_access?.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs text-gray-500 mb-1">Roles:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {price.role_access.map((ra) => (
                                                            <span key={ra.id} className="badge badge-info text-xs">
                                                                {ra.role?.display_name || ra.role?.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Price Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }} className="animate-fadeIn">
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', marginBottom: '16px' }}>Tambah Harga Baru</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="label">Produk *</label>
                                <select
                                    value={formData.product_id}
                                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                    className="input"
                                    required
                                >
                                    <option value="">Pilih Produk</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Harga (Rp) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="input"
                                    placeholder="5000"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Channel Penjualan</label>
                                <select
                                    value={formData.sales_channel}
                                    onChange={(e) => setFormData({ ...formData, sales_channel: e.target.value })}
                                    className="input"
                                >
                                    <option value="ALL">Semua Channel</option>
                                    <option value="FACTORY">Pabrik</option>
                                    <option value="FIELD">Lapangan</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Role yang dapat mengakses harga ini *</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {roles.map(role => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => handleRoleToggle(role.id)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '9999px',
                                                border: formData.role_ids.includes(role.id) ? '2px solid #00ACC1' : '2px solid #E5E7EB',
                                                backgroundColor: formData.role_ids.includes(role.id) ? '#E0F7FA' : 'white',
                                                color: formData.role_ids.includes(role.id) ? '#00838F' : '#6B7280',
                                                fontWeight: formData.role_ids.includes(role.id) ? '600' : '400',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {role.display_name}
                                        </button>
                                    ))}
                                </div>
                                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                                    Klik untuk memilih/deselect role
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                    disabled={submitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
