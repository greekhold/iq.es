import { useState, useEffect } from 'react';
import { FiPlus, FiClock, FiPackage, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productionApi, productsApi } from '../api';
import useAuthStore from '../hooks/useAuth';

export default function Production() {
    const { isAdmin } = useAuthStore();
    const [records, setRecords] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        quantity: '',
        machine_on_at: '',
        machine_off_at: '',
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [recordsRes, productsRes] = await Promise.all([
                productionApi.getAll({ per_page: 30 }),
                productsApi.getAll(true),
            ]);
            setRecords(recordsRes.data?.data || recordsRes.data || []);
            setProducts(productsRes.data || []);
        } catch (error) {
            toast.error('Gagal memuat data produksi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await productionApi.create(formData);
            toast.success('Produksi berhasil dicatat');
            setShowModal(false);
            setFormData({ product_id: '', quantity: '', machine_on_at: '', machine_off_at: '', notes: '' });
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mencatat produksi');
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = async (record) => {
        if (!confirm(`Hapus produksi ${record.product?.name}?`)) return;
        try {
            await productionApi.delete(record.id);
            toast.success('Produksi berhasil dihapus');
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus produksi');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Produksi</h1>
                    <p className="text-gray-500 mt-1">Catat hasil produksi es kristal</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary inline-flex items-center gap-2">
                    <FiPlus className="w-5 h-5" />
                    <span>Catat Produksi</span>
                </button>
            </div>

            {/* Production Records */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-12">
                        <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Belum ada catatan produksi</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Produk</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Jumlah</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Mesin ON</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Mesin OFF</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Operator</th>
                                    {isAdmin() && (
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {records.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-600">{formatDate(record.created_at)}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{record.product?.name}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                                                +{record.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            <div className="flex items-center justify-center gap-1">
                                                <FiClock className="w-4 h-4 text-gray-400" />
                                                {formatTime(record.machine_on_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            <div className="flex items-center justify-center gap-1">
                                                <FiClock className="w-4 h-4 text-gray-400" />
                                                {formatTime(record.machine_off_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{record.created_by?.name || '-'}</td>
                                        {isAdmin() && (
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleDelete(record)} className="text-gray-400 hover:text-red-500" title="Hapus">
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Catat Produksi Baru</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Produk</label>
                                <select
                                    value={formData.product_id}
                                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                    className="input"
                                    required
                                >
                                    <option value="">Pilih produk</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Jumlah Produksi</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="input"
                                    placeholder="Contoh: 100"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Mesin ON</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.machine_on_at}
                                        onChange={(e) => setFormData({ ...formData, machine_on_at: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Mesin OFF</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.machine_off_at}
                                        onChange={(e) => setFormData({ ...formData, machine_off_at: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Catatan</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="input"
                                    rows={2}
                                    placeholder="Catatan tambahan (opsional)"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn btn-secondary">
                                    Batal
                                </button>
                                <button type="submit" className="flex-1 btn btn-primary">
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
