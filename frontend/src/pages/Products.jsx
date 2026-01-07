import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiBox } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsApi } from '../api';
import useAuthStore from '../hooks/useAuth';

export default function Products() {
    const { isAdmin } = useAuthStore();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', sku: '', weight_kg: '' });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await productsApi.getAll(false);
            setProducts(response.data || []);
        } catch (error) {
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
            setFormData({ name: '', sku: '', weight_kg: '' });
            loadProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku,
            weight_kg: product.weight_kg,
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setFormData({ name: '', sku: '', weight_kg: '' });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
                    <p className="text-gray-500 mt-1">Daftar produk es kristal</p>
                </div>
                {isAdmin() && (
                    <button onClick={openCreateModal} className="btn btn-primary inline-flex items-center gap-2">
                        <FiPlus className="w-5 h-5" />
                        <span>Tambah Produk</span>
                    </button>
                )}
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                                        <FiBox className="w-6 h-6 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                        <p className="text-sm text-gray-500">{product.sku}</p>
                                    </div>
                                </div>
                                {isAdmin() && (
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Berat</p>
                                    <p className="font-semibold text-gray-800">{product.weight_kg} kg</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Stok</p>
                                    <p className="font-semibold text-gray-800">{product.current_stock || 0} pcs</p>
                                </div>
                                <span className={`badge ${product.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                    {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 btn btn-secondary"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="flex-1 btn btn-primary">
                                    {editingProduct ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
